import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import * as scheduleService from '../services/scheduleService';

const router = Router();

// Validation schemas
const createShiftSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

const updateShiftSchema = z.object({
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']).optional(),
});

const publishShiftsSchema = z.object({
  shiftIds: z.array(z.string().uuid()),
});

/**
 * GET /shifts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get shifts for a date range
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const shifts = await scheduleService.getShiftsByWeek(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

/**
 * GET /shifts/my
 * Get shifts for the authenticated user
 */
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    const shifts = await scheduleService.getShiftsByUser(req.userId!);
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching user shifts:', error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

/**
 * GET /shifts/next
 * Get next shift for the authenticated user
 */
router.get('/next', requireAuth, async (req: AuthRequest, res) => {
  try {
    const shift = await scheduleService.getNextShift(req.userId!);
    res.json(shift);
  } catch (error) {
    console.error('Error fetching next shift:', error);
    res.status(500).json({ error: 'Failed to fetch next shift' });
  }
});

/**
 * POST /shifts
 * Create a new shift (operators only)
 */
router.post('/', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const data = createShiftSchema.parse(req.body);
    
    const shift = await scheduleService.createShift({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });

    res.status(201).json(shift);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

/**
 * PUT /shifts/:id
 * Update a shift (operators only)
 */
router.put('/:id', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateShiftSchema.parse(req.body);
    
    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);

    const shift = await scheduleService.updateShift(id, updateData, req.userId!);

    res.json(shift);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating shift:', error);
    res.status(500).json({ error: 'Failed to update shift' });
  }
});

/**
 * DELETE /shifts/:id
 * Delete a shift (operators only)
 */
router.delete('/:id', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await scheduleService.deleteShift(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});

/**
 * POST /shifts/publish
 * Publish multiple shifts (operators only)
 */
router.post('/publish', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { shiftIds } = publishShiftsSchema.parse(req.body);
    const result = await scheduleService.publishShifts(shiftIds);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error publishing shifts:', error);
    res.status(500).json({ error: 'Failed to publish shifts' });
  }
});

export default router;
