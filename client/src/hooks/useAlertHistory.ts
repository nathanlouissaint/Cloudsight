import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../api/client";

import { queryKeys } from "../lib/queryKeys";

import type {
  AlertHistoryResponse,
} from "../types/alert-history";

export function useAlertHistory() {

  return useQuery({

    queryKey:
      queryKeys.alertHistory,

    queryFn:
      () =>
        apiRequest<AlertHistoryResponse>(
          "/alerts/history"
        ),

    staleTime:
      1000 * 60 * 5,

  });

}
