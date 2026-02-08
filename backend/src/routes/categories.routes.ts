import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().optional().default("📁"),
  budgetLimit: z.number().positive().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  emoji: z.string().optional(),
  budgetLimit: z.number().positive().nullable().optional(),
});

// GET /api/categories/budget/overview  (must be before /:id)
router.get(
  "/budget/overview",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const categories = await prisma.category.findMany({
        where: { userId, budgetLimit: { not: null } },
        include: {
          expenses: {
            where: { date: { gte: startOfMonth, lte: endOfMonth } },
            select: { amount: true },
          },
        },
      });

      const overview = categories.map((cat) => {
        const totalSpent = cat.expenses.reduce(
          (sum, e) => sum + Number(e.amount),
          0,
        );
        const budget = Number(cat.budgetLimit);
        const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

        return {
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
          budgetLimit: budget,
          totalSpent,
          budgetRemaining: budget - totalSpent,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          isOverBudget: totalSpent > budget,
        };
      });

      res.json({ status: "success", data: overview });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/categories
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { expenses: true, fixedBills: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const data = categories.map((cat) => ({
      ...cat,
      budgetLimit: cat.budgetLimit ? Number(cat.budgetLimit) : null,
      expenseCount: cat._count.expenses,
      fixedBillsCount: cat._count.fixedBills,
      _count: undefined,
    }));

    res.json({ status: "success", data });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        expenses: {
          where: { date: { gte: startOfMonth, lte: endOfMonth } },
          select: { amount: true },
        },
      },
    });

    if (!category || category.userId !== userId) {
      res.status(404).json({ status: "error", message: "Category not found" });
      return;
    }

    const totalSpent = category.expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const budget = category.budgetLimit ? Number(category.budgetLimit) : null;
    const budgetRemaining = budget ? budget - totalSpent : null;
    const percentageUsed = budget && budget > 0
      ? Math.round((totalSpent / budget) * 10000) / 100
      : null;

    res.json({
      status: "success",
      data: {
        id: category.id,
        userId: category.userId,
        name: category.name,
        emoji: category.emoji,
        budgetLimit: budget,
        createdAt: category.createdAt,
        totalSpent,
        budgetRemaining,
        percentageUsed,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const userId = req.user!.userId;

    const category = await prisma.category.create({
      data: { ...data, userId },
    });

    res.status(201).json({
      status: "success",
      data: {
        ...category,
        budgetLimit: category.budgetLimit ? Number(category.budgetLimit) : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = updateCategorySchema.parse(req.body);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ status: "error", message: "Category not found" });
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json({
      status: "success",
      data: {
        ...category,
        budgetLimit: category.budgetLimit ? Number(category.budgetLimit) : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Category not found" });
        return;
      }

      await prisma.category.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
