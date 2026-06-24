import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { queryKeys } from "../lib/queryKeys";
import type { CostsResponse } from "../types/costs";

export function useCosts() {
  return useQuery({
    queryKey: queryKeys.costs,

    queryFn: async (): Promise<CostsResponse> =>
      apiRequest<CostsResponse>("/costs"),

    staleTime: 1000 * 60 * 5,
  });
}
