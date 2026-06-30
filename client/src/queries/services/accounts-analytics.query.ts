import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
import { queryKeys } from "../queryKeys";

import type {
  AccountsResponse,
} from "../../types/accounts";

async function fetchAccountsAnalytics(): Promise<AccountsResponse> {
  return apiRequest<AccountsResponse>(
    "/analytics/accounts"
  );
}

export function useAccountsAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.accountsAnalytics,
    queryFn: fetchAccountsAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}
