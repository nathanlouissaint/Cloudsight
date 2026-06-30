import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
import { USE_MOCK_DATA } from "../../config/features";
import { dashboardMock } from "../../mocks/dashboard.mock";
import { queryKeys } from "../queryKeys";

import type { DashboardResponse } from "../../types/dashboard";

async function fetchDashboard(): Promise<DashboardResponse> {
  if (USE_MOCK_DATA) {
    return dashboardMock;
  }

  return apiRequest<DashboardResponse>(
    "/dashboard"
  );
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 5,
  });
}
