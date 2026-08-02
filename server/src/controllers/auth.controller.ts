import type {
  Request,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../types/auth/request.types";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  resetPassword,
} from "../services/auth/auth.service";

import {
  auditService,
} from "../services/auth/audit.service";

import {
  passwordResetService,
} from "../services/auth/password-reset.service";

export async function register(
  req: Request,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    const user = await registerUser(
      email,
      password,
    );

    return res
      .status(201)
      .json(user);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_EXISTS"
    ) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    const userAgent = req.get("User-Agent");
    const ipAddress = req.ip;

    const result = await loginUser(
      email,
      password,
      {
        userAgent,
        ipAddress,
      },
    );

    return res.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PASSWORD_LOGIN_UNAVAILABLE"
    ) {
      return res.status(400).json({
        message:
          "This account uses Google sign-in",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
) {
  try {
    const { email } = req.body;

    if (typeof email === "string") {
      try {
        await passwordResetService.createResetRequest(
          email,
        );
      } catch {
        // Prevent account enumeration.
      }
    }

    return res.status(200).json({
      message:
        "If an account exists for that email, password reset instructions have been generated.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
) {
  try {
    const {
      token,
      password,
    } = req.body;

    const result =
      await resetPassword(
        token,
        password,
      );

    return res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_RESET_TOKEN"
    ) {
      return res.status(400).json({
        message:
          "Invalid reset token.",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "RESET_TOKEN_EXPIRED"
    ) {
      return res.status(400).json({
        message:
          "Reset token has expired.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function me(
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

    const user =
      await getCurrentUser(
        userId,
      );

    return res.status(200).json(user);
  } catch (error) {
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

export async function getAuditHistory(
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

    const events =
      await auditService.getUserAuditHistory(
        userId,
      );

    return res.status(200).json(
      events,
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}