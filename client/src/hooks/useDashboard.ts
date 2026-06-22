/*
|--------------------------------------------------------------------------
| useDashboard
|--------------------------------------------------------------------------
|
| Fetches:
| - Executive Overview
| - Executive Summary
| - Cost Drivers
| - Optimization Opportunities
|
| Endpoint:
| GET /dashboard
|
*/

import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { DashboardResponse } from "../types/dashboard";

export function useDashboard() {
  const [data, setData] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response =
          await apiRequest<DashboardResponse>(
            "/dashboard"
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

    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
  };
}
