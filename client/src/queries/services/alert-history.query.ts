import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
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
  return useQuery({
    queryKey: queryKeys.alertHistory,
    queryFn: fetchAlertHistory,
    staleTime: 1000 * 60 * 5,
  });
}
