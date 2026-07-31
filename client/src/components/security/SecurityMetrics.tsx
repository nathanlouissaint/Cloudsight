import MetricCard from "../shared/MetricCard";

import { useSessions } from "../../auth/hooks/useSession";

import {
  formatRelativeTime,
} from "../../utils/date";

export default function SecurityMetrics() {
  const { data: sessions = [] } =
    useSessions();

  const currentSession =
    sessions.find(
      (session) => session.isCurrent
    );

  const activeSessions =
    sessions.length;

  const trustedDevices =
    new Set(
      sessions.map(
        (session) => session.deviceName
      )
    ).size;

  const currentDevice =
    currentSession?.deviceType ??
    "Unknown";

  const lastActivity =
    currentSession
      ? formatRelativeTime(
          currentSession.lastUsedAt
        )
      : "Unknown";

  return (
    <section className="summary-grid">
      <MetricCard
        title="Active Sessions"
        value={activeSessions.toString()}
        subtitle="Authenticated devices"
      />

      <MetricCard
        title="Trusted Devices"
        value={trustedDevices.toString()}
        subtitle="Recognized devices"
      />

      <MetricCard
        title="Current Device"
        value={currentDevice}
        subtitle="Current authenticated session"
      />

      <MetricCard
        title="Last Activity"
        value={lastActivity}
        subtitle="Current session"
      />
    </section>
  );
}