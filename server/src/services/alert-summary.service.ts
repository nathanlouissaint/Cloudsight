import type { AlertModel } from "../types/alert.types";

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  monitoring: number;
}

export class AlertSummaryService {
  build(alerts: AlertModel[]): AlertSummary {
    return {
      total: alerts.length,

      critical: alerts.filter(
        (alert) => alert.severity === "critical"
      ).length,

      warning: alerts.filter(
        (alert) => alert.severity === "warning"
      ).length,

      monitoring: alerts.filter(
        (alert) => alert.status === "monitoring"
      ).length,
    };
  }
}

export const alertSummaryService =
  new AlertSummaryService();
