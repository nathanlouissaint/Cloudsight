/*
|--------------------------------------------------------------------------
| useServices
|--------------------------------------------------------------------------
|
| Service cost analytics.
|
| Endpoint:
| GET /services
|
*/

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { ServicesResponse } from "../types/services";

export function useServices() {
  const [data, setData] =
    useState<ServicesResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response =
          await apiRequest<ServicesResponse>(
            "/services"
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

    fetchServices();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
