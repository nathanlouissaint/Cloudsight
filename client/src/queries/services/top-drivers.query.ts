import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
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
  return useQuery({
    queryKey: queryKeys.topDrivers,
    queryFn: fetchTopDrivers,
    staleTime: 1000 * 60 * 5,
  });
}
