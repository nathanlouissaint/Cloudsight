import TopNavigation from "../components/navigation/TopNavigation";

import {
  DashboardLayout,
  SectionHeader,
} from "../components/layout";

import {
  AnalyticsRow,
  IntelligenceRow,
  OperationsRow,
} from "../components/dashboard";

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
        title="Financial Performance"
        subtitle="Historical cloud spending trends and overall budget health."
      />

      <AnalyticsRow />

      <SectionHeader
        title="Operational Visibility"
        subtitle="Service-level operations and workload distribution across the platform."
      />

      <OperationsRow />

      <SectionHeader
        title="Executive Intelligence"
        subtitle="AI-generated insights and anomaly detection to support strategic decision making."
      />

      <IntelligenceRow />
    </DashboardLayout>
  );
}
