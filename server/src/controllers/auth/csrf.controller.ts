import type {
  Request,
  Response,
} from "express";

import {
  authCookieService,
} from "../../services/auth/auth-cookie.service";
import {
  csrfService,
} from "../../services/auth/csrf.service";
import type {
  CsrfBootstrapResponse,
} from "../../types/auth/csrf.types";

export function bootstrapCsrf(
  req: Request,
  res: Response<CsrfBootstrapResponse>,
): Response<CsrfBootstrapResponse> {
  const refreshToken =
    authCookieService.getRefreshToken(
      req,
    );
  const issuedToken =
    refreshToken
      ? csrfService.issueRefreshBoundToken(
          refreshToken,
        )
      : csrfService.issuePreAuthToken();

  authCookieService.setCsrfCookie(
    res,
    issuedToken.token,
    issuedToken.expiresAt,
  );

  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    csrfToken: issuedToken.token,
    expiresAt:
      issuedToken.expiresAt.toISOString(),
  });
}
