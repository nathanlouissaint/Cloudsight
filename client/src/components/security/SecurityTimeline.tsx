import Card from "../layout/Card";

import { useAuditHistory } from "../../auth/hooks/useAudit";

import SecurityTimelineItem from "./SecurityTimelineItem";

export default function SecurityTimeline() {
  const {
    data: events = [],
    isLoading,
    isError,
  } = useAuditHistory();

  return (
    <Card>
      <div className="security-timeline">
        <div className="security-timeline__header">
          <h2>Security Activity</h2>

          <p>
            Recent authentication and
            security events.
          </p>
        </div>

        {isLoading && (
          <p className="security-timeline__empty">
            Loading security activity...
          </p>
        )}

        {isError && (
          <p className="security-timeline__empty">
            Unable to load security
            activity.
          </p>
        )}

        {!isLoading &&
          !isError &&
          events.length === 0 && (
            <p className="security-timeline__empty">
              No recent security activity.
            </p>
          )}

        {!isLoading &&
          !isError &&
          events.map((event) => (
            <SecurityTimelineItem
              key={event.id}
              event={event}
            />
          ))}
      </div>
    </Card>
  );
}
