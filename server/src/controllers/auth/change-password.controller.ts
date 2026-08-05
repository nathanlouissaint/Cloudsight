import type { Response } from "express";

import type { AuthenticatedRequest } from "../../types/auth/request.types";

import { changePasswordService } from "../../services/auth/change-password.service";

export async function changePassword(
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

    const {
      currentPassword,
      newPassword,
      revokeOtherSessions,
    } = req.body;

    const result =
      await changePasswordService.changePassword({
        userId,
        currentSessionId,
        currentPassword,
        newPassword,
        revokeOtherSessions,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

    return res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_CURRENT_PASSWORD"
    ) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PASSWORD_REUSE"
    ) {
      return res.status(400).json({
        message:
          "New password must be different from the current password.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PASSWORD_LOGIN_UNAVAILABLE"
    ) {
      return res.status(400).json({
        message:
          "Password login is not available for this account.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}