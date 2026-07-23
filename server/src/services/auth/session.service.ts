import { Session } from "@prisma/client";
import crypto from "crypto";

import { refreshTokenService } from "./refresh-token.service";
import { sessionRepository } from "../../repositories/auth/session.repository";

import { CreateSessionInput } from "../../types/auth/session.types";

export class SessionService {
  /**
   * Hash a refresh token before storing it.
   */
  hashRefreshToken(token: string): string {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }

  /**
   * Create a new authenticated session.
   */
  async createSession(
    input: Omit<CreateSessionInput, "refreshTokenHash">,
    refreshToken: string,
  ): Promise<Session> {
    return sessionRepository.create({
      ...input,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
    });
  }

  /**
   * Validate a refresh token.
   */
  async validateRefreshToken(
    refreshToken: string,
  ) {
    const hashed =
      this.hashRefreshToken(refreshToken);

    const session =
      await sessionRepository.findByRefreshTokenHash(
        hashed,
      );

    if (!session) {
      return null;
    }

    if (session.revokedAt) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      return null;
    }

    return session;
  }

  /**
   * Rotate an existing session and issue a new refresh token.
   */
  async refreshSession(
    refreshToken: string,
  ) {
    const session =
      await this.validateRefreshToken(
        refreshToken,
      );

    if (!session) {
      throw new Error(
        "INVALID_REFRESH_TOKEN",
      );
    }

    const newRefreshToken =
      refreshTokenService.generate();

    await this.rotateRefreshToken(
      session.id,
      newRefreshToken,
    );

    await this.touch(session.id);

    return {
      session,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Return all active sessions for a user.
   */
  async listActiveSessions(
    userId: string,
    currentSessionId: string,
  ) {
    const sessions =
      await sessionRepository.findActiveByUserId(
        userId,
      );

    return sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      isCurrent:
        session.id === currentSessionId,
    }));
  }

  /**
   * Revoke a session owned by the authenticated user.
   */
  async revokeOwnedSession(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const session =
      await sessionRepository.findById(
        sessionId,
      );

    if (!session) {
      throw new Error(
        "SESSION_NOT_FOUND",
      );
    }

    if (session.userId !== userId) {
      throw new Error(
        "SESSION_FORBIDDEN",
      );
    }

    if (!session.revokedAt) {
      await sessionRepository.revoke(
        sessionId,
      );
    }
  }

  /**
   * Rotate a refresh token.
   */
  async rotateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
  ): Promise<Session> {
    return sessionRepository.updateRefreshTokenHash(
      sessionId,
      this.hashRefreshToken(
        newRefreshToken,
      ),
    );
  }

  /**
   * Update last activity timestamp.
   */
  async touch(
    sessionId: string,
  ): Promise<Session> {
    return sessionRepository.touch(
      sessionId,
    );
  }

  /**
   * Logout one device.
   */
  async revokeSession(
    sessionId: string,
  ): Promise<Session> {
    return sessionRepository.revoke(
      sessionId,
    );
  }

  /**
   * Logout every device.
   */
  async revokeAllSessions(
    userId: string,
  ): Promise<number> {
    return sessionRepository.revokeAllForUser(
      userId,
    );
  }

  /**
   * Delete expired sessions.
   */
  async cleanupExpiredSessions(): Promise<number> {
    return sessionRepository.deleteExpired();
  }
}

export const sessionService =
  new SessionService();