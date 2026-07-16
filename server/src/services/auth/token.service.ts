import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function generateAccessToken(
  payload: JwtPayload
): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,
    getJwtSecret()
  ) as unknown as JwtPayload;
}