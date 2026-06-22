/*
|--------------------------------------------------------------------------
| useForecast
|--------------------------------------------------------------------------
|
| Forecast engine data.
|
| Endpoint:
| GET /forecast
|
*/

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { ForecastResponse } from "../types/forecast";

export function useForecast() {
  const [data, setData] =
    useState<ForecastResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const response =
          await apiRequest<ForecastResponse>(
            "/forecast"
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

    fetchForecast();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
