import { Session } from "@prisma/client";
import crypto from "crypto";

import { refreshTokenService } from "./refresh-token.service";
import { deviceService } from "./device.service";
import { sessionRepository } from "../../repositories/auth/session.repository";

import type {
  CreateSessionInput,
  SessionResponse,
} from "../../types/auth/session.types";
import {
  AuthDomainError,
} from "../../errors/auth.errors";

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
    const device =
      deviceService.parse(
        input.userAgent,
      );

    return sessionRepository.create({
      ...input,

      deviceName:
        input.deviceName ??
        device.deviceName,

      refreshTokenHash:
        this.hashRefreshToken(
          refreshToken,
        ),
    });
  }

  /**
   * Validate an authenticated access session.
   */
  async validateAccessSession(
    sessionId: string,
  ): Promise<Session> {
    const session =
      await sessionRepository.findById(
        sessionId,
      );

    if (!session) {
      throw new AuthDomainError(
        "SESSION_NOT_FOUND",
        "Session was not found.",
      );
    }

    if (session.revokedAt) {
      throw new AuthDomainError(
        "SESSION_REVOKED",
        "Session has been revoked.",
      );
    }

    if (
      session.expiresAt <
      new Date()
    ) {
      throw new AuthDomainError(
        "SESSION_EXPIRED",
        "Session has expired.",
      );
    }

    await this.touch(
      session.id,
    );

    return session;
  }

  /**
   * Validate a refresh token.
   */
  async validateRefreshToken(
    refreshToken: string,
  ) {
    const hashed =
      this.hashRefreshToken(
        refreshToken,
      );

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

    if (
      session.expiresAt <
      new Date()
    ) {
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
      throw new AuthDomainError(
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid.",
      );
    }

    const newRefreshToken =
      refreshTokenService.generate();

    const rotated =
      await sessionRepository.compareAndSwapRefreshTokenHash(
      session.id,
      this.hashRefreshToken(refreshToken),
      this.hashRefreshToken(newRefreshToken),
    );

    if (!rotated) {
      throw new AuthDomainError(
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid.",
      );
    }

    await this.touch(
      session.id,
    );

    return {
      session,
      refreshToken:
        newRefreshToken,
    };
  }

  /**
   * Return all active sessions for a user.
   */
  async listActiveSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionResponse[]> {
    const sessions =
      await sessionRepository.findActiveByUserId(
        userId,
      );

    return sessions.map((session) => {
      const device =
        deviceService.parse(
          session.userAgent,
        );

      return {
        id: session.id,
        deviceName:
          device.deviceName,
        browser:
          device.browser,
        browserVersion:
          device.browserVersion,
        operatingSystem:
          device.operatingSystem,
        deviceType:
          device.deviceType,
        userAgent:
          session.userAgent,
        ipAddress:
          session.ipAddress,
        createdAt:
          session.createdAt,
        lastUsedAt:
          session.lastUsedAt,
        expiresAt:
          session.expiresAt,
        isCurrent:
          session.id ===
          currentSessionId,
      };
    });
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
      throw new AuthDomainError(
        "SESSION_NOT_FOUND",
        "Session was not found.",
      );
    }

    if (
      session.userId !==
      userId
    ) {
      throw new AuthDomainError(
        "SESSION_FORBIDDEN",
        "Session access is forbidden.",
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
   * Revoke every active session except the current one.
   */
  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    return sessionRepository.revokeAllExcept(
      userId,
      currentSessionId,
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
