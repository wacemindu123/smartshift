import { Router } from 'express';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

/**
 * GET /shift-swaps
 * List shift swap requests
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const where = req.userRole === 'OPERATOR' 
      ? {} 
      : { 
          OR: [
            { requesterId: req.userId },
            { targetUserId: req.userId },
            { status: 'PENDING' as const }, // Show available swaps to all employees
          ]
        };

    const swaps = await prisma.shiftSwap.findMany({
      where,
      include: {
        shift: {
          include: {
            role: true,
          },
        },
        requester: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(swaps);
  } catch (error) {
    console.error('Error fetching shift swaps:', error);
    res.status(500).json({ error: 'Failed to fetch shift swaps' });
  }
});

/**
 * POST /shift-swaps
 * Request a shift swap
 */
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { shiftId } = req.body;

    if (!shiftId) {
      return res.status(400).json({ error: 'Shift ID required' });
    }

    // Verify user owns the shift
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    if (shift.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only swap your own shifts' });
    }

    const swap = await prisma.shiftSwap.create({
      data: {
        shiftId,
        requesterId: req.userId!,
      },
      include: {
        shift: { include: { role: true } },
        requester: { select: { id: true, name: true } },
      },
    });

    // TODO: Notify other employees about available swap

    res.json(swap);
  } catch (error) {
    console.error('Error creating shift swap:', error);
    res.status(500).json({ error: 'Failed to create shift swap' });
  }
});

/**
 * PATCH /shift-swaps/:id/claim
 * Claim a shift swap
 */
router.patch('/:id/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const swap = await prisma.shiftSwap.findUnique({
      where: { id },
      include: { shift: true },
    });

    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.status !== 'PENDING') {
      return res.status(400).json({ error: 'Swap already claimed or processed' });
    }

    if (swap.requesterId === req.userId) {
      return res.status(400).json({ error: 'Cannot claim your own swap' });
    }

    const updated = await prisma.shiftSwap.update({
      where: { id },
      data: {
        status: 'CLAIMED',
        targetUserId: req.userId,
      },
      include: {
        shift: { include: { role: true } },
        requester: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    });

    // TODO: Notify requester and manager

    res.json(updated);
  } catch (error) {
    console.error('Error claiming swap:', error);
    res.status(500).json({ error: 'Failed to claim swap' });
  }
});

/**
 * PATCH /shift-swaps/:id/approve
 * Approve shift swap (operators only)
 */
router.patch('/:id/approve', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const swap = await prisma.shiftSwap.findUnique({
      where: { id },
      include: { shift: true },
    });

    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.status !== 'CLAIMED') {
      return res.status(400).json({ error: 'Swap must be claimed before approval' });
    }

    if (!swap.targetUserId) {
      return res.status(400).json({ error: 'No target user for swap' });
    }

    // Update shift ownership and approve swap
    await prisma.$transaction([
      prisma.shift.update({
        where: { id: swap.shiftId },
        data: { userId: swap.targetUserId },
      }),
      prisma.shiftSwap.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: req.userId,
          approvedAt: new Date(),
        },
      }),
    ]);

    const updated = await prisma.shiftSwap.findUnique({
      where: { id },
      include: {
        shift: { include: { role: true, user: true } },
        requester: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    });

    // TODO: Send SMS notifications

    res.json(updated);
  } catch (error) {
    console.error('Error approving swap:', error);
    res.status(500).json({ error: 'Failed to approve swap' });
  }
});

/**
 * PATCH /shift-swaps/:id/deny
 * Deny shift swap (operators only)
 */
router.patch('/:id/deny', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updated = await prisma.shiftSwap.update({
      where: { id },
      data: {
        status: 'DENIED',
        approvedBy: req.userId,
        approvedAt: new Date(),
        denialReason: reason,
      },
      include: {
        shift: { include: { role: true } },
        requester: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error denying swap:', error);
    res.status(500).json({ error: 'Failed to deny swap' });
  }
});

/**
 * DELETE /shift-swaps/:id
 * Cancel shift swap request
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const swap = await prisma.shiftSwap.findUnique({ where: { id } });
    
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.requesterId !== req.userId && req.userRole !== 'OPERATOR') {
      return res.status(403).json({ error: 'Cannot cancel others swaps' });
    }

    await prisma.shiftSwap.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Swap cancelled' });
  } catch (error) {
    console.error('Error cancelling swap:', error);
    res.status(500).json({ error: 'Failed to cancel swap' });
  }
});

export default router;
