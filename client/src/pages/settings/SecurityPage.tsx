import TopNavigation from "../../components/navigation/TopNavigation";

import {
  DashboardLayout,
  PageContainer,
  SectionHeader,
} from "../../components/layout";

import {
  ActiveSessionsCard,
  SecurityMetrics,
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

        <SecurityMetrics />

        <ActiveSessionsCard />

        <SecurityTimeline />
      </PageContainer>
    </DashboardLayout>
  );
}