import type { User } from "@prisma/client";

export type SessionIssuanceUser = Pick<
  User,
  | "id"
  | "email"
  | "name"
  | "avatarUrl"
  | "authProvider"
>;

import {
  refreshTokenService,
} from "./refresh-token.service";
import {
  sessionMetadataService,
} from "./session-metadata.service";
import {
  sessionService,
} from "./session.service";
import {
  generateAccessToken,
} from "./token.service";

export interface SessionIssuanceContext {
  userAgent?: string;
  ipAddress?: string;
}

export interface IssuedCloudSightSession {
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: Date;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    authProvider: User["authProvider"];
  };
}

export class SessionIssuanceService {
  async issue(
    user: SessionIssuanceUser,
    context: SessionIssuanceContext,
  ): Promise<IssuedCloudSightSession> {
    const sessionMetadata =
      sessionMetadataService.build(
        context.userAgent,
        context.ipAddress,
      );

    const refreshToken =
      refreshTokenService.generate();

    const session =
      await sessionService.createSession(
        {
          userId: user.id,
          expiresAt:
            refreshTokenService.getExpirationDate(),
          userAgent:
            sessionMetadata.userAgent,
          ipAddress:
            sessionMetadata.ipAddress,
        },
        refreshToken,
      );

    const accessToken =
      generateAccessToken({
        userId: user.id,
        email: user.email,
        sessionId: session.id,
      });

    return {
      accessToken,
      refreshToken,
      sessionExpiresAt: session.expiresAt,
      sessionId: session.id,
      ipAddress: sessionMetadata.ipAddress,
      userAgent: sessionMetadata.userAgent,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
      },
    };
  }
}

export const sessionIssuanceService =
  new SessionIssuanceService();
