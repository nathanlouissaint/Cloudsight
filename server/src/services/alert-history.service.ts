import {
  createAlertHistoryRecord,
  findRecentAlertHistory,
} from "../repositories/alert-history.repository";

import type {
  AlertModel,
} from "../types/alert.types";

export class AlertHistoryService {
  async getRecentHistory(
    organizationId: string,
    limit = 10,
  ) {
    return findRecentAlertHistory(
      organizationId,
      limit,
    );
  }

  async recordAlerts(
    organizationId: string,
    alerts: AlertModel[],
  ) {
    for (const alert of alerts) {
      await createAlertHistoryRecord(
        organizationId,
        alert,
      );
    }
  }
}

export const alertHistoryService =
  new AlertHistoryService();