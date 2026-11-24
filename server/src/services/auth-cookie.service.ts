import { parse, serialize } from "cookie";
import type { Request, Response } from "express";

import { REFRESH_TOKEN_TTL_MS } from "./token.service";

const REFRESH_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-cloudsight_refresh"
    : "cloudsight_refresh";

type SameSite = "lax" | "strict" | "none";

function getSameSite(): SameSite {
  const configured = process.env.AUTH_COOKIE_SAMESITE?.trim().toLowerCase();

  if (
    configured === "lax" ||
    configured === "strict" ||
    configured === "none"
  ) {
    return configured;
  }

  return "lax";
}

function getCookieOptions(expiresAt?: Date) {
  const maxAge = expiresAt
    ? Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      )
    : Math.floor(REFRESH_TOKEN_TTL_MS / 1000);

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: getSameSite(),
    path: "/",
    maxAge,
  } as const;
}

export function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
  expiresAt?: Date,
) {
  res.setHeader(
    "Set-Cookie",
    serialize(
      REFRESH_COOKIE_NAME,
      refreshToken,
      getCookieOptions(expiresAt),
    ),
  );
}

export function clearRefreshTokenCookie(res: Response) {
  const options = getCookieOptions();

  res.setHeader(
    "Set-Cookie",
    serialize(
      REFRESH_COOKIE_NAME,
      "",
      {
        ...options,
        maxAge: 0,
        expires: new Date(0),
      },
    ),
  );
}

export function getRefreshTokenFromRequest(req: Request) {
  const header = req.headers.cookie;

  if (!header) {
    return null;
  }

  return parse(header)[REFRESH_COOKIE_NAME] ?? null;
}
