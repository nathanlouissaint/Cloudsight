import type {
  Response,
  NextFunction,
} from "express";

import type { AuthenticatedRequest } from "../types/auth/request.types";

import {
  verifyAccessToken,
} from "../services/auth/token.service";
import { sessionService } from "../services/auth/session.service";
import {
  isAuthDomainError,
} from "../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../errors/auth-error-mapper";

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded =
      verifyAccessToken(token);

    await sessionService.validateAccessSession(
      decoded.sessionId,
    );

    req.user = decoded;

    next();
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      (error.code === "SESSION_NOT_FOUND" ||
        error.code === "SESSION_REVOKED" ||
        error.code === "SESSION_EXPIRED")
    ) {
      const response = mapAuthDomainError(error);

      res.status(response.status).json({
        message: response.message,
      });
      return;
    }

    res.status(401).json({
      message: "Invalid token",
    });
  }
}
