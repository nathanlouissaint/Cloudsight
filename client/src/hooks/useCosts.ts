import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { CostsResponse } from "../types/costs";

export function useCosts() {
  const [data, setData] =
    useState<CostsResponse>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchCosts() {
      try {
        const response =
          await apiRequest<CostsResponse>(
            "/costs"
          );

        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCosts();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
