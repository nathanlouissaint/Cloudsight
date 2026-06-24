import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { USE_MOCK_DATA } from "../config/features";
import { alertsMock } from "../mocks/alerts.mock";
import { queryKeys } from "../lib/queryKeys";
import type { AlertsResponse } from "../types/alerts";

export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts,

    queryFn: async (): Promise<AlertsResponse> => {
      if (USE_MOCK_DATA) {
        return alertsMock;
      }

      return apiRequest<AlertsResponse>(
        "/alerts"
      );
    },

    staleTime: 1000 * 60 * 5,
  });
}
