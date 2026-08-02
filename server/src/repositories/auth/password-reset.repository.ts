import {
  PasswordResetToken,
} from "@prisma/client";

import { prisma } from "../../config/prisma";

export interface CreatePasswordResetTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class PasswordResetRepository {
  /**
   * Create a password reset token.
   */
  async create(
    input: CreatePasswordResetTokenInput,
  ): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: input,
    });
  }

  /**
   * Find a password reset token.
   */
  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
    });
  }

  /**
   * Delete a password reset token.
   */
  async delete(
    id: string,
  ): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Delete expired password reset tokens.
   */
  async deleteExpired(): Promise<number> {
    const result =
      await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

    return result.count;
  }

  /**
   * Delete all password reset tokens
   * for a specific user.
   */
  async deleteForUser(
    userId: string,
  ): Promise<number> {
    const result =
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId,
        },
      });

    return result.count;
  }
}

export const passwordResetRepository =
  new PasswordResetRepository();