import { prisma } from "../config/prisma";

import type {
  AlertModel,
} from "../types/alert.types";

export async function findRecentAlertHistory(
  organizationId: string,
  limit = 10,
) {
  return prisma.alertHistory.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      occurredAt: "desc",
    },
    take: limit,
  });
}

export async function createAlertHistoryRecord(
  organizationId: string,
  alert: AlertModel,
) {
  return prisma.alertHistory.create({
    data: {
      organizationId,
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      description: alert.description,
      recommendation:
        alert.recommendation,
      metric: alert.metric,
      currentValue:
        alert.currentValue,
      threshold: alert.threshold,
      occurredAt:
        new Date(alert.date),
    },
  });
}