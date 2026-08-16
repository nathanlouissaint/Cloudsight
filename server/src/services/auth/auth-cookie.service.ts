import type {
  CookieOptions,
  Request,
  Response,
} from "express";

export const REFRESH_TOKEN_COOKIE_NAME =
  "refreshToken";
export const CSRF_COOKIE_NAME =
  "cloudsight.csrf";
export const OAUTH_TRANSACTION_COOKIE_NAME =
  "cloudsight_oauth_tx";

type RefreshCookieSameSite =
  | "lax"
  | "strict"
  | "none";

function getProductionSameSite(): RefreshCookieSameSite {
  const configured =
    process.env.REFRESH_COOKIE_SAME_SITE
      ?.trim()
      .toLowerCase();

  if (!configured) {
    return "lax";
  }

  if (
    configured === "lax" ||
    configured === "strict" ||
    configured === "none"
  ) {
    return configured;
  }

  throw new Error(
    "REFRESH_COOKIE_SAME_SITE must be lax, strict, or none.",
  );
}

export class AuthCookieService {
  private getOptions(): CookieOptions {
    const isProduction =
      process.env.NODE_ENV ===
      "production";

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? getProductionSameSite()
        : "lax",
      path: "/auth",
    };
  }

  getRefreshToken(
    req: Request,
  ): string | null {
    const value: unknown =
      req.cookies?.[
        REFRESH_TOKEN_COOKIE_NAME
      ];

    return typeof value === "string" &&
      value.length > 0
      ? value
      : null;
  }

  setRefreshToken(
    res: Response,
    refreshToken: string,
    sessionExpiresAt: Date,
  ): void {
    const maxAge = Math.max(
      sessionExpiresAt.getTime() -
        Date.now(),
      0,
    );

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      {
        ...this.getOptions(),
        maxAge,
      },
    );
  }

  clearRefreshToken(
    res: Response,
  ): void {
    res.clearCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      this.getOptions(),
    );
  }

  setCsrfCookie(
    res: Response,
    csrfToken: string,
    tokenExpiresAt: Date,
  ): void {
    const maxAge = Math.max(
      tokenExpiresAt.getTime() -
        Date.now(),
      0,
    );

    res.cookie(
      CSRF_COOKIE_NAME,
      csrfToken,
      {
        ...this.getOptions(),
        maxAge,
      },
    );
  }

  clearCsrfCookie(
    res: Response,
  ): void {
    res.clearCookie(
      CSRF_COOKIE_NAME,
      this.getOptions(),
    );
  }

  setOAuthTransactionBinding(
    res: Response,
    secret: string,
    maxAge: number,
    callbackPath = "/auth/oauth/google/callback",
  ): void {
    const options = this.getOptions();

    res.cookie(
      OAUTH_TRANSACTION_COOKIE_NAME,
      secret,
      {
        ...options,
        path: callbackPath,
        maxAge: Math.max(maxAge, 0),
      },
    );
  }

  getOAuthTransactionBinding(
    req: Request,
  ): string | null {
    const value: unknown =
      req.cookies?.[
        OAUTH_TRANSACTION_COOKIE_NAME
      ];

    return typeof value === "string" &&
      value.length > 0
      ? value
      : null;
  }

  clearOAuthTransactionBinding(
    res: Response,
    callbackPath = "/auth/oauth/google/callback",
  ): void {
    res.clearCookie(
      OAUTH_TRANSACTION_COOKIE_NAME,
      {
        ...this.getOptions(),
        path: callbackPath,
      },
    );
  }
}

export const authCookieService =
  new AuthCookieService();
