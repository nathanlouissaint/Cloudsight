import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { ReportResponse } from "../types/report";

export function useReport() {
  const [data, setData] =
    useState<ReportResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response =
          await apiRequest<ReportResponse>(
            "/reports"
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
