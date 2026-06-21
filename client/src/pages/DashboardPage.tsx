import DashboardLayout from "../components/layout/DashboardLayout";
import TopNavigation from "../components/navigation/TopNavigation";
import ExecutiveHero from "../components/dashboard/ExecutiveHero";
import SummaryCards from "../components/dashboard/SummaryCards";
import AnalyticsRow from "../components/dashboard/AnalyticsRow";
import OperationsRow from "../components/dashboard/OperationsRow";
import IntelligenceRow from "../components/dashboard/IntelligenceRow";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <TopNavigation />
      <ExecutiveHero />
      <SummaryCards />
      <AnalyticsRow />
      <OperationsRow />
      <IntelligenceRow />
    </DashboardLayout>
  );
}