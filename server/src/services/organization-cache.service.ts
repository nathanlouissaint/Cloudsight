import { deleteCached } from "../config/redis";

const CACHE_PREFIX = "cloudsight:v1";

export const organizationCacheKeys = {
  dashboard: (organizationId: string) =>
    `${CACHE_PREFIX}:dashboard:${organizationId}`,
  costTrends: (organizationId: string) =>
    `${CACHE_PREFIX}:cost-trends:${organizationId}`,
  serviceSummary: (organizationId: string) =>
    `${CACHE_PREFIX}:service-summary:${organizationId}`,
};

export async function invalidateOrganizationAnalyticsCache(
  organizationId: string,
) {
  await deleteCached(
    organizationCacheKeys.dashboard(organizationId),
    organizationCacheKeys.costTrends(organizationId),
    organizationCacheKeys.serviceSummary(organizationId),
  );
}
