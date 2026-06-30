import {
  useAccountsAnalyticsQuery,
} from "../queries/services/accounts-analytics.query";

export function useAccountsAnalytics() {
  return useAccountsAnalyticsQuery();
}
