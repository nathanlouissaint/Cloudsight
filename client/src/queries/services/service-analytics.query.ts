import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
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
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.serviceAnalytics(
      currentOrganizationId,
    ),
    queryFn: fetchServiceAnalytics,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
