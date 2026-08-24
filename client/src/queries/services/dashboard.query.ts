import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";

import {
  useOrganization,
} from "../../organizations/useOrganization";

import {
  USE_MOCK_DATA,
} from "../../config/features";

import {
  dashboardMock,
} from "../../mocks/dashboard.mock";

import {
  queryKeys,
} from "../queryKeys";

import type {
  DashboardResponse,
} from "../../types/dashboard";

async function fetchDashboard():
  Promise<DashboardResponse> {
  if (USE_MOCK_DATA) {
    return dashboardMock;
  }

  return apiRequest<DashboardResponse>(
    "/dashboard",
  );
}

export function useDashboardQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey:
      queryKeys.dashboard(
        currentOrganizationId,
      ),

    queryFn: fetchDashboard,

    enabled:
      currentOrganizationId !== null,

    staleTime:
      1000 * 60 * 5,
  });
}
