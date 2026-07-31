export type AuditEventType =
  | "LOGIN"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "SESSION_REVOKED";

export interface AuditEvent {
  id: string;

  eventType: AuditEventType;

  ipAddress: string | null;

  userAgent: string | null;

  deviceName: string | null;

  createdAt: string;
}