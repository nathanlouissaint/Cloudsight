export type AlertSeverity =
  | "info"
  | "warning"
  | "critical";

export type AlertStatus =
  | "active"
  | "resolved"
  | "monitoring";

export type AlertType =
  | "cost_spike"
  | "budget_risk"
  | "forecast_risk";

export interface AlertModel {

  id: string;

  type: AlertType;

  severity: AlertSeverity;

  status: AlertStatus;

  title: string;

  description: string;

  recommendation: string;

  metric: string;

  currentValue: number;

  threshold: number;

  date: string;

}
