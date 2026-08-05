import {
  EmailVerificationToken,
} from "@prisma/client";

import { prisma } from "../../config/prisma";

export interface CreateEmailVerificationTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class EmailVerificationRepository {
  /**
   * Create a new email verification token.
   */
  async create(
    input: CreateEmailVerificationTokenInput,
  ): Promise<EmailVerificationToken> {
    return prisma.emailVerificationToken.create({
      data: input,
    });
  }

  /**
   * Find a verification token.
   */
  async findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null> {
    return prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
    });
  }

  /**
   * Find a verification token with its user.
   */
  async findByTokenHashWithUser(
    tokenHash: string,
    ) {
    return prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Mark a verification token as used.
   */
  async markUsed(
    id: string,
  ): Promise<EmailVerificationToken> {
    return prisma.emailVerificationToken.update({
      where: {
        id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  /**
   * Delete a verification token.
   */
  async delete(
    id: string,
  ): Promise<EmailVerificationToken> {
    return prisma.emailVerificationToken.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Delete all verification tokens for a user.
   */
  async deleteForUser(
    userId: string,
  ): Promise<number> {
    const result =
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId,
        },
      });

    return result.count;
  }

  /**
   * Delete expired verification tokens.
   */
  async deleteExpired(): Promise<number> {
    const result =
      await prisma.emailVerificationToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

    return result.count;
  }
}

export const emailVerificationRepository =
  new EmailVerificationRepository();