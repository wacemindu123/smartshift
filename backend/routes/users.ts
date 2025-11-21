import { Router } from 'express';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';
import { clerkClient } from '@clerk/express';

const router = Router();

/**
 * GET /users/me
 * Get current user info
 */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId! },
    });

    if (!user) {
      // Create user if doesn't exist
      const clerkUser = await clerkClient.users.getUser(req.userId!);
      
      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || clerkUser.emailAddresses[0].emailAddress,
          email: clerkUser.emailAddresses[0].emailAddress,
          role: (clerkUser.publicMetadata?.role as 'OPERATOR' | 'EMPLOYEE') || 'EMPLOYEE',
        },
      });

      return res.json(newUser);
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * GET /users
 * Get all users (operators only)
 */
router.get('/', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: role ? { role: role as 'OPERATOR' | 'EMPLOYEE' } : undefined,
      orderBy: {
        name: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /users/:id
 * Get a specific user
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PATCH /users/:id
 * Update a user (operators can update any user, employees can update themselves)
 */
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { workRoleId, availability } = req.body;

    // Get the user to check ownership
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions: operators can update anyone, employees can only update themselves
    if (req.userRole !== 'OPERATOR' && req.userId !== targetUser.clerkId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const updateData: any = {};
    
    // Only operators can update work roles
    if (workRoleId !== undefined && req.userRole === 'OPERATOR') {
      updateData.workRoleId = workRoleId || null;
    }
    
    // Anyone can update their own availability
    if (availability !== undefined) {
      updateData.availability = availability;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /users/:id
 * Delete a user (operators only)
 */
router.delete('/:id', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
