import crypto from "crypto";

import {
  AuditEventType,
} from "@prisma/client";

import {
  emailVerificationRepository,
} from "../../repositories/auth/email-verification.repository";

import {
  userRepository,
} from "../../repositories/auth/user.repository";

import {
  auditService,
} from "./audit.service";

const EMAIL_VERIFICATION_EXPIRATION_MINUTES =
  60;

export class EmailVerificationService {
  /**
   * Generate a verification token.
   */
  generateToken(): string {
    return crypto
      .randomBytes(32)
      .toString("hex");
  }

  /**
   * Hash a verification token.
   */
  hashToken(
    token: string,
  ): string {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }

  /**
   * Create an email verification request.
   */
  async createVerificationRequest(
    email: string,
  ): Promise<string> {
    const user =
      await userRepository.findByEmail(email);

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND",
      );
    }

    await emailVerificationRepository.deleteForUser(
      user.id,
    );

    const token =
      this.generateToken();

    await emailVerificationRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(
        token,
      ),
      expiresAt: new Date(
        Date.now() +
          EMAIL_VERIFICATION_EXPIRATION_MINUTES *
            60 *
            1000,
      ),
    });

    return token;
  }

  /**
   * Validate a verification token.
   */
  async validateToken(
    token: string,
  ) {
    const record =
      await emailVerificationRepository.findByTokenHashWithUser(
        this.hashToken(token),
      );

    if (!record) {
      throw new Error(
        "INVALID_VERIFICATION_TOKEN",
      );
    }

    if (record.usedAt) {
      throw new Error(
        "VERIFICATION_TOKEN_ALREADY_USED",
      );
    }

    if (
      record.expiresAt <
      new Date()
    ) {
      throw new Error(
        "VERIFICATION_TOKEN_EXPIRED",
      );
    }

    return record;
  }

  /**
   * Verify a user's email address.
   */
  async verifyEmail(
    token: string,
  ) {
    const record =
      await this.validateToken(
        token,
      );

    await userRepository.markEmailVerified(
      record.userId,
    );

    await emailVerificationRepository.markUsed(
      record.id,
    );

    await auditService.recordEvent({
      userId: record.userId,
      eventType:
     AuditEventType.EMAIL_VERIFIED,
    });

    return {
      message:
        "Email verified successfully.",
    };
  }

  /**
   * Delete expired verification tokens.
   */
  async cleanupExpiredTokens(): Promise<number> {
    return emailVerificationRepository.deleteExpired();
  }
}

export const emailVerificationService =
  new EmailVerificationService();