import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { queryKeys } from "../queryKeys";

import type {
  TopDriver,
} from "../../types/service-analytics";

async function fetchTopDrivers(): Promise<TopDriver[]> {
  return apiRequest<TopDriver[]>(
    "/analytics/services/top-drivers"
  );
}

export function useTopDriversQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.topDrivers(
      currentOrganizationId,
    ),
    queryFn: fetchTopDrivers,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
