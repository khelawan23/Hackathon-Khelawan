"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all notifications for current user
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const notifications = await prisma_1.default.notification.findMany({
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
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[notifications/get]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Mark notification as read
router.patch('/:notificationId/read', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { notificationId } = req.params;
        const notification = await prisma_1.default.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updated = await prisma_1.default.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
        return res.json({ message: 'Notification marked as read', notification: updated });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[notifications/mark-read]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Mark all notifications as read
router.patch('/read-all', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await prisma_1.default.notification.updateMany({
            where: {
                userId: req.user.id,
                read: false,
            },
            data: { read: true },
        });
        return res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[notifications/mark-all-read]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Get unread notification count
router.get('/unread-count', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const count = await prisma_1.default.notification.count({
            where: {
                userId: req.user.id,
                read: false,
            },
        });
        return res.json({ count });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[notifications/unread-count]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
