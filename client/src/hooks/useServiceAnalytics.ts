import {
  useServiceAnalyticsQuery,
} from "../queries/services/service-analytics.query";

export function useServiceAnalytics() {
  return useServiceAnalyticsQuery();
}
