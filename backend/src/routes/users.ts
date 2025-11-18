import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get current user profile with stats
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      displayName: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        following: user._count.following,
        followers: user._count.followers,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[users/me]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile by ID with stats
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      displayName: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        following: user._count.following,
        followers: user._count.followers,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[users/get-by-id]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
