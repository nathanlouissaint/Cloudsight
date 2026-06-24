import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import type {
  AccountsResponse,
} from "../types/accounts";

export function useAccountsAnalytics() {
  return useQuery({
    queryKey: ["accounts-analytics"],

    queryFn: () =>
      apiRequest<AccountsResponse>(
        "/analytics/accounts"
      ),

    staleTime:
      1000 * 60 * 5,
  });
}
