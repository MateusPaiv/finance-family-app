import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import expenseRoutes from "./routes/expenses.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import paymentMethodRoutes from "./routes/paymentMethods.routes.js";
import fixedBillRoutes from "./routes/fixedBills.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// ─── Rate limiting ───────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, please try again later" },
});
app.use("/api", limiter);

// ─── Body parsing & compression ──────────────────────────────────────────────

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

// ─── Static files ────────────────────────────────────────────────────────────

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── Health check ────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/fixed-bills", fixedBillRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// ─── Error handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  Family Finance Hub - Backend API            ║
  ╠══════════════════════════════════════════════╣
  ║  Port:    ${String(env.PORT).padEnd(34)}║
  ║  Env:     ${env.NODE_ENV.padEnd(34)}║
  ║  API:     http://localhost:${String(env.PORT).padEnd(16)}║
  ║  Health:  http://localhost:${env.PORT}/health${" ".repeat(6)}║
  ╚══════════════════════════════════════════════╝
  `);
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────

const shutdown = async () => {
  console.log("\nShutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown();
});

export default app;
