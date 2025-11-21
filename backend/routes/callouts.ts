import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';
import { sendCalloutNotification } from '../services/notificationService';

const router = Router();

// Validation schema
const createCalloutSchema = z.object({
  shiftId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

/**
 * POST /callout
 * Submit a callout for a shift
 */
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = createCalloutSchema.parse(req.body);

    // Verify shift belongs to user
    const shift = await prisma.shift.findUnique({
      where: { id: data.shiftId },
      include: { user: true },
    });

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    if (shift.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized for this shift' });
    }

    // Create callout
    const callout = await prisma.callout.create({
      data: {
        userId: req.userId!,
        shiftId: data.shiftId,
        reason: data.reason,
      },
      include: {
        user: true,
        shift: true,
      },
    });

    // Update shift status to cancelled
    await prisma.shift.update({
      where: { id: data.shiftId },
      data: { status: 'CANCELLED' },
    });

    // Get all managers
    const managers = await prisma.user.findMany({
      where: { role: 'OPERATOR' },
      select: { id: true },
    });

    // Send notifications to managers
    await sendCalloutNotification(
      managers.map(m => m.id),
      shift.user.name,
      shift
    );

    res.status(201).json(callout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating callout:', error);
    res.status(500).json({ error: 'Failed to create callout' });
  }
});

/**
 * GET /callout/open
 * Get all open callouts (for managers)
 */
router.get('/open', requireAuth, async (req: AuthRequest, res) => {
  try {
    const callouts = await prisma.callout.findMany({
      where: {
        shift: {
          status: 'CANCELLED',
          startTime: {
            gte: new Date(),
          },
        },
      },
      include: {
        user: true,
        shift: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(callouts);
  } catch (error) {
    console.error('Error fetching callouts:', error);
    res.status(500).json({ error: 'Failed to fetch callouts' });
  }
});

/**
 * GET /callout/user/:userId
 * Get callouts for a specific user
 */
router.get('/user/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own callouts unless they're a manager
    if (req.userId !== userId && req.userRole !== 'OPERATOR') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const callouts = await prisma.callout.findMany({
      where: { userId },
      include: {
        shift: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(callouts);
  } catch (error) {
    console.error('Error fetching user callouts:', error);
    res.status(500).json({ error: 'Failed to fetch callouts' });
  }
});

export default router;
