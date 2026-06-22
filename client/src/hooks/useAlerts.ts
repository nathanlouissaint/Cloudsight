/*
|--------------------------------------------------------------------------
| useAlerts
|--------------------------------------------------------------------------
|
| Cost anomalies and alerts.
|
| Endpoint:
| GET /alerts
|
*/

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { AlertsResponse } from "../types/alerts";

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
