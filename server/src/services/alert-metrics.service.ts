import type {
  AlertModel,
} from "../types/alert.types";

export interface AlertMetrics {
  active: number;
  resolved: number;
  highestSeverity:
    | "critical"
    | "warning"
    | "info"
    | null;
}

export class AlertMetricsService {

  build(
    alerts: AlertModel[]
  ): AlertMetrics {

    const active =
      alerts.filter(
        alert =>
          alert.status === "active"
      ).length;

    const resolved =
      alerts.filter(
        alert =>
          alert.status === "resolved"
      ).length;

    const highestSeverity =
      alerts.find(
        alert =>
          alert.severity === "critical"
      )?.severity ??

      alerts.find(
        alert =>
          alert.severity === "warning"
      )?.severity ??

      alerts.find(
        alert =>
          alert.severity === "info"
      )?.severity ??

      null;

    return {
      active,
      resolved,
      highestSeverity,
    };

  }

}

export const alertMetricsService =
  new AlertMetricsService();
