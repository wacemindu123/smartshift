import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

// Validation schema
const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
});

/**
 * GET /roles
 * Get all work roles
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const roles = await prisma.workRole.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * POST /roles
 * Create a new work role (operators only)
 */
router.post('/', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const data = createRoleSchema.parse(req.body);

    const role = await prisma.workRole.create({
      data: {
        name: data.name,
      },
    });

    res.status(201).json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

/**
 * PUT /roles/:id
 * Update a work role (operators only)
 */
router.put('/:id', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = createRoleSchema.parse(req.body);

    const role = await prisma.workRole.update({
      where: { id },
      data: {
        name: data.name,
      },
    });

    res.json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * DELETE /roles/:id
 * Delete a work role (operators only)
 */
router.delete('/:id', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.workRole.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;
