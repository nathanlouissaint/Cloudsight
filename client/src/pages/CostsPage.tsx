import TopNavigation from "../components/navigation/TopNavigation";

import {
  DashboardLayout,
  SectionHeader,
} from "../components/layout";

import {
  AccountDistributionCard,
  AnalyticsRow,
  ServiceBreakdownCard,
} from "../components/dashboard";

import {
  CostDriversCard,
} from "../components/intelligence";

export default function CostsPage() {
  return (
    <DashboardLayout>
      <TopNavigation />

      <SectionHeader
        title="Cost Analytics"
        subtitle="Understand where cloud spend is occurring, which services contribute the most cost, and how spending is distributed across accounts."
      />

      <SectionHeader
        title="Historical Spend"
        subtitle="Analyze spending trends over time to identify growth patterns and unusual changes."
      />

      <AnalyticsRow />

      <SectionHeader
        title="Service Cost Distribution"
        subtitle="Break down cloud spend by service to identify the largest contributors."
      />

      <div className="analytics-grid">
        <ServiceBreakdownCard />
        <CostDriversCard />
      </div>

      <SectionHeader
        title="Account Distribution"
        subtitle="Compare cloud spending across accounts to understand ownership and allocation."
      />

      <div className="analytics-grid">
        <AccountDistributionCard />
      </div>
    </DashboardLayout>
  );
}
