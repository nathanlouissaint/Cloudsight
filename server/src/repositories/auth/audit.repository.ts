import {
  AuditEventType,
  SecurityAudit,
} from "@prisma/client";

import { prisma } from "../../config/prisma";

export interface CreateAuditInput {
  userId: string;

  eventType: AuditEventType;

  ipAddress?: string;

  userAgent?: string;

  deviceName?: string;
}

export class AuditRepository {
  /**
   * Create an audit event.
   */
  async create(
    input: CreateAuditInput,
  ): Promise<SecurityAudit> {
    return prisma.securityAudit.create({
      data: {
        userId: input.userId,

        eventType:
          input.eventType,

        ipAddress:
          input.ipAddress,

        userAgent:
          input.userAgent,

        deviceName:
          input.deviceName,
      },
    });
  }

  /**
   * Return newest audit events first.
   */
  async findByUserId(
    userId: string,
    limit = 50,
  ): Promise<SecurityAudit[]> {
    return prisma.securityAudit.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: limit,
    });
  }
}

export const auditRepository =
  new AuditRepository();