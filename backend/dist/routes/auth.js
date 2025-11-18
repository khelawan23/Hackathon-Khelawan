"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const config_1 = require("../config");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required').max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const createToken = (user) => jsonwebtoken_1.default.sign({
    sub: user.id,
    email: user.email,
    name: user.name,
}, config_1.JWT_SECRET, {
    expiresIn: '7d',
});
const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    displayName: user.name,
    createdAt: user.createdAt,
});
router.post('/signup', async (req, res) => {
    try {
        const data = signupSchema.parse(req.body);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name.trim(),
                email: data.email.toLowerCase(),
                passwordHash,
            },
        });
        const token = createToken(user);
        return res.status(201).json({ user: publicUser(user), token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        // eslint-disable-next-line no-console
        console.error('[auth/signup]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = createToken(user);
        return res.json({ user: publicUser(user), token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        // eslint-disable-next-line no-console
        console.error('[auth/login]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ user: publicUser(user) });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[auth/me]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
