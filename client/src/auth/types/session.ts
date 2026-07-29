export interface Session {
  id: string;
  deviceName: string | null;
  userAgent: string;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface LogoutAllSessionsResponse {
  revokedSessions: number;
}
