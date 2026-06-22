import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { USE_MOCK_DATA } from "../config/features";
import { alertsMock } from "../mocks/alerts.mock";
import type { AlertsResponse } from "../types/alerts";

export function useAlerts() {
  const [data, setData] =
    useState<AlertsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        if (USE_MOCK_DATA) {
          setData(alertsMock);
          return;
        }

        const response =
          await apiRequest<AlertsResponse>(
            "/alerts"
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

    fetchAlerts();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
