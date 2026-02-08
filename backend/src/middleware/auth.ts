import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthToken } from "../types/index.js";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ status: "error", message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthToken;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ status: "error", message: "Token expired" });
      return;
    }
    res.status(401).json({ status: "error", message: "Invalid token" });
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthToken;
      req.user = decoded;
    } catch {
      // Token invalid but optional, continue without user
    }
  }

  next();
}
