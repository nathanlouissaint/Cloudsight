import type { Response } from "express";

import type { AuthenticatedRequest } from "../../types/auth/request.types";

import { sessionService } from "../../services/auth/session.service";
import { authCookieService } from "../../services/auth/auth-cookie.service";
import {
  isAuthDomainError,
} from "../../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../../errors/auth-error-mapper";

/**
 * Return every active session owned by the authenticated user.
 */
export async function listSessions(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId;
    const currentSessionId = req.user?.sessionId;

    if (!userId || !currentSessionId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const sessions =
      await sessionService.listActiveSessions(
        userId,
        currentSessionId,
      );

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Session listing failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * Revoke one session owned by the authenticated user.
 */
export async function deleteSession(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId;
    const currentSessionId = req.user?.sessionId;

    if (!userId || !currentSessionId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { sessionId } = req.params;

    if (!sessionId || Array.isArray(sessionId)) {
      return res.status(400).json({
        message: "Invalid session id",
      });
    }

    await sessionService.revokeOwnedSession(
      userId,
      sessionId,
    );

    if (sessionId === currentSessionId) {
      authCookieService.clearRefreshToken(
        res,
      );
      authCookieService.clearCsrfCookie(res);
    }

    return res.status(204).send();
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      (error.code === "SESSION_NOT_FOUND" ||
        error.code === "SESSION_FORBIDDEN")
    ) {
      const response = mapAuthDomainError(error);

      return res.status(response.status).json({
        message: response.message,
      });
    }

    console.error("Session revocation failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * Revoke every active session owned by the authenticated user.
 */
export async function logoutAllSessions(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const revokedSessions =
      await sessionService.revokeAllSessions(userId);

    authCookieService.clearRefreshToken(
      res,
    );
    authCookieService.clearCsrfCookie(res);

    return res.status(200).json({
      revokedSessions,
    });
  } catch (error) {
    console.error("Session logout-all failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
