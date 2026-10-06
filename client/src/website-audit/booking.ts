export function getWebsiteAuditBookingUrl(value: string | undefined) {
  const configuredValue = value?.trim();

  if (!configuredValue) {
    return null;
  }

  try {
    const url = new URL(configuredValue);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function getWebsiteAuditBookingAnalyticsProperties(
  budgetRange: string,
  launchTimeline: string,
) {
  return {
    budget_range: budgetRange,
    launch_timeline: launchTimeline,
    source: "website_audit_success",
  };
}
