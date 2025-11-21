import { Router } from 'express';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

/**
 * GET /availability-changes
 * List availability change requests
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const where = req.userRole === 'OPERATOR' 
      ? {} 
      : { userId: req.userId };

    const requests = await prisma.availabilityChangeRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching availability change requests:', error);
    res.status(500).json({ error: 'Failed to fetch availability change requests' });
  }
});

/**
 * POST /availability-changes
 * Request an availability change
 */
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { requestedChanges, reason } = req.body;

    if (!requestedChanges) {
      return res.status(400).json({ error: 'Requested changes required' });
    }

    // Get the database user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const request = await prisma.availabilityChangeRequest.create({
      data: {
        userId: user.id,
        requestedChanges,
        reason,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // TODO: Create notification for managers

    res.json(request);
  } catch (error) {
    console.error('Error creating availability change request:', error);
    res.status(500).json({ error: 'Failed to create availability change request' });
  }
});

/**
 * PATCH /availability-changes/:id/approve
 * Approve availability change (operators only)
 */
router.patch('/:id/approve', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.availabilityChangeRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Update user's availability and approve request
    await prisma.$transaction([
      prisma.user.update({
        where: { id: request.userId },
        data: { availability: request.requestedChanges as any },
      }),
      prisma.availabilityChangeRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy: req.userId,
          reviewedAt: new Date(),
        },
      }),
    ]);

    const updated = await prisma.availabilityChangeRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });

    // TODO: Send notification to employee

    res.json(updated);
  } catch (error) {
    console.error('Error approving availability change:', error);
    res.status(500).json({ error: 'Failed to approve availability change' });
  }
});

/**
 * PATCH /availability-changes/:id/deny
 * Deny availability change (operators only)
 */
router.patch('/:id/deny', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updated = await prisma.availabilityChangeRequest.update({
      where: { id },
      data: {
        status: 'DENIED',
        reviewedBy: req.userId,
        reviewedAt: new Date(),
        denialReason: reason,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });

    // TODO: Send notification to employee

    res.json(updated);
  } catch (error) {
    console.error('Error denying availability change:', error);
    res.status(500).json({ error: 'Failed to deny availability change' });
  }
});

/**
 * DELETE /availability-changes/:id
 * Cancel availability change request
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.availabilityChangeRequest.findUnique({ where: { id } });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.userId !== req.userId && req.userRole !== 'OPERATOR') {
      return res.status(403).json({ error: 'Cannot cancel others requests' });
    }

    await prisma.availabilityChangeRequest.delete({ where: { id } });

    res.json({ message: 'Request cancelled' });
  } catch (error) {
    console.error('Error cancelling availability change:', error);
    res.status(500).json({ error: 'Failed to cancel availability change' });
  }
});

export default router;
