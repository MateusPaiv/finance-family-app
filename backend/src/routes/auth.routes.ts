import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ status: "error", message: "Email already in use" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          paymentMethods: {
            create: {
              name: "Cash",
              type: "CASH",
              icon: "💵",
              isDefault: true,
            },
          },
          categories: {
            createMany: {
              data: [
                { name: "Shopping", emoji: "🛒" },
                { name: "Food", emoji: "🍔" },
                { name: "Transport", emoji: "🚗" },
                { name: "Health", emoji: "🏥" },
                { name: "Entertainment", emoji: "🎬" },
                { name: "Bills", emoji: "📄" },
              ],
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const token = generateToken(user.id, user.email);

      res.status(201).json({
        status: "success",
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ status: "error", message: "Invalid credentials" });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ status: "error", message: "Invalid credentials" });
        return;
      }

      const token = generateToken(user.id, user.email);

      res.json({
        status: "success",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/auth/me
router.get(
  "/me",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ status: "error", message: "User not found" });
        return;
      }

      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/auth/family
router.get(
  "/family",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        where: { id: { not: req.user!.userId } },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ status: "success", data: users });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
