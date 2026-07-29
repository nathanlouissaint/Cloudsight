import TopNavigation from "../../components/navigation/TopNavigation";

import {
  DashboardLayout,
  PageContainer,
  SectionHeader,
} from "../../components/layout";

import {
  ActiveSessionsCard,
  SecurityOverview,
} from "../../components/security";

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <TopNavigation />

      <PageContainer>
        <SectionHeader
          title="Security Center"
          subtitle="Manage account security, authenticated devices, and active sessions."
        />

        <SecurityOverview />

        <ActiveSessionsCard />
      </PageContainer>
    </DashboardLayout>
  );
}