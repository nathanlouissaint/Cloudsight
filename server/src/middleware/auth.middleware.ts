import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

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
    const claims = verifyAccessToken(token);

    req.user = {
      userId: claims.subject,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}
