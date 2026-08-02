import {
  AuditEventType,
  SecurityAudit,
} from "@prisma/client";

import {
  auditRepository,
} from "../../repositories/auth/audit.repository";

export interface RecordAuditEventInput {
  userId: string;

  eventType: AuditEventType;

  ipAddress?: string;

  userAgent?: string;

  deviceName?: string;
}

export class AuditService {
  /**
   * Records a security audit event.
   */
  async recordEvent(
    input: RecordAuditEventInput,
  ): Promise<SecurityAudit> {
    return auditRepository.create({
      userId: input.userId,

      eventType: input.eventType,

      ipAddress: input.ipAddress,

      userAgent: input.userAgent,

      deviceName: input.deviceName,
    });
  }

  /**
   * Returns a user's audit history.
   */
  async getUserAuditHistory(
    userId: string,
    limit = 50,
  ): Promise<SecurityAudit[]> {
    return auditRepository.findByUserId(
      userId,
      limit,
    );
  }
}

export const auditService =
  new AuditService();