import type {
  Request,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../types/auth/request.types";

import {
  emailVerificationService,
} from "../../services/auth/email-verification.service";
import {
  isAuthDomainError,
} from "../../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../../errors/auth-error-mapper";

export async function resendVerification(
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

    const result =
      await emailVerificationService.resendVerification(
        userId,
      );

    return res.status(200).json(result);
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      error.code === "USER_NOT_FOUND"
    ) {
      const response =
        mapAuthDomainError(error);

      return res
        .status(response.status)
        .json({
          message: response.message,
        });
    }

    console.error("Verification resend failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
) {
  try {
    const { token } = req.body;

    const result =
      await emailVerificationService.verifyEmail(
        token,
      );

    return res.status(200).json(result);
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      (error.code ===
        "INVALID_VERIFICATION_TOKEN" ||
        error.code ===
          "VERIFICATION_TOKEN_EXPIRED" ||
        error.code ===
          "VERIFICATION_TOKEN_ALREADY_USED" ||
        error.code === "USER_NOT_FOUND")
    ) {
      const response =
        mapAuthDomainError(error);

      return res
        .status(response.status)
        .json({
          message: response.message,
        });
    }

    console.error("Email verification failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
