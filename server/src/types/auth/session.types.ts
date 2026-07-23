import { Session } from "@prisma/client";

export type SessionRecord = Session;

export interface CreateSessionInput {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
}

export interface UpdateSessionInput {
  refreshTokenHash?: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  revokedAt?: Date | null;
}

export interface SessionFilters {
  userId?: string;
  activeOnly?: boolean;
}