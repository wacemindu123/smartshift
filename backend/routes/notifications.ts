import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

/**
 * GET /notifications
 * Get notifications for the authenticated user
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { unreadOnly } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId!,
        ...(unreadOnly === 'true' && { read: false }),
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 50, // Limit to last 50 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /notifications/unread/count
 * Get count of unread notifications
 */
router.get('/unread/count', requireAuth, async (req: AuthRequest, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.userId!,
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ error: 'Failed to count notifications' });
  }
});

/**
 * PATCH /notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.userId!,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ count: result.count });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
