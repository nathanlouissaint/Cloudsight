import type {
  Request,
  Response,
} from "express";

import {
  emailVerificationService,
} from "../../services/auth/email-verification.service";

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
      error instanceof Error &&
      error.message ===
        "INVALID_VERIFICATION_TOKEN"
    ) {
      return res.status(400).json({
        message:
          "Invalid verification token.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "VERIFICATION_TOKEN_EXPIRED"
    ) {
      return res.status(400).json({
        message:
          "Verification token has expired.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "VERIFICATION_TOKEN_ALREADY_USED"
    ) {
      return res.status(400).json({
        message:
          "Verification token has already been used.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}