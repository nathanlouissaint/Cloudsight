import type { Response } from "express";

import type { AuthenticatedRequest } from "../../types/auth/request.types";

import { changePasswordService } from "../../services/auth/change-password.service";
import {
  isAuthDomainError,
} from "../../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../../errors/auth-error-mapper";

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
      isAuthDomainError(error) &&
      (error.code === "USER_NOT_FOUND" ||
        error.code ===
          "INVALID_CURRENT_PASSWORD" ||
        error.code === "PASSWORD_REUSE" ||
        error.code ===
          "PASSWORD_LOGIN_UNAVAILABLE")
    ) {
      const response =
        mapAuthDomainError(
          error,
          error.code ===
            "PASSWORD_LOGIN_UNAVAILABLE"
            ? "Password login is not available for this account."
            : undefined,
        );

      return res
        .status(response.status)
        .json({
          message: response.message,
        });
    }

    console.error("Password change failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
