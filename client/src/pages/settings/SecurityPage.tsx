import TopNavigation from "../../components/navigation/TopNavigation";

import {
  DashboardLayout,
  PageContainer,
  SectionHeader,
} from "../../components/layout";

import {
  ActiveSessionsCard,
  SecurityOverview,
  SecurityTimeline,
} from "../../components/security";

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <TopNavigation />

      <PageContainer>
        <SectionHeader
          title="Security Center"
          subtitle="Manage account security, authenticated devices, active sessions, and recent security activity."
        />

        <SecurityOverview />

        <ActiveSessionsCard />

        <SecurityTimeline />
      </PageContainer>
    </DashboardLayout>
  );
}