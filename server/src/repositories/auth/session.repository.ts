import { Session } from "@prisma/client";

import { prisma } from "../../config/prisma";

import {
  CreateSessionInput,
  UpdateSessionInput,
} from "../../types/auth/session.types";

export class SessionRepository {
  /**
   * Create a new session.
   */
  async create(input: CreateSessionInput): Promise<Session> {
    return prisma.session.create({
      data: {
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceName: input.deviceName,
      },
    });
  }

  /**
   * Find a session by its ID.
   */
  async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  /**
   * Return all active sessions for a user.
   */
  async findActiveByUserId(
    userId: string,
  ): Promise<Session[]> {
    return prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update a session.
   */
  async update(
    id: string,
    input: UpdateSessionInput,
  ): Promise<Session> {
    return prisma.session.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Find a session by refresh-token hash.
   */
  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ) {
    return prisma.session.findUnique({
      where: {
        refreshTokenHash,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Rotate a refresh token.
   */
  async updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string,
  ): Promise<Session> {
    return prisma.session.update({
      where: { id },
      data: {
        refreshTokenHash,
      },
    });
  }

  /**
   * Update the session's last activity timestamp.
   */
  async touch(id: string): Promise<Session> {
    return prisma.session.update({
      where: { id },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Revoke a single session.
   */
  async revoke(id: string): Promise<Session> {
    return prisma.session.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke every active session for a user.
   */
  async revokeAllForUser(
    userId: string,
  ): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Delete expired sessions.
   */
  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}

export const sessionRepository =
  new SessionRepository();