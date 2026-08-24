import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { USE_MOCK_DATA } from "../../config/features";
import { alertsMock } from "../../mocks/alerts.mock";
import { queryKeys } from "../queryKeys";

import type { AlertsResponse } from "../../types/alerts";

async function fetchAlerts(): Promise<AlertsResponse> {
  if (USE_MOCK_DATA) {
    return alertsMock;
  }

  return apiRequest<AlertsResponse>(
    "/alerts"
  );
}

export function useAlertsQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.alerts(
      currentOrganizationId,
    ),
    queryFn: fetchAlerts,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
