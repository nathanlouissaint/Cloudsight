import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
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
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: fetchAlerts,
    staleTime: 1000 * 60 * 5,
  });
}
