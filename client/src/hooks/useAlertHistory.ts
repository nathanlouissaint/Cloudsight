import { useAlertHistoryQuery } from "../queries/services/alert-history.query";

export function useAlertHistory() {
  return useAlertHistoryQuery();
}
