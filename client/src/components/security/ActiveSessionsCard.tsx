import SessionCard from "./SessionCard";
import LogoutAllButton from "./LogoutAllButton";

import {
  useDeleteSession,
  useLogoutAllSessions,
  useSessions,
} from "../../auth/hooks/useSession";

import SkeletonCard from "../states/SkeletonCard";
import EmptyState from "../states/EmptyState";
import ErrorState from "../states/ErrorState";

export default function ActiveSessionsCard() {
  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useSessions();

  const deleteSession = useDeleteSession();
  const logoutAll = useLogoutAllSessions();

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (isError) {
    return (
      <ErrorState message="Unable to load active sessions. Please try again." />
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState title="No active sessions" />
    );
  }

  return (
    <section className="active-sessions-card">
      <div className="active-sessions-card__header">
        <h2>Active Sessions</h2>

        <LogoutAllButton
          onLogoutAll={() => logoutAll.mutate()}
          loading={logoutAll.isPending}
        />
      </div>

      <div className="active-sessions-card__list">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onTerminate={(id) => deleteSession.mutate(id)}
            isTerminating={deleteSession.isPending}
          />
        ))}
      </div>
    </section>
  );
}