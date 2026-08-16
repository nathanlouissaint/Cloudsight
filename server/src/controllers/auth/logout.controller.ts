import type { Request, Response } from "express";

import { logoutUser } from "../../services/auth/auth.service";
import { authCookieService } from "../../services/auth/auth-cookie.service";
import {
  isAuthDomainError,
} from "../../errors/auth.errors";

export async function logout(
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
      authCookieService.clearCsrfCookie(res);

      return res.status(204).send();
    }

    await logoutUser(refreshToken);

    authCookieService.clearRefreshToken(
      res,
    );
    authCookieService.clearCsrfCookie(res);

    return res.status(204).send();
  } catch (error) {
    if (
      isAuthDomainError(error) &&
      error.code === "INVALID_REFRESH_TOKEN"
    ) {
      authCookieService.clearRefreshToken(
        res,
      );
      authCookieService.clearCsrfCookie(res);

      return res.status(204).send();
    }

    authCookieService.clearRefreshToken(
      res,
    );
    authCookieService.clearCsrfCookie(res);

    console.error("Logout failed");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
