import type {
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../types/auth/request.types";

import {
  verifyAccessToken,
} from "../services/auth/token.service";

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded =
      verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}