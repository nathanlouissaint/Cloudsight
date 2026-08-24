import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { queryKeys } from "../queryKeys";

import type {
  AlertHistoryResponse,
} from "../../types/alert-history";

async function fetchAlertHistory(): Promise<AlertHistoryResponse> {
  return apiRequest<AlertHistoryResponse>(
    "/alerts/history"
  );
}

export function useAlertHistoryQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.alertHistory(
      currentOrganizationId,
    ),
    queryFn: fetchAlertHistory,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
