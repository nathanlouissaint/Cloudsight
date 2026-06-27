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

export interface Alert {
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

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  monitoring: number;
}

export interface AlertMetrics {
  active: number;
  resolved: number;
  highestSeverity: AlertSeverity | null;
}

export interface AlertsResponse {
  summary: AlertSummary;
  metrics: AlertMetrics;
  alerts: Alert[];
}
