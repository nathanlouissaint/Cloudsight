import {
  Clock3,
  Globe,
  Shield,
} from "lucide-react";

import Card from "../layout/Card";

import type { Session } from "../../auth/types/session";

import DeviceBadge from "./DeviceBadge";
import CurrentDeviceBadge from "./CurrentDeviceBadge";
import TerminateSessionButton from "./TerminateSessionButton";

import {
  formatFullDate,
  formatRelativeTime,
} from "../../utils/date";

interface Props {
  session: Session;
  onTerminate: (
    sessionId: string
  ) => Promise<void>;
  isTerminating?: boolean;
}

export default function SessionCard({
  session,
  onTerminate,
  isTerminating = false,
}: Props) {
  return (
    <Card className="session-card">
      <div className="session-card__header">
        <div className="session-card__device">
          <DeviceBadge
            deviceType={session.deviceType}
          />

          <div>
            <h3 className="session-card__title">
              {session.deviceName}
            </h3>

            <p
              className="session-card__agent"
              title={session.userAgent ?? ""}
            >
              {session.browser}
              {session.browserVersion
                ? ` ${session.browserVersion}`
                : ""}
              {" • "}
              {session.operatingSystem}
            </p>
          </div>
        </div>

        {session.isCurrent && (
          <CurrentDeviceBadge />
        )}
      </div>

      <div className="session-card__details">
        <div className="session-card__detail">
          <Globe size={16} />

          <div>
            <strong>IP Address</strong>

            <p>
              {session.ipAddress ??
                "Unavailable"}
            </p>
          </div>
        </div>

        <div className="session-card__detail">
          <Clock3 size={16} />

          <div>
            <strong>Last Active</strong>

            <p
              title={formatFullDate(
                session.lastUsedAt
              )}
            >
              {formatRelativeTime(
                session.lastUsedAt
              )}
            </p>
          </div>
        </div>

        <div className="session-card__detail">
          <Shield size={16} />

          <div>
            <strong>Expires</strong>

            <p
              title={formatFullDate(
                session.expiresAt
              )}
            >
              {formatRelativeTime(
                session.expiresAt
              )}
            </p>
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <div className="session-card__actions">
          <TerminateSessionButton
            sessionId={session.id}
            onTerminate={onTerminate}
            loading={isTerminating}
          />
        </div>
      )}
    </Card>
  );
}