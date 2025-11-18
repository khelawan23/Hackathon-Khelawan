import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Follow a user
router.post('/:userId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.params;

    // Can't follow yourself
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: req.user.id,
        followingId: userId,
      },
    });

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        type: 'follow',
        userId: userId,
        actorId: req.user.id,
      },
    });

    return res.status(201).json({ message: 'Successfully followed user', follow });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[follow/create]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/:userId', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.params;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    return res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[follow/delete]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get followers of a user
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      followers: followers.map((f) => ({
        id: f.follower.id,
        displayName: f.follower.name,
        email: f.follower.email,
        followedAt: f.createdAt,
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[follow/get-followers]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get users that a user is following
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      following: following.map((f) => ({
        id: f.following.id,
        displayName: f.following.name,
        email: f.following.email,
        followedAt: f.createdAt,
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[follow/get-following]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if current user is following a specific user
router.get('/:userId/status', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId } = req.params;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    return res.json({ isFollowing: !!follow });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[follow/check-status]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
