import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const DATABASE_URL =
  process.env.DATABASE_URL || 'file:./dev.db'; // Prisma uses this automatically

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    '[config] JWT_SECRET not set. Using default dev secret. Set JWT_SECRET in your .env file for production.'
  );
}

