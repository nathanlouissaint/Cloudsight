import {
  AuditEventType,
  EmailVerificationToken,
} from "@prisma/client";

import { prisma } from "../../config/prisma";

export interface CreateEmailVerificationTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export type EmailVerificationConsumption =
  | "VERIFIED"
  | "ALREADY_VERIFIED"
  | "INVALID"
  | "EXPIRED";

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
   * Claim a one-use token and apply all verification side effects atomically.
   * A concurrent/repeated request receives the same successful domain result
   * after the winning transaction commits, without creating a second audit.
   */
  async consumeAndVerify(
    tokenHash: string,
    now = new Date(),
  ): Promise<EmailVerificationConsumption> {
    return prisma.$transaction(async (tx) => {
      const record =
        await tx.emailVerificationToken.findUnique({
          where: { tokenHash },
          include: {
            user: {
              select: { emailVerifiedAt: true },
            },
          },
        });

      if (!record) return "INVALID";

      if (record.usedAt) {
        return record.user.emailVerifiedAt
          ? "ALREADY_VERIFIED"
          : "INVALID";
      }

      if (record.expiresAt < now) return "EXPIRED";

      const claim =
        await tx.emailVerificationToken.updateMany({
          where: {
            id: record.id,
            usedAt: null,
            expiresAt: { gte: now },
          },
          data: { usedAt: now },
        });

      if (claim.count === 0) {
        const current =
          await tx.emailVerificationToken.findUnique({
            where: { id: record.id },
            include: {
              user: {
                select: { emailVerifiedAt: true },
              },
            },
          });

        if (current?.usedAt && current.user.emailVerifiedAt) {
          return "ALREADY_VERIFIED";
        }

        return current && current.expiresAt < now
          ? "EXPIRED"
          : "INVALID";
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: now },
      });

      await tx.securityAudit.create({
        data: {
          userId: record.userId,
          eventType: AuditEventType.EMAIL_VERIFIED,
        },
      });

      return "VERIFIED";
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
   * Delete unused verification tokens for a user.
   */
  async deleteUnusedForUser(
    userId: string,
  ): Promise<number> {
    const result =
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId,
          usedAt: null,
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
