import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
import { costsMock } from "../../mocks/costs.mock";
import { USE_MOCK_DATA } from "../../config/features";
import { queryKeys } from "../queryKeys";

import type { CostsResponse } from "../../types/costs";

async function fetchCosts() {
  if (USE_MOCK_DATA) {
    return costsMock;
  }

  return apiRequest<CostsResponse>(
    "/costs"
  );
}

export function useCostsQuery() {
  return useQuery({
    queryKey: queryKeys.costs,
    queryFn: fetchCosts,
  });
}
