import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

// Validation schemas
const clockInSchema = z.object({
  shiftId: z.string().uuid(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

const clockOutSchema = z.object({
  shiftId: z.string().uuid(),
});

/**
 * POST /attendance/clockin
 * Clock in for a shift
 */
router.post('/clockin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = clockInSchema.parse(req.body);

    // Verify shift belongs to user
    const shift = await prisma.shift.findUnique({
      where: { id: data.shiftId },
    });

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    if (shift.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized for this shift' });
    }

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: { shiftId: data.shiftId },
      update: {
        clockIn: new Date(),
        status: 'ON_SHIFT',
        location: data.location || undefined,
      },
      create: {
        shiftId: data.shiftId,
        clockIn: new Date(),
        status: 'ON_SHIFT',
        location: data.location || undefined,
      },
    });

    res.json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error clocking in:', error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

/**
 * POST /attendance/clockout
 * Clock out from a shift
 */
router.post('/clockout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = clockOutSchema.parse(req.body);

    // Verify shift belongs to user
    const shift = await prisma.shift.findUnique({
      where: { id: data.shiftId },
    });

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    if (shift.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized for this shift' });
    }

    // Update attendance record
    const attendance = await prisma.attendance.update({
      where: { shiftId: data.shiftId },
      data: {
        clockOut: new Date(),
        status: 'COMPLETED',
      },
    });

    // Update shift status
    await prisma.shift.update({
      where: { id: data.shiftId },
      data: { status: 'COMPLETED' },
    });

    res.json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error clocking out:', error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

/**
 * GET /attendance/today
 * Get today's attendance records (for managers)
 */
router.get('/today', requireAuth, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shifts = await prisma.shift.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['PUBLISHED', 'COMPLETED'],
        },
      },
      include: {
        user: true,
        role: true,
        attendances: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    res.json(shifts);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

/**
 * GET /attendance/shift/:shiftId
 * Get attendance for a specific shift
 */
router.get('/shift/:shiftId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { shiftId } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { shiftId },
      include: {
        shift: {
          include: {
            user: true,
            role: true,
          },
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

export default router;
