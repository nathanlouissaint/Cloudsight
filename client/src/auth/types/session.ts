export interface Session {
  id: string;
  deviceName: string;

  browser: string;
  browserVersion: string | null;
  operatingSystem: string;

  deviceType:
    | "Desktop"
    | "Mobile"
    | "Tablet"
    | "Unknown";

  userAgent: string | null;
  ipAddress: string | null;

  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;

  isCurrent: boolean;
}

export interface LogoutAllSessionsResponse {
  revokedSessions: number;
}