"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_URL = exports.JWT_SECRET = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
exports.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
exports.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db'; // Prisma uses this automatically
if (!process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.warn('[config] JWT_SECRET not set. Using default dev secret. Set JWT_SECRET in your .env file for production.');
}
