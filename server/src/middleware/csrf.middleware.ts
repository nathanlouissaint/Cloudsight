import crypto from "crypto";

import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import {
  httpSecurityConfig,
} from "../config/http-security.config";
import {
  CSRF_COOKIE_NAME,
  authCookieService,
} from "../services/auth/auth-cookie.service";
import {
  CsrfValidationError,
  MAX_CSRF_TOKEN_LENGTH,
  csrfService,
} from "../services/auth/csrf.service";

const CSRF_HEADER_NAME = "x-csrf-token";

type CsrfBindingMode =
  | "preauth"
  | "refresh-bound";

function rejectRequest(
  res: Response,
): Response {
  return res.status(403).json({
    message: "Forbidden",
  });
}

function isTrustedRequestOrigin(
  req: Request,
): boolean {
  const origin = req.get("Origin");

  if (origin !== undefined) {
    if (origin === "null") {
      return false;
    }

    try {
      const parsedOrigin = new URL(origin);

      return (
        origin === parsedOrigin.origin &&
        parsedOrigin.origin ===
          httpSecurityConfig.trustedFrontendOrigin
      );
    } catch {
      return false;
    }
  }

  const referer = req.get("Referer");

  if (referer === undefined) {
    return false;
  }

  try {
    return (
      new URL(referer).origin ===
      httpSecurityConfig.trustedFrontendOrigin
    );
  } catch {
    return false;
  }
}

function getSingularCsrfHeader(
  req: Request,
): string | null {
  const matchingRawHeaders =
    req.rawHeaders.reduce(
      (count, value, index) =>
        index % 2 === 0 &&
        value.toLowerCase() ===
          CSRF_HEADER_NAME
          ? count + 1
          : count,
      0,
    );
  const header: unknown =
    req.headers[CSRF_HEADER_NAME];

  if (
    matchingRawHeaders !== 1 ||
    typeof header !== "string" ||
    header.length === 0 ||
    header.length > MAX_CSRF_TOKEN_LENGTH ||
    Buffer.byteLength(header, "utf8") >
      MAX_CSRF_TOKEN_LENGTH
  ) {
    return null;
  }

  return header;
}

function getCsrfCookie(
  req: Request,
): string | null {
  const cookie: unknown =
    req.cookies?.[CSRF_COOKIE_NAME];

  if (
    typeof cookie !== "string" ||
    cookie.length === 0 ||
    cookie.length > MAX_CSRF_TOKEN_LENGTH ||
    Buffer.byteLength(cookie, "utf8") >
      MAX_CSRF_TOKEN_LENGTH
  ) {
    return null;
  }

  return cookie;
}

function tokensMatch(
  cookieToken: string,
  headerToken: string,
): boolean {
  const cookieBuffer = Buffer.from(
    cookieToken,
    "utf8",
  );
  const headerBuffer = Buffer.from(
    headerToken,
    "utf8",
  );

  return (
    cookieBuffer.byteLength ===
      headerBuffer.byteLength &&
    crypto.timingSafeEqual(
      cookieBuffer,
      headerBuffer,
    )
  );
}

export function requireTrustedOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  if (!isTrustedRequestOrigin(req)) {
    return rejectRequest(res);
  }

  next();
}

function createCsrfValidationMiddleware(
  bindingMode: CsrfBindingMode,
): RequestHandler {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Response => {
    if (!isTrustedRequestOrigin(req)) {
      return rejectRequest(res);
    }

    const cookieToken = getCsrfCookie(req);
    const headerToken =
      getSingularCsrfHeader(req);

    if (
      !cookieToken ||
      !headerToken ||
      !tokensMatch(
        cookieToken,
        headerToken,
      )
    ) {
      return rejectRequest(res);
    }

    try {
      if (bindingMode === "preauth") {
        csrfService.validatePreAuthToken(
          headerToken,
        );
      } else {
        const refreshToken =
          authCookieService.getRefreshToken(
            req,
          );

        if (!refreshToken) {
          return rejectRequest(res);
        }

        csrfService.validateRefreshBoundToken(
          headerToken,
          refreshToken,
        );
      }
    } catch (error) {
      if (error instanceof CsrfValidationError) {
        return rejectRequest(res);
      }

      return next(error);
    }

    next();
  };
}

export const validatePreAuthCsrf =
  createCsrfValidationMiddleware(
    "preauth",
  );

export const validateRefreshBoundCsrf =
  createCsrfValidationMiddleware(
    "refresh-bound",
  );
