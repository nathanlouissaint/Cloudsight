import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
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
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.accountsAnalytics(
      currentOrganizationId,
    ),
    queryFn: fetchAccountsAnalytics,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
