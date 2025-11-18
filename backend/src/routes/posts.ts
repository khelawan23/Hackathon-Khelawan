import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const postSchema = z.object({
  text: z
    .string()
    .min(1, 'Post text cannot be empty')
    .max(500, 'Post text cannot exceed 500 characters'),
});

router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      posts: posts.map((post) => ({
        id: post.id,
        text: post.text,
        timestamp: post.createdAt,
        author: {
          id: post.author.id,
          displayName: post.author.name,
          email: post.author.email,
        },
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[posts/get]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get posts by current authenticated user
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      posts: posts.map((post) => ({
        id: post.id,
        text: post.text,
        timestamp: post.createdAt,
        author: {
          id: post.author.id,
          displayName: post.author.name,
          email: post.author.email,
        },
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[posts/get-my-posts]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get posts by specific user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      posts: posts.map((post) => ({
        id: post.id,
        text: post.text,
        timestamp: post.createdAt,
        author: {
          id: post.author.id,
          displayName: post.author.name,
          email: post.author.email,
        },
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[posts/get-user-posts]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data = postSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        text: data.text,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notifications for all followers
    const followers = await prisma.follow.findMany({
      where: { followingId: req.user.id },
      select: { followerId: true },
    });

    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map((follower) => ({
          type: 'new_post',
          userId: follower.followerId,
          actorId: req.user!.id,
          postId: post.id,
        })),
      });
    }

    return res.status(201).json({
      id: post.id,
      text: post.text,
      timestamp: post.createdAt,
      author: {
        id: post.author.id,
        displayName: post.author.name,
        email: post.author.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }

    // eslint-disable-next-line no-console
    console.error('[posts/create]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

