import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import type {
  ServiceBreakdownItem,
} from "../types/service-analytics";

export function useServiceAnalytics() {
  return useQuery({
    queryKey: ["service-breakdown"],

    queryFn: () =>
      apiRequest<ServiceBreakdownItem[]>(
        "/analytics/services"
      ),

    staleTime: 1000 * 60 * 5,
  });
}
