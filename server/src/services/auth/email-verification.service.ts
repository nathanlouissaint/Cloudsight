import crypto from "crypto";

import {
  emailVerificationRepository,
} from "../../repositories/auth/email-verification.repository";

import {
  userRepository,
} from "../../repositories/auth/user.repository";

import {
  emailService,
} from "../email/email.service";
import {
  AuthDomainError,
} from "../../errors/auth.errors";

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
   * Create and persist a new verification token.
   */
  private async createVerificationToken(
    userId: string,
  ): Promise<string> {
    const token =
      this.generateToken();

    await emailVerificationRepository.create({
      userId,
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
   * Create an email verification request.
   */
  async createVerificationRequest(
    email: string,
  ): Promise<void> {
    const user =
      await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthDomainError(
        "USER_NOT_FOUND",
        "Registration verification user was not found.",
      );
    }

    await emailVerificationRepository.deleteForUser(
      user.id,
    );

    const token =
      await this.createVerificationToken(
        user.id,
      );

    await emailService.sendVerificationEmail({
      email: user.email,
      token,
    });
  }

  /**
   * Resend verification for an authenticated user.
   */
  async resendVerification(
    userId: string,
  ) {
    const user =
      await userRepository.findAuthUserById(
        userId,
      );

    if (!user) {
      throw new AuthDomainError(
        "USER_NOT_FOUND",
        "Verification user was not found.",
      );
    }

    const message =
      "Email verification request processed successfully.";

    if (user.emailVerifiedAt) {
      return {
        message,
      };
    }

    await emailVerificationRepository.deleteUnusedForUser(
      user.id,
    );

    const verificationToken =
      await this.createVerificationToken(
        user.id,
      );

    await emailService.sendVerificationEmail({
      email: user.email,
      token: verificationToken,
    });

    return {
      message,
    };
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
      throw new AuthDomainError(
        "INVALID_VERIFICATION_TOKEN",
        "Verification token is invalid.",
      );
    }

    if (record.usedAt) {
      throw new AuthDomainError(
        "VERIFICATION_TOKEN_ALREADY_USED",
        "Verification token has already been used.",
      );
    }

    if (
      record.expiresAt <
      new Date()
    ) {
      throw new AuthDomainError(
        "VERIFICATION_TOKEN_EXPIRED",
        "Verification token has expired.",
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
    const result =
      await emailVerificationRepository.consumeAndVerify(
        this.hashToken(token),
      );

    if (result === "INVALID") {
      throw new AuthDomainError(
        "INVALID_VERIFICATION_TOKEN",
        "Verification token is invalid.",
      );
    }

    if (result === "EXPIRED") {
      throw new AuthDomainError(
        "VERIFICATION_TOKEN_EXPIRED",
        "Verification token has expired.",
      );
    }

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
