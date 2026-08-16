import type { Request, Response } from "express";

import { sessionService } from "../../services/auth/session.service";
import { generateAccessToken } from "../../services/auth/token.service";
import { authCookieService } from "../../services/auth/auth-cookie.service";
import { csrfService } from "../../services/auth/csrf.service";
import type { RefreshResponse } from "../../types/auth/refresh.types";
import {
  isAuthDomainError,
} from "../../errors/auth.errors";
import {
  mapAuthDomainError,
} from "../../errors/auth-error-mapper";

export async function refresh(
  req: Request,
  res: Response,
) {
  try {
    const refreshToken =
      authCookieService.getRefreshToken(
        req,
      );

    if (!refreshToken) {
      authCookieService.clearRefreshToken(
        res,
      );
      authCookieService.clearCsrfCookie(
        res,
      );

      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const result =
      await sessionService.refreshSession(
        refreshToken,
      );

    const accessToken =
      generateAccessToken({
        userId: result.session.userId,
        email: result.session.user.email,
        sessionId: result.session.id,
      });

    const csrfToken =
      csrfService.issueRefreshBoundToken(
        result.refreshToken,
      );

    authCookieService.setRefreshToken(
      res,
      result.refreshToken,
      result.session.expiresAt,
    );
    authCookieService.setCsrfCookie(
      res,
      csrfToken.token,
      csrfToken.expiresAt,
    );

    const response: RefreshResponse = {
      accessToken,
      csrfToken: csrfToken.token,
      csrfExpiresAt:
        csrfToken.expiresAt.toISOString(),
    };

    return res.json(response);
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      error.code === "INVALID_REFRESH_TOKEN"
    ) {
      authCookieService.clearRefreshToken(
        res,
      );
      authCookieService.clearCsrfCookie(
        res,
      );

      const response =
        mapAuthDomainError(error);

      return res
        .status(response.status)
        .json({
          message: response.message,
        });
    }

    console.error("Refresh request failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
