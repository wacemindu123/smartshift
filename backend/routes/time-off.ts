import { Router } from 'express';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

/**
 * GET /time-off
 * List time-off requests (operators see all, employees see their own)
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Get database user ID from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId! } });
    const where = req.userRole === 'OPERATOR' ? {} : { userId: user?.id };

    const requests = await prisma.timeOffRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching time-off requests:', error);
    res.status(500).json({ error: 'Failed to fetch time-off requests' });
  }
});

/**
 * POST /time-off
 * Create time-off request
 */
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }

    // Get database user ID from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId! } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const request = await prisma.timeOffRequest.create({
      data: {
        userId: user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(request);
  } catch (error) {
    console.error('Error creating time-off request:', error);
    res.status(500).json({ error: 'Failed to create time-off request' });
  }
});

/**
 * PATCH /time-off/:id/approve
 * Approve time-off request (operators only)
 */
router.patch('/:id/approve', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get database user ID from Clerk ID
    const reviewer = await prisma.user.findUnique({ where: { clerkId: req.userId! } });

    const request = await prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewer?.id,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
      },
    });

    // TODO: Send SMS notification
    // await smsService.sendNotification(request.userId, SmsType.TIME_OFF_APPROVED, {...});

    res.json(request);
  } catch (error) {
    console.error('Error approving time-off:', error);
    res.status(500).json({ error: 'Failed to approve time-off' });
  }
});

/**
 * PATCH /time-off/:id/deny
 * Deny time-off request (operators only)
 */
router.patch('/:id/deny', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get database user ID from Clerk ID
    const reviewer = await prisma.user.findUnique({ where: { clerkId: req.userId! } });

    const request = await prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: 'DENIED',
        reviewedBy: reviewer?.id,
        reviewedAt: new Date(),
        denialReason: reason,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // TODO: Send SMS notification
    // await smsService.sendNotification(request.userId, SmsType.TIME_OFF_DENIED, {...});

    res.json(request);
  } catch (error) {
    console.error('Error denying time-off:', error);
    res.status(500).json({ error: 'Failed to deny time-off' });
  }
});

/**
 * DELETE /time-off/:id
 * Cancel time-off request (own requests only)
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.timeOffRequest.findUnique({ where: { id } });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get database user ID from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId! } });

    if (request.userId !== user?.id && req.userRole !== 'OPERATOR') {
      return res.status(403).json({ error: 'Cannot delete others requests' });
    }

    await prisma.timeOffRequest.delete({ where: { id } });

    res.json({ message: 'Request cancelled' });
  } catch (error) {
    console.error('Error deleting time-off:', error);
    res.status(500).json({ error: 'Failed to delete time-off' });
  }
});

export default router;
