import TopNavigation from "../components/navigation/TopNavigation";

import {
  DashboardLayout,
  SectionHeader,
} from "../components/layout";

import { IntelligenceRow } from "../components/dashboard";

import {
  ExecutiveIntelligenceRow,
  ExecutiveOverview,
  ForecastAndHealthRow,
  OptimizationRow,
} from "../components/intelligence";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <TopNavigation />

      <ExecutiveOverview />

      <SectionHeader
        title="Platform Health"
        subtitle="A high-level view of financial health, forecasting confidence, and account status."
      />

      <ForecastAndHealthRow />

      <SectionHeader
        title="Items Requiring Attention"
        subtitle="Executive insights highlighting risks, forecast confidence, cost drivers, and optimization priorities."
      />

      <ExecutiveIntelligenceRow />

      <SectionHeader
        title="Optimization Opportunities"
        subtitle="Recommended actions to improve cloud efficiency and reduce unnecessary spend."
      />

      <OptimizationRow />

      <SectionHeader
        title="Executive Intelligence"
        subtitle="Additional business insights, optimization context, and financial observations for executive review."
      />

      <IntelligenceRow />
    </DashboardLayout>
  );
}