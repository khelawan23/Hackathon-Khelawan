import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { JWT_SECRET } from '../config';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createToken = (user: { id: string; email: string; name: string | null }) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

const publicUser = (user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  displayName: user.name,
  createdAt: user.createdAt,
});

router.post('/signup', async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        passwordHash,
      },
    });

    const token = createToken(user);

    return res.status(201).json({ user: publicUser(user), token });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    return res.json({ user: publicUser(user), token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }

    // eslint-disable-next-line no-console
    console.error('[auth/login]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[auth/me]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

