"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const postSchema = zod_1.z.object({
    text: zod_1.z
        .string()
        .min(1, 'Post text cannot be empty')
        .max(500, 'Post text cannot exceed 500 characters'),
});
router.get('/', async (_req, res) => {
    try {
        const posts = await prisma_1.default.post.findMany({
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
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[posts/get]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Get posts by current authenticated user
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const posts = await prisma_1.default.post.findMany({
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
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[posts/get-my-posts]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Get posts by specific user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await prisma_1.default.post.findMany({
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
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[posts/get-user-posts]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const data = postSchema.parse(req.body);
        const post = await prisma_1.default.post.create({
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
        const followers = await prisma_1.default.follow.findMany({
            where: { followingId: req.user.id },
            select: { followerId: true },
        });
        if (followers.length > 0) {
            await prisma_1.default.notification.createMany({
                data: followers.map((follower) => ({
                    type: 'new_post',
                    userId: follower.followerId,
                    actorId: req.user.id,
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        // eslint-disable-next-line no-console
        console.error('[posts/create]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
