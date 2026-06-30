import { useAlertsQuery } from "../queries/services/alerts.query";

export function useAlerts() {
  return useAlertsQuery();
}
