export const websiteAuditGoals = [
  { value: "more-signups-or-demo-requests", label: "Get more signups or demo requests" },
  { value: "improve-website-conversion-rates", label: "Improve website conversion rates" },
  { value: "build-a-lead-generation-funnel", label: "Build a lead generation funnel" },
  { value: "improve-website-design-and-messaging", label: "Improve website design and messaging" },
  { value: "get-discovered-in-ai-search", label: "Get discovered in AI search" },
  { value: "improve-signup-and-onboarding-flows", label: "Improve signup and onboarding flows" },
  { value: "set-up-analytics-and-conversion-tracking", label: "Set up analytics and conversion tracking" },
  { value: "not-sure-need-an-expert-review", label: "Not sure — need an expert review" },
] as const;

export type WebsiteAuditGoalValue = typeof websiteAuditGoals[number]["value"];

export function getWebsiteAuditGoal(value: string | null | undefined) {
  return websiteAuditGoals.find((goal) => goal.value === value);
}

export function getWebsiteAuditGoalLabelFromSearch(search: string) {
  return getWebsiteAuditGoal(new URLSearchParams(search).get("goal"))?.label ?? "";
}
