import {
  createAlertHistoryRecord,
  findRecentAlertHistory,
} from "../repositories/alert-history.repository";

import type {
  AlertModel,
} from "../types/alert.types";

export class AlertHistoryService {

  async getRecentHistory(
    limit = 10
  ) {
    return findRecentAlertHistory(
      limit
    );
  }

  async recordAlerts(
    alerts: AlertModel[]
  ) {
    for (const alert of alerts) {
      await createAlertHistoryRecord(
        alert
      );
    }
  }

}

export const alertHistoryService =
  new AlertHistoryService();
