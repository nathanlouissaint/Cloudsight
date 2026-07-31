import {
  Activity,
  Laptop,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import type {
  AuditEvent,
  AuditEventType,
} from "../../auth/types/audit";

import {
  formatFullDate,
  formatRelativeTime,
} from "../../utils/date";

interface Props {
  event: AuditEvent;
}

function getEventIcon(
  eventType: AuditEventType
) {
  switch (eventType) {
    case "LOGIN":
      return <LogIn size={18} />;

    case "LOGOUT":
      return <LogOut size={18} />;

    case "LOGOUT_ALL":
      return <ShieldAlert size={18} />;

    case "SESSION_REVOKED":
      return <Laptop size={18} />;

    default:
      return <Activity size={18} />;
  }
}

function getEventLabel(
  eventType: AuditEventType
) {
  switch (eventType) {
    case "LOGIN":
      return "Signed In";

    case "LOGOUT":
      return "Signed Out";

    case "LOGOUT_ALL":
      return "Signed Out Everywhere";

    case "SESSION_REVOKED":
      return "Session Revoked";

    default:
      return eventType;
  }
}

export default function SecurityTimelineItem({
  event,
}: Props) {
  return (
    <div className="security-timeline-item">
      <div className="security-timeline-item__icon">
        {getEventIcon(event.eventType)}
      </div>

      <div className="security-timeline-item__content">
        <div className="security-timeline-item__header">
          <h4>
            {getEventLabel(
              event.eventType
            )}
          </h4>

          <span
            title={formatFullDate(
              event.createdAt
            )}
          >
            {formatRelativeTime(
              event.createdAt
            )}
          </span>
        </div>

        <div className="security-timeline-item__details">
          {event.deviceName && (
            <p>
              <strong>Device:</strong>{" "}
              {event.deviceName}
            </p>
          )}

          {event.ipAddress && (
            <p>
              <strong>IP:</strong>{" "}
              {event.ipAddress}
            </p>
          )}

          {event.userAgent && (
            <p
              title={event.userAgent}
            >
              <strong>User Agent:</strong>{" "}
              {event.userAgent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}