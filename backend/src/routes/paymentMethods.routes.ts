import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

const paymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CREDIT_CARD", "DEBIT_CARD", "CASH", "PIX", "OTHER"]),
  icon: z.string().optional().default("💳"),
  isDefault: z.boolean().optional().default(false),
});

const updatePaymentMethodSchema = paymentMethodSchema.partial();

// GET /api/payment-methods
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    res.json({ status: "success", data: paymentMethods });
  } catch (error) {
    next(error);
  }
});

// POST /api/payment-methods
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = paymentMethodSchema.parse(req.body);
    const userId = req.user!.userId;

    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: { ...data, userId },
    });

    res.status(201).json({ status: "success", data: paymentMethod });
  } catch (error) {
    next(error);
  }
});

// PUT /api/payment-methods/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = updatePaymentMethodSchema.parse(req.body);

    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ status: "error", message: "Payment method not found" });
      return;
    }

    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data,
    });

    res.json({ status: "success", data: paymentMethod });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/payment-methods/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.paymentMethod.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ status: "error", message: "Payment method not found" });
        return;
      }

      await prisma.paymentMethod.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
