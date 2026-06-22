import DashboardLayout from "../components/layout/DashboardLayout";
import TopNavigation from "../components/navigation/TopNavigation";
import SummaryCards from "../components/dashboard/SummaryCards";
import AnalyticsRow from "../components/dashboard/AnalyticsRow";
import OperationsRow from "../components/dashboard/OperationsRow";
import IntelligenceRow from "../components/dashboard/IntelligenceRow";
import ExecutiveOverview from "../components/intelligence/ExecutiveOverview";
import ExecutiveIntelligenceRow from "../components/intelligence/ExecutiveIntelligenceRow";

export default function DashboardPage() {
  return (
    <DashboardLayout>

      <TopNavigation />

    <ExecutiveOverview />

 <ExecutiveIntelligenceRow />

      <SummaryCards />

      <AnalyticsRow />

      <OperationsRow />
      
      <IntelligenceRow />

    </DashboardLayout>
  );
}