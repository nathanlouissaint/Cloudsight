import {
  Clock3,
  Globe,
  Monitor,
  Shield,
} from "lucide-react";

import Card from "../layout/Card";

import type { Session } from "../../auth/types/session";

import CurrentDeviceBadge from "./CurrentDeviceBadge";
import TerminateSessionButton from "./TerminateSessionButton";

interface Props {
  session: Session;
  onTerminate: (sessionId: string) => void;
  isTerminating?: boolean;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
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
          <Monitor size={22} />

          <div>
            <h3 className="session-card__title">
              {session.deviceName ??
                "Unknown Device"}
            </h3>

            <p className="session-card__agent">
              {session.userAgent}
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

            <p>
              {formatDate(
                session.lastUsedAt
              )}
            </p>
          </div>
        </div>

        <div className="session-card__detail">
          <Shield size={16} />

          <div>
            <strong>Expires</strong>

            <p>
              {formatDate(
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
            onTerminate={
              onTerminate
            }
            loading={
              isTerminating
            }
          />
        </div>
      )}
    </Card>
  );
}