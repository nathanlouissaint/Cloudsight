import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import type {
  TopDriver,
} from "../types/service-analytics";

export function useTopDrivers() {
  return useQuery({
    queryKey: ["top-drivers"],

    queryFn: () =>
      apiRequest<TopDriver[]>(
        "/analytics/services/top-drivers"
      ),

    staleTime: 1000 * 60 * 5,
  });
}
