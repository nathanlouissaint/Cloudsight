import crypto from "crypto";
import type {
  Request,
  RequestHandler,
} from "express";
import type { AuthenticatedRequest } from "../types/auth/request.types";
import rateLimit, {
  ipKeyGenerator,
  type Options,
} from "express-rate-limit";

import {
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_OPTIONS,
  type RateLimitPolicy,
} from "../config/rate-limit.config";

export function createRateLimiter(
  policy: RateLimitPolicy,
  options: Partial<Pick<Options, "keyGenerator">> = {},
): RequestHandler {
  return rateLimit({
    ...policy,
    ...RATE_LIMIT_OPTIONS,
    ...options,
    handler: (_req, res) => {
      res.status(429).json({
        message: RATE_LIMIT_MESSAGE,
      });
    },
  });
}

export function ipRateLimitKey(
  req: Request,
): string {
  return ipKeyGenerator(req.ip ?? "unknown");
}

export function normalizedEmailHash(
  email: string,
): string {
  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase(), "utf8")
    .digest("hex");
}

export function emailAndIpRateLimitKey(
  req: Request,
  email: string | undefined,
): string {
  const ip = ipRateLimitKey(req);

  return email
    ? `${ip}:${normalizedEmailHash(email)}`
    : ip;
}

export function requestEmailAndIpRateLimitKey(
  req: Request,
): string {
  const body = req.body;

  if (
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
  ) {
    return emailAndIpRateLimitKey(
      req,
      body.email,
    );
  }

  return ipRateLimitKey(req);
}

export function userAndIpRateLimitKey(
  req: Request,
  userId: string | undefined,
): string {
  return userId
    ? `${ipRateLimitKey(req)}:${userId}`
    : ipRateLimitKey(req);
}

export function authenticatedUserAndIpRateLimitKey(
  req: AuthenticatedRequest,
): string {
  return userAndIpRateLimitKey(
    req,
    req.user?.userId,
  );
}

export function sessionAndIpRateLimitKey(
  req: Request,
  sessionId: string | undefined,
): string {
  return sessionId
    ? `${ipRateLimitKey(req)}:${sessionId}`
    : ipRateLimitKey(req);
}
