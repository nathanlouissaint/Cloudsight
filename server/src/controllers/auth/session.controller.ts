import type { Response } from "express";

import type { AuthenticatedRequest } from "../../types/auth/request.types";

import { sessionService } from "../../services/auth/session.service";

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
    console.error(error);

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

    if (!userId) {
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

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SESSION_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SESSION_FORBIDDEN"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    console.error(error);

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

    return res.status(200).json({
      revokedSessions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}