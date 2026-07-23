import crypto from "crypto";

const REFRESH_TOKEN_BYTES = 64;

export class RefreshTokenService {
  /**
   * Generate a cryptographically secure refresh token.
   */
  generate(): string {
    return crypto
      .randomBytes(REFRESH_TOKEN_BYTES)
      .toString("hex");
  }

  /**
   * Default expiration (30 days).
   */
  getExpirationDate(): Date {
    const expires = new Date();

    expires.setDate(expires.getDate() + 30);

    return expires;
  }
}

export const refreshTokenService =
  new RefreshTokenService();