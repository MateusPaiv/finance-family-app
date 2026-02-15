import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

const sharedWithItemSchema = z.object({
  userId: z.string().uuid(),
  splitAmount: z.number().positive(),
});

const fixedBillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().uuid().optional(),
  dueDay: z.number().int().min(1).max(31),
  recurrence: z.enum(["MONTHLY", "YEARLY"]),
  isShared: z.boolean().optional(),
  sharedWith: z.array(sharedWithItemSchema).optional(),
  totalInstallments: z.number().int().positive().optional(),
  startMonth: z.number().int().min(1).max(12).optional(),
  startYear: z.number().int().min(2000).max(2100).optional(),
});

const updateFixedBillSchema = fixedBillSchema.partial();

// Shared include for all queries that return fixed bills
const billInclude = {
  category: true,
  sharedWith: {
    include: {
      sharedWith: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  },
  payments: true,
};

// Helper: get year/month from query or body, defaulting to current
function getYearMonth(source: Record<string, any>): { year: number; month: number } {
  const now = new Date();
  const year = parseInt(source.year as string) || now.getFullYear();
  const month = parseInt(source.month as string) || now.getMonth() + 1;
  return { year, month };
}

// Helper: check if a bill is active for a given month (installment logic)
function isActiveForMonth(bill: any, year: number, month: number): boolean {
  if (bill.totalInstallments == null) return true; // infinite recurring
  if (bill.startYear == null || bill.startMonth == null) return true;
  const monthsElapsed = (year - bill.startYear) * 12 + (month - bill.startMonth);
  const installment = monthsElapsed + 1;
  return installment >= 1 && installment <= bill.totalInstallments;
}

// Helper: get current installment number
function getCurrentInstallment(bill: any, year: number, month: number): number | null {
  if (bill.totalInstallments == null || bill.startYear == null || bill.startMonth == null) {
    return null;
  }
  const monthsElapsed = (year - bill.startYear) * 12 + (month - bill.startMonth);
  return monthsElapsed + 1;
}

// Helper to serialize a fixed bill for a specific month
function serializeBill(bill: any, year: number, month: number) {
  const amount = Number(bill.amount);
  const sharedWith = bill.sharedWith?.map((s: any) => ({
    ...s,
    splitAmount: Number(s.splitAmount),
  }));
  const othersTotal = sharedWith?.reduce((sum: number, s: any) => sum + s.splitAmount, 0) ?? 0;

  // Check if paid for the given month
  const paymentForMonth = bill.payments?.find(
    (p: any) => p.year === year && p.month === month,
  );

  const currentInstallment = getCurrentInstallment(bill, year, month);

  return {
    ...bill,
    amount,
    userAmount: Math.round((amount - othersTotal) * 100) / 100,
    sharedWith,
    isPaid: !!paymentForMonth,
    paidAt: paymentForMonth?.paidAt || null,
    currentInstallment,
    totalInstallments: bill.totalInstallments,
    isActiveForMonth: isActiveForMonth(bill, year, month),
    payments: undefined, // Don't expose raw payment records
  };
}

// ─── Static routes (before /:id) ────────────────────────────────────────────

// GET /api/fixed-bills/shared/with-me
router.get(
  "/shared/with-me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const sharedBills = await prisma.sharedFixedBill.findMany({
        where: { sharedWithId: userId },
        include: {
          fixedBill: {
            include: { category: true },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const data = sharedBills.map((s) => ({
        ...s,
        splitAmount: Number(s.splitAmount),
        fixedBill: {
          ...s.fixedBill,
          amount: Number(s.fixedBill.amount),
        },
      }));

      res.json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/fixed-bills/upcoming/next-week
router.get(
  "/upcoming/next-week",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const now = new Date();
      const today = now.getDate();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();

      // Calculate which due days fall within the next 7 days
      const upcomingDays: number[] = [];
      for (let i = 0; i <= 7; i++) {
        const day = ((today + i - 1) % daysInMonth) + 1;
        upcomingDays.push(day);
      }

      const bills = await prisma.fixedBill.findMany({
        where: {
          userId,
          dueDay: { in: upcomingDays },
        },
        include: billInclude,
        orderBy: { dueDay: "asc" },
      });

      // Filter to unpaid + active for current month
      const data = bills
        .map((b) => serializeBill(b, year, month))
        .filter((b) => !b.isPaid && b.isActiveForMonth);

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
      const { year, month } = getYearMonth(req.query);

      const bills = await prisma.fixedBill.findMany({
        where: { userId, recurrence: "MONTHLY" },
        include: billInclude,
      });

      const serialized = bills
        .map((b) => serializeBill(b, year, month))
        .filter((b) => b.isActiveForMonth);

      const totalMonthly = serialized.reduce((sum, b) => sum + b.userAmount, 0);
      const paid = serialized.filter((b) => b.isPaid);
      const unpaid = serialized.filter((b) => !b.isPaid);

      res.json({
        status: "success",
        data: {
          totalMonthly: Math.round(totalMonthly * 100) / 100,
          paidCount: paid.length,
          unpaidCount: unpaid.length,
          totalPaid: Math.round(
            paid.reduce((sum, b) => sum + b.userAmount, 0) * 100,
          ) / 100,
          totalUnpaid: Math.round(
            unpaid.reduce((sum, b) => sum + b.userAmount, 0) * 100,
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
    const { year, month } = getYearMonth(req.query);

    const bills = await prisma.fixedBill.findMany({
      where: { userId },
      include: billInclude,
      orderBy: { dueDay: "asc" },
    });

    // Serialize with month context and filter to active bills
    const data = bills
      .map((b) => serializeBill(b, year, month))
      .filter((b) => b.isActiveForMonth);

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
    const { year, month } = getYearMonth(req.query);

    const bill = await prisma.fixedBill.findUnique({
      where: { id },
      include: billInclude,
    });

    if (!bill || bill.userId !== userId) {
      res.status(404).json({ status: "error", message: "Fixed bill not found" });
      return;
    }

    res.json({
      status: "success",
      data: serializeBill(bill, year, month),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/fixed-bills
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sharedWith, ...data } = fixedBillSchema.parse(req.body);
    const userId = req.user!.userId;

    const isShared = data.isShared && sharedWith && sharedWith.length > 0;

    // Default startMonth/startYear to current if totalInstallments is provided
    const now = new Date();
    const startMonth = data.totalInstallments
      ? data.startMonth ?? now.getMonth() + 1
      : data.startMonth;
    const startYear = data.totalInstallments
      ? data.startYear ?? now.getFullYear()
      : data.startYear;

    const bill = await prisma.$transaction(async (tx) => {
      const created = await tx.fixedBill.create({
        data: {
          name: data.name,
          amount: data.amount,
          categoryId: data.categoryId,
          dueDay: data.dueDay,
          recurrence: data.recurrence,
          isShared: isShared || false,
          totalInstallments: data.totalInstallments,
          startMonth,
          startYear,
          userId,
        },
      });

      if (isShared && sharedWith) {
        await tx.sharedFixedBill.createMany({
          data: sharedWith.map((member) => ({
            fixedBillId: created.id,
            sharedWithId: member.userId,
            createdById: userId,
            splitAmount: member.splitAmount,
          })),
        });
      }

      return tx.fixedBill.findUnique({
        where: { id: created.id },
        include: billInclude,
      });
    });

    const { year, month } = getYearMonth(req.query);
    res.status(201).json({
      status: "success",
      data: serializeBill(bill, year, month),
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
    const { sharedWith, ...data } = updateFixedBillSchema.parse(req.body);

    const existing = await prisma.fixedBill.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ status: "error", message: "Fixed bill not found" });
      return;
    }

    const bill = await prisma.$transaction(async (tx) => {
      await tx.fixedBill.update({
        where: { id },
        data: {
          ...data,
          isShared: data.isShared ?? existing.isShared,
        },
      });

      // If sharedWith is provided, replace all shared records
      if (sharedWith !== undefined) {
        await tx.sharedFixedBill.deleteMany({
          where: { fixedBillId: id },
        });

        if (sharedWith.length > 0) {
          await tx.sharedFixedBill.createMany({
            data: sharedWith.map((member) => ({
              fixedBillId: id,
              sharedWithId: member.userId,
              createdById: userId,
              splitAmount: member.splitAmount,
            })),
          });
        }
      }

      return tx.fixedBill.findUnique({
        where: { id },
        include: billInclude,
      });
    });

    const { year, month } = getYearMonth(req.query);
    res.json({
      status: "success",
      data: serializeBill(bill, year, month),
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
      const { year, month } = getYearMonth(req.body);

      const existing = await prisma.fixedBill.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Fixed bill not found" });
        return;
      }

      // Upsert payment record (idempotent)
      await prisma.fixedBillPayment.upsert({
        where: {
          fixedBillId_year_month: { fixedBillId: id, year, month },
        },
        update: { paidAt: new Date() },
        create: { fixedBillId: id, year, month },
      });

      const bill = await prisma.fixedBill.findUnique({
        where: { id },
        include: billInclude,
      });

      res.json({
        status: "success",
        data: serializeBill(bill, year, month),
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
      const { year, month } = getYearMonth(req.body);

      const existing = await prisma.fixedBill.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Fixed bill not found" });
        return;
      }

      // Delete payment record for this month
      await prisma.fixedBillPayment.deleteMany({
        where: { fixedBillId: id, year, month },
      });

      const bill = await prisma.fixedBill.findUnique({
        where: { id },
        include: billInclude,
      });

      res.json({
        status: "success",
        data: serializeBill(bill, year, month),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
