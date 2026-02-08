import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

const fixedBillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().uuid().optional(),
  dueDay: z.number().int().min(1).max(31),
  recurrence: z.enum(["MONTHLY", "YEARLY"]),
});

const updateFixedBillSchema = fixedBillSchema.partial();

// ─── Static routes (before /:id) ────────────────────────────────────────────

// GET /api/fixed-bills/upcoming/next-week
router.get(
  "/upcoming/next-week",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const today = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      // Calculate which due days fall within the next 7 days
      const upcomingDays: number[] = [];
      for (let i = 0; i <= 7; i++) {
        const day = ((today + i - 1) % daysInMonth) + 1;
        upcomingDays.push(day);
      }

      const bills = await prisma.fixedBill.findMany({
        where: {
          userId,
          isPaid: false,
          dueDay: { in: upcomingDays },
        },
        include: { category: true },
        orderBy: { dueDay: "asc" },
      });

      const data = bills.map((b) => ({
        ...b,
        amount: Number(b.amount),
      }));

      res.json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/fixed-bills/summary/monthly
router.get(
  "/summary/monthly",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const bills = await prisma.fixedBill.findMany({
        where: { userId, recurrence: "MONTHLY" },
      });

      const totalMonthly = bills.reduce((sum, b) => sum + Number(b.amount), 0);
      const paid = bills.filter((b) => b.isPaid);
      const unpaid = bills.filter((b) => !b.isPaid);

      res.json({
        status: "success",
        data: {
          totalMonthly: Math.round(totalMonthly * 100) / 100,
          paidCount: paid.length,
          unpaidCount: unpaid.length,
          totalPaid: Math.round(
            paid.reduce((sum, b) => sum + Number(b.amount), 0) * 100,
          ) / 100,
          totalUnpaid: Math.round(
            unpaid.reduce((sum, b) => sum + Number(b.amount), 0) * 100,
          ) / 100,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── CRUD routes ─────────────────────────────────────────────────────────────

// GET /api/fixed-bills
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const bills = await prisma.fixedBill.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { dueDay: "asc" },
    });

    const data = bills.map((b) => ({
      ...b,
      amount: Number(b.amount),
    }));

    res.json({ status: "success", data });
  } catch (error) {
    next(error);
  }
});

// GET /api/fixed-bills/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const bill = await prisma.fixedBill.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!bill || bill.userId !== userId) {
      res.status(404).json({ status: "error", message: "Fixed bill not found" });
      return;
    }

    res.json({
      status: "success",
      data: { ...bill, amount: Number(bill.amount) },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/fixed-bills
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = fixedBillSchema.parse(req.body);
    const userId = req.user!.userId;

    const bill = await prisma.fixedBill.create({
      data: { ...data, userId },
      include: { category: true },
    });

    res.status(201).json({
      status: "success",
      data: { ...bill, amount: Number(bill.amount) },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/fixed-bills/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = updateFixedBillSchema.parse(req.body);

    const existing = await prisma.fixedBill.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ status: "error", message: "Fixed bill not found" });
      return;
    }

    const bill = await prisma.fixedBill.update({
      where: { id },
      data,
      include: { category: true },
    });

    res.json({
      status: "success",
      data: { ...bill, amount: Number(bill.amount) },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/fixed-bills/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.fixedBill.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Fixed bill not found" });
        return;
      }

      await prisma.fixedBill.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/fixed-bills/:id/pay
router.post(
  "/:id/pay",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.fixedBill.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Fixed bill not found" });
        return;
      }

      const bill = await prisma.fixedBill.update({
        where: { id },
        data: { isPaid: true, lastPaidAt: new Date() },
        include: { category: true },
      });

      res.json({
        status: "success",
        data: { ...bill, amount: Number(bill.amount) },
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/fixed-bills/:id/reset
router.post(
  "/:id/reset",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.fixedBill.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Fixed bill not found" });
        return;
      }

      const bill = await prisma.fixedBill.update({
        where: { id },
        data: { isPaid: false },
        include: { category: true },
      });

      res.json({
        status: "success",
        data: { ...bill, amount: Number(bill.amount) },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
