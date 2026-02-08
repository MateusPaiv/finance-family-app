import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Prisma known request error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[])?.join(", ") ?? "field";
        res.status(409).json({
          status: "error",
          message: `Unique constraint violation on: ${target}`,
        });
        return;
      }
      case "P2025":
        res.status(404).json({
          status: "error",
          message: "Record not found",
        });
        return;
      default:
        res.status(400).json({
          status: "error",
          message: `Database error: ${err.message}`,
        });
        return;
    }
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: String(issue.path.join(".")),
      message: issue.message,
    }));
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors,
    });
    return;
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
    return;
  }

  if (err instanceof jwt.TokenExpiredError) {
    res.status(403).json({
      status: "error",
      message: "Token expired",
    });
    return;
  }

  // Multer errors
  if (err.name === "MulterError") {
    const multerErr = err as Error & { code: string };
    const message =
      multerErr.code === "LIMIT_FILE_SIZE"
        ? `File too large. Maximum size is ${env.MAX_FILE_SIZE / 1024 / 1024}MB`
        : multerErr.message;
    res.status(400).json({ status: "error", message });
    return;
  }

  // Generic error
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message:
      env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
