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

import {
  authCookieService,
} from "../services/auth/auth-cookie.service";
import {
  csrfService,
} from "../services/auth/csrf.service";
import type {
  LoginCsrfResponse,
} from "../types/auth/csrf.types";
import {
  isAuthDomainError,
} from "../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../errors/auth-error-mapper";

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
      isAuthDomainError(error) &&
      error.code === "USER_EXISTS"
    ) {
      const response =
        mapAuthDomainError(error);

      return res
        .status(response.status)
        .json({
          message: response.message,
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

    const {
      refreshToken,
      sessionExpiresAt,
      ...response
    } = result;

    authCookieService.setRefreshToken(
      res,
      refreshToken,
      sessionExpiresAt,
    );

    const csrfToken =
      csrfService.issueRefreshBoundToken(
        refreshToken,
      );

    authCookieService.setCsrfCookie(
      res,
      csrfToken.token,
      csrfToken.expiresAt,
    );

    const csrfResponse: LoginCsrfResponse = {
      csrfToken: csrfToken.token,
      csrfExpiresAt:
        csrfToken.expiresAt.toISOString(),
    };

    return res.json({
      ...response,
      ...csrfResponse,
    });
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      (error.code ===
        "INVALID_CREDENTIALS" ||
        error.code ===
          "PASSWORD_LOGIN_UNAVAILABLE")
    ) {
      const response =
        mapAuthDomainError(error);

      return res
        .status(response.status)
        .json({
          message: response.message,
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
      isAuthDomainError(error) &&
      (error.code ===
        "INVALID_RESET_TOKEN" ||
        error.code ===
          "RESET_TOKEN_EXPIRED")
    ) {
      const response =
        mapAuthDomainError(error);

      return res
        .status(response.status)
        .json({
          message: response.message,
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
