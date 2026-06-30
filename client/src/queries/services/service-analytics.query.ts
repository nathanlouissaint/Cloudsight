import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
import { queryKeys } from "../queryKeys";

import type {
  ServiceBreakdownItem,
} from "../../types/service-analytics";

async function fetchServiceAnalytics(): Promise<ServiceBreakdownItem[]> {
  return apiRequest<ServiceBreakdownItem[]>(
    "/analytics/services"
  );
}

export function useServiceAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.serviceAnalytics,
    queryFn: fetchServiceAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}
