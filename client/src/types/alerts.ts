export interface Alert {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  date: string;
}

export interface AlertsResponse {
  alerts: Alert[];
}
