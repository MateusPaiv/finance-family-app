import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createIncomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

const updateIncomeSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

// ─── GET /api/incomes ────────────────────────────────────────────────────────

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;

    const where: Record<string, unknown> = { userId };
    if (year !== undefined) where.year = year;
    if (month !== undefined) where.month = month;

    const incomes = await prisma.income.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });

    const data = incomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
    }));

    res.json({ status: "success", data });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/incomes/summary/monthly ────────────────────────────────────────

router.get(
  "/summary/monthly",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;

      const incomes = await prisma.income.findMany({
        where: { userId, year, month },
      });

      const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

      res.json({
        status: "success",
        data: {
          year,
          month,
          totalIncome: Math.round(totalIncome * 100) / 100,
          incomeCount: incomes.length,
          incomes: incomes.map((i) => ({
            ...i,
            amount: Number(i.amount),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET /api/incomes/:id ────────────────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const income = await prisma.income.findUnique({ where: { id } });

    if (!income || income.userId !== userId) {
      res.status(404).json({ status: "error", message: "Income not found" });
      return;
    }

    res.json({
      status: "success",
      data: { ...income, amount: Number(income.amount) },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/incomes ───────────────────────────────────────────────────────

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = createIncomeSchema.parse(req.body);

    const income = await prisma.income.create({
      data: {
        userId,
        amount: data.amount,
        description: data.description,
        month: data.month,
        year: data.year,
      },
    });

    res.status(201).json({
      status: "success",
      data: { ...income, amount: Number(income.amount) },
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/incomes/:id ────────────────────────────────────────────────────

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = updateIncomeSchema.parse(req.body);

    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ status: "error", message: "Income not found" });
      return;
    }

    const income = await prisma.income.update({
      where: { id },
      data,
    });

    res.json({
      status: "success",
      data: { ...income, amount: Number(income.amount) },
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/incomes/:id ─────────────────────────────────────────────────

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ status: "error", message: "Income not found" });
      return;
    }

    await prisma.income.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
