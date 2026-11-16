import { createHash, randomBytes } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const JWT_ALGORITHM = "HS256" as const;

export interface AccessTokenClaims {
  subject: string;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
  audience: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

function getJwtIssuer() {
  return process.env.JWT_ISSUER?.trim() || "cloudsight-api";
}

function getJwtAudience() {
  return process.env.JWT_AUDIENCE?.trim() || "cloudsight-web";
}

export function createAccessToken(userId: string) {
  if (!userId.trim()) {
    throw new Error("A user ID is required to create an access token.");
  }

  const options: SignOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    issuer: getJwtIssuer(),
    audience: getJwtAudience(),
    subject: userId,
  };

  return jwt.sign({}, getJwtSecret(), options);
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(refreshToken: string) {
  if (!refreshToken) {
    throw new Error("A refresh token is required to hash.");
  }

  return createHash("sha256")
    .update(refreshToken, "utf8")
    .digest("hex");
}

export function getRefreshTokenExpiresAt(now = new Date()) {
  return new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: [JWT_ALGORITHM],
    issuer: getJwtIssuer(),
    audience: getJwtAudience(),
  });

  if (typeof decoded === "string") {
    throw new Error("Invalid access token claims.");
  }

  const payload = decoded as JwtPayload;

  if (
    typeof payload.sub !== "string" ||
    !payload.sub ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number" ||
    typeof payload.iss !== "string" ||
    typeof payload.aud !== "string"
  ) {
    throw new Error("Invalid access token claims.");
  }

  return {
    subject: payload.sub,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
    issuer: payload.iss,
    audience: payload.aud,
  };
}
