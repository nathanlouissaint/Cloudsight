import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { USE_MOCK_DATA } from "../config/features";
import { dashboardMock } from "../mocks/dashboard.mock";
import { queryKeys } from "../lib/queryKeys";
import type { DashboardResponse } from "../types/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,

    queryFn: async (): Promise<DashboardResponse> => {
      if (USE_MOCK_DATA) {
        return dashboardMock;
      }

      return apiRequest<DashboardResponse>(
        "/dashboard"
      );
    },

    staleTime: 1000 * 60 * 5,
  });
}
