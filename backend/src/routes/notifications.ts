import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get all notifications for current user
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
        actor: {
          id: n.actor.id,
          displayName: n.actor.name,
          email: n.actor.email,
        },
        post: n.post
          ? {
              id: n.post.id,
              text: n.post.text,
            }
          : null,
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[notifications/get]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return res.json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[notifications/mark-read]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        read: false,
      },
      data: { read: true },
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[notifications/mark-all-read]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        read: false,
      },
    });

    return res.json({ count });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[notifications/unread-count]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
