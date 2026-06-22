import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { USE_MOCK_DATA } from "../config/features";
import { forecastMock } from "../mocks/forecast.mock";
import type { ForecastResponse } from "../types/forecast";

export function useForecast() {
  const [data, setData] =
    useState<ForecastResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK_DATA) {
          setData(forecastMock);
          return;
        }

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

    load();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
