import DashboardLayout from "../components/layout/DashboardLayout";
import TopNavigation from "../components/navigation/TopNavigation";
import AnalyticsRow from "../components/dashboard/AnalyticsRow";
import OperationsRow from "../components/dashboard/OperationsRow";
import IntelligenceRow from "../components/dashboard/IntelligenceRow";
import ExecutiveOverview from "../components/intelligence/ExecutiveOverview";
import ExecutiveIntelligenceRow from "../components/intelligence/ExecutiveIntelligenceRow";
import ForecastAndHealthRow from "../components/intelligence/ForecastAndHealthRow";
import OptimizationRow from "../components/intelligence/OptimizationRow";

export default function DashboardPage() {
  return (
    <DashboardLayout>
  <TopNavigation />

  <ExecutiveOverview />

  <ForecastAndHealthRow />

  <ExecutiveIntelligenceRow />

  <OptimizationRow />

  <AnalyticsRow />

  <OperationsRow />

  <IntelligenceRow />
</DashboardLayout>
  );
}
