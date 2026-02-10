import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

// ─── Multer config ───────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `receipt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpeg", ".jpg", ".png", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed"));
    }
  },
});

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createExpenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  isShared: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
  sharedWith: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return JSON.parse(val) as { userId: string; splitAmount: number }[];
    }),
});

const updateExpenseSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  paymentMethodId: z.string().uuid().nullable().optional(),
  isShared: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// Helper: compute userAmount = total - sum of others' splits
function serializeExpense(e: any) {
  const amount = Number(e.amount);
  const sharedWith = e.sharedWith?.map((s: any) => ({
    ...s,
    splitAmount: Number(s.splitAmount),
  }));
  const othersTotal = sharedWith?.reduce((sum: number, s: any) => sum + s.splitAmount, 0) ?? 0;
  return {
    ...e,
    amount,
    userAmount: Math.round((amount - othersTotal) * 100) / 100,
    sharedWith: sharedWith ?? [],
  };
}

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ─── GET /api/expenses/shared/with-me  (before /:id) ────────────────────────

router.get(
  "/shared/with-me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const shared = await prisma.sharedExpense.findMany({
        where: { sharedWithId: userId },
        include: {
          expense: {
            include: { category: true, paymentMethod: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const data = shared.map((s) => ({
        ...s,
        splitAmount: Number(s.splitAmount),
        expense: {
          ...s.expense,
          amount: Number(s.expense.amount),
        },
      }));

      res.json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET /api/expenses/summary/monthly ───────────────────────────────────────

router.get(
  "/summary/monthly",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      const rawExpenses = await prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        include: {
          category: true,
          paymentMethod: true,
          sharedWith: {
            include: {
              sharedWith: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      const expenses = rawExpenses.map(serializeExpense);
      const totalSpent = expenses.reduce((sum, e) => sum + e.userAmount, 0);

      // Group by category
      const byCategory: Record<string, { name: string; emoji: string; total: number; count: number }> = {};
      for (const exp of expenses) {
        const key = exp.categoryId ?? "uncategorized";
        if (!byCategory[key]) {
          byCategory[key] = {
            name: exp.category?.name ?? "Uncategorized",
            emoji: exp.category?.emoji ?? "📁",
            total: 0,
            count: 0,
          };
        }
        byCategory[key].total += exp.userAmount;
        byCategory[key].count++;
      }

      // Group by payment method
      const byPaymentMethod: Record<string, { name: string; icon: string; total: number; count: number }> = {};
      for (const exp of expenses) {
        const key = exp.paymentMethodId ?? "none";
        if (!byPaymentMethod[key]) {
          byPaymentMethod[key] = {
            name: exp.paymentMethod?.name ?? "None",
            icon: exp.paymentMethod?.icon ?? "💳",
            total: 0,
            count: 0,
          };
        }
        byPaymentMethod[key].total += exp.userAmount;
        byPaymentMethod[key].count++;
      }

      res.json({
        status: "success",
        data: {
          year,
          month,
          totalSpent: Math.round(totalSpent * 100) / 100,
          expenseCount: expenses.length,
          byCategory: Object.values(byCategory),
          byPaymentMethod: Object.values(byPaymentMethod),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET /api/expenses ───────────────────────────────────────────────────────

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, categoryId, paymentMethodId, limit, offset } =
      querySchema.parse(req.query);

    const where: Record<string, unknown> = { userId };
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }
    if (categoryId) where.categoryId = categoryId;
    if (paymentMethodId) where.paymentMethodId = paymentMethodId;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true,
          paymentMethod: true,
          sharedWith: {
            include: {
              sharedWith: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.expense.count({ where }),
    ]);

    const data = expenses.map(serializeExpense);

    res.json({
      status: "success",
      data,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/expenses/:id ──────────────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        paymentMethod: true,
        sharedWith: {
          include: {
            sharedWith: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!expense || expense.userId !== userId) {
      res.status(404).json({ status: "error", message: "Expense not found" });
      return;
    }

    res.json({
      status: "success",
      data: serializeExpense(expense),
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/expenses ─────────────────────────────────────────────────────

router.post(
  "/",
  upload.single("receipt"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const data = createExpenseSchema.parse(req.body);
      const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const expense = await prisma.$transaction(async (tx) => {
        const created = await tx.expense.create({
          data: {
            userId,
            amount: data.amount,
            description: data.description,
            date: data.date ? new Date(data.date) : new Date(),
            categoryId: data.categoryId,
            paymentMethodId: data.paymentMethodId,
            receiptUrl,
            isShared: data.isShared,
          },
          include: { category: true, paymentMethod: true },
        });

        if (data.isShared && data.sharedWith?.length) {
          await tx.sharedExpense.createMany({
            data: data.sharedWith.map((share) => ({
              expenseId: created.id,
              sharedWithId: share.userId,
              createdById: userId,
              splitAmount: share.splitAmount,
            })),
          });
        }

        return tx.expense.findUnique({
          where: { id: created.id },
          include: {
            category: true,
            paymentMethod: true,
            sharedWith: {
              include: {
                sharedWith: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });
      });

      res.status(201).json({
        status: "success",
        data: expense ? serializeExpense(expense) : null,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── PUT /api/expenses/:id ──────────────────────────────────────────────────

router.put(
  "/:id",
  upload.single("receipt"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const data = updateExpenseSchema.parse(req.body);

      const existing = await prisma.expense.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Expense not found" });
        return;
      }

      const updateData: Record<string, unknown> = { ...data };
      if (data.date) updateData.date = new Date(data.date);
      if (req.file) updateData.receiptUrl = `/uploads/${req.file.filename}`;

      const expense = await prisma.expense.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          paymentMethod: true,
          sharedWith: {
            include: {
              sharedWith: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      res.json({
        status: "success",
        data: serializeExpense(expense),
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── DELETE /api/expenses/:id ────────────────────────────────────────────────

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.expense.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Expense not found" });
        return;
      }

      await prisma.expense.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
