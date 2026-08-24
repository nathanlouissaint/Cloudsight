import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { USE_MOCK_DATA } from "../../config/features";
import { costsMock } from "../../mocks/costs.mock";
import { queryKeys } from "../queryKeys";

import type { CostsResponse } from "../../types/costs";

async function fetchCosts(): Promise<CostsResponse> {
  if (USE_MOCK_DATA) {
    return costsMock;
  }

  return apiRequest<CostsResponse>(
    "/costs"
  );
}

export function useCostsQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.costs(
      currentOrganizationId,
    ),
    queryFn: fetchCosts,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
