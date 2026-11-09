import { randomUUID } from "node:crypto";
import type { Session } from "@prisma/client";

import { prisma } from "../config/prisma";
import {
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from "./token.service";

export interface SessionMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceName?: string | null;
}

export interface CreatedSession {
  session: Session;
  refreshToken: string;
}

export type RefreshRotationResult =
  | {
      status: "rotated";
      previousSession: Session;
      session: Session;
      refreshToken: string;
    }
  | {
      status: "invalid" | "expired" | "reused";
    };

function isSessionInactive(session: Pick<Session, "expiresAt" | "revokedAt" | "replacedAt">, now: Date) {
  return (
    session.revokedAt !== null ||
    session.replacedAt !== null ||
    session.expiresAt <= now
  );
}

async function markFamilyReused(session: Session, now: Date) {
  await prisma.$transaction([
    prisma.session.update({
      where: { id: session.id },
      data: { reuseDetectedAt: session.reuseDetectedAt ?? now },
    }),
    prisma.session.updateMany({
      where: {
        tokenFamilyId: session.tokenFamilyId,
        revokedAt: null,
      },
      data: { revokedAt: now },
    }),
  ]);
}

export async function createSession(
  userId: string,
  metadata: SessionMetadata = {},
  tokenFamilyId = randomUUID(),
): Promise<CreatedSession> {
  const refreshToken = createRefreshToken();

  const session = await prisma.session.create({
    data: {
      id: randomUUID(),
      userId,
      tokenFamilyId,
      refreshTokenHash: hashRefreshToken(refreshToken),
      ipAddress: metadata.ipAddress ?? null,
      userAgent: metadata.userAgent ?? null,
      deviceName: metadata.deviceName ?? null,
      expiresAt: getRefreshTokenExpiresAt(),
      updatedAt: new Date(),
    },
  });

  return { session, refreshToken };
}

export async function detectRefreshTokenReuse(refreshToken: string) {
  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
  });

  if (!session) {
    return false;
  }

  const now = new Date();

  if (!isSessionInactive(session, now)) {
    return false;
  }

  if (session.replacedAt || session.revokedAt) {
    await markFamilyReused(session, now);
    return true;
  }

  return false;
}

export async function rotateRefreshToken(
  refreshToken: string,
  metadata: SessionMetadata = {},
): Promise<RefreshRotationResult> {
  const tokenHash = hashRefreshToken(refreshToken);
  const current = await prisma.session.findUnique({
    where: { refreshTokenHash: tokenHash },
  });

  if (!current) {
    return { status: "invalid" };
  }

  const now = new Date();

  if (current.replacedAt || current.revokedAt) {
    await markFamilyReused(current, now);
    return { status: "reused" };
  }

  if (current.expiresAt <= now) {
    await prisma.session.update({
      where: { id: current.id },
      data: { revokedAt: now },
    });
    return { status: "expired" };
  }

  const nextSessionId = randomUUID();
  const nextRefreshToken = createRefreshToken();
  const nextHash = hashRefreshToken(nextRefreshToken);

  const result = await prisma.$transaction(async (tx) => {
    const claimed = await tx.session.updateMany({
      where: {
        id: current.id,
        revokedAt: null,
        replacedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        replacedAt: now,
        replacedBySessionId: nextSessionId,
        lastUsedAt: now,
      },
    });

    if (claimed.count !== 1) {
      return null;
    }

    const session = await tx.session.create({
      data: {
        id: nextSessionId,
        userId: current.userId,
        tokenFamilyId: current.tokenFamilyId,
        refreshTokenHash: nextHash,
        ipAddress: metadata.ipAddress ?? current.ipAddress,
        userAgent: metadata.userAgent ?? current.userAgent,
        deviceName: metadata.deviceName ?? current.deviceName,
        expiresAt: current.expiresAt,
        updatedAt: now,
      },
    });

    return session;
  });

  if (!result) {
    await markFamilyReused(current, now);
    return { status: "reused" };
  }

  return {
    status: "rotated",
    previousSession: current,
    session: result,
    refreshToken: nextRefreshToken,
  };
}

export async function revokeSession(sessionId: string) {
  const result = await prisma.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count === 1;
}

export async function revokeRefreshToken(refreshToken: string) {
  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
    select: { id: true },
  });

  if (!session) {
    return false;
  }

  return revokeSession(session.id);
}

export async function revokeTokenFamily(tokenFamilyId: string) {
  const result = await prisma.session.updateMany({
    where: { tokenFamilyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count;
}
