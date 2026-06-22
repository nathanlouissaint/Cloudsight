/*
|--------------------------------------------------------------------------
| Alerts Domain Types
|--------------------------------------------------------------------------
|
| Cost anomalies and budget alerts.
|
*/

export interface Alert {
  id: string;
  service: string;
  severity: string;
  message: string;
}

export interface AlertsResponse {
  alerts: Alert[];
}
