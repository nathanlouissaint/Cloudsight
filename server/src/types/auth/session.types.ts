import { Session } from "@prisma/client";

import type {
  DeviceType,
} from "../../services/auth/device.service";

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

export interface SessionResponse {
  id: string;
  deviceName: string;
  browser: string;
  browserVersion: string | null;
  operatingSystem: string;
  deviceType: DeviceType;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}