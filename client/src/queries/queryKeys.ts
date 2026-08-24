export const queryKeys = {
  tenant: (
    organizationId: string | null,
  ) =>
    [
      "organization",
      organizationId ?? "none",
    ] as const,

  dashboard: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "dashboard",
    ] as const,

  forecast: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "forecast",
    ] as const,

  costs: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "costs",
    ] as const,

  alerts: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "alerts",
    ] as const,

  alertHistory: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "alert-history",
    ] as const,

  reports: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "reports",
    ] as const,

  historicalTrends: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "historical-trends",
    ] as const,

  accountsAnalytics: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "accounts-analytics",
    ] as const,

  serviceAnalytics: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "service-analytics",
    ] as const,

  services: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "services",
    ] as const,

  topDrivers: (
    organizationId: string | null,
  ) =>
    [
      ...queryKeys.tenant(
        organizationId,
      ),
      "top-drivers",
    ] as const,

  // Authentication remains user-scoped,
  // not organization-scoped.
  sessions: [
    "auth",
    "sessions",
  ] as const,
};
