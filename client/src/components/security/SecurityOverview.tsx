import MetricCard from "../shared/MetricCard";

import { useSessions } from "../../auth/hooks/useSession";

export default function SecurityOverview() {
  const { data: sessions = [] } = useSessions();

  const currentSession = sessions.find(
    (session) => session.isCurrent
  );

  return (
    <section className="summary-grid">
      <MetricCard
        title="Active Sessions"
        value={sessions.length.toString()}
        subtitle="Authenticated devices"
      />

      <MetricCard
        title="Current Device"
        value={
          currentSession
            ? "Protected"
            : "Unknown"
        }
        subtitle="Current browser session"
      />

      <MetricCard
        title="Password"
        value="Protected"
        subtitle="BCrypt secured"
      />

      <MetricCard
        title="Multi-Factor Auth"
        value="Disabled"
        subtitle="Coming soon"
      />
    </section>
  );
}