import DashboardLayout from "../components/layout/DashboardLayout";

import TopNavigation
from "../components/navigation/TopNavigation";

import AnalyticsRow
from "../components/dashboard/AnalyticsRow";

import ServiceBreakdownCard
from "../components/dashboard/ServiceBreakdownCard";

import AccountDistributionCard
from "../components/dashboard/AccountDistributionCard";

import CostDriversCard
from "../components/intelligence/CostDriversCard";

export default function CostsPage() {
  return (
    <DashboardLayout>
      <TopNavigation />

      <div
        style={{
          marginTop: "24px",
        }}
      >
        <h1>
          Cost Analytics
        </h1>

        <p>
          Historical spend,
          service analysis,
          and account
          distribution.
        </p>
      </div>

      <AnalyticsRow />

      <div
        className="analytics-grid"
        style={{
          marginTop: "24px",
        }}
      >
        <ServiceBreakdownCard />

        <CostDriversCard />
      </div>

      <div
        className="analytics-grid"
        style={{
          marginTop: "24px",
        }}
      >
        <AccountDistributionCard />
      </div>
    </DashboardLayout>
  );
}
