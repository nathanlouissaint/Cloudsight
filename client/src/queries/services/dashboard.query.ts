import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
import { dashboardMock } from "../../mocks/dashboard.mock";
import { USE_MOCK_DATA } from "../../config/features";
import { queryKeys } from "../queryKeys";

import type { DashboardResponse } from "../../types/dashboard";

async function fetchDashboard() {
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
  });
}
