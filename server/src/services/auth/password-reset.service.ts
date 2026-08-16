import crypto from "crypto";

import { passwordResetRepository } from "../../repositories/auth/password-reset.repository";
import { userRepository } from "../../repositories/auth/user.repository";
import { emailService } from "../email/email.service";
import {
  AuthDomainError,
} from "../../errors/auth.errors";

const PASSWORD_RESET_EXPIRATION_MINUTES = 30;

export class PasswordResetService {
  /**
   * Generate a secure reset token.
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hash a reset token before storing it.
   */
  hashToken(token: string): string {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }

  /**
   * Create a password reset request.
   */
  async createResetRequest(
    email: string,
  ): Promise<string> {
    const user =
      await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthDomainError(
        "USER_NOT_FOUND",
        "Password reset user was not found.",
      );
    }

    await passwordResetRepository.deleteForUser(
      user.id,
    );

    const token =
      this.generateToken();

    await passwordResetRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(
        token,
      ),
      expiresAt: new Date(
        Date.now() +
          PASSWORD_RESET_EXPIRATION_MINUTES *
            60 *
            1000,
      ),
    });

    await emailService.sendPasswordResetEmail({
      email: user.email,
      token,
    });

    return token;
  }

  /**
   * Validate a password reset token.
   */
  async validateToken(
    token: string,
  ) {
    const record =
      await passwordResetRepository.findByTokenHash(
        this.hashToken(token),
      );

    if (!record) {
      throw new AuthDomainError(
        "INVALID_RESET_TOKEN",
        "Password reset token is invalid.",
      );
    }

    if (
      record.expiresAt <
      new Date()
    ) {
      throw new AuthDomainError(
        "RESET_TOKEN_EXPIRED",
        "Password reset token has expired.",
      );
    }

    return record;
  }

  /**
   * Consume a password reset token.
   */
  async consumeToken(
    token: string,
  ) {
    const record =
      await this.validateToken(
        token,
      );

    await passwordResetRepository.delete(
      record.id,
    );

    return record;
  }

  /**
   * Delete expired reset tokens.
   */
  async cleanupExpiredTokens(): Promise<number> {
    return passwordResetRepository.deleteExpired();
  }
}

export const passwordResetService =
  new PasswordResetService();
