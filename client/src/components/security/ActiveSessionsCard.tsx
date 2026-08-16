import { useNavigate } from "react-router-dom";

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
import { useAuth } from "../../auth/useAuth";

export default function ActiveSessionsCard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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

  async function handleTerminateSession(
    sessionId: string
  ) {
    await deleteSession.mutateAsync(
      sessionId
    );
  }

  async function handleLogoutAllSessions() {
    await logoutAll.mutateAsync();

    logout();
    navigate("/login");
  }

  return (
    <section className="active-sessions-card">
      <div className="active-sessions-card__header">
        <h2>Active Sessions</h2>

        <LogoutAllButton
          onLogoutAll={
            handleLogoutAllSessions
          }
          loading={logoutAll.isPending}
        />
      </div>

      <div className="active-sessions-card__list">
        {sessions.map((session) => {
          const isTerminatingSession =
            deleteSession.isPending &&
            deleteSession.variables ===
              session.id;

          return (
            <SessionCard
              key={session.id}
              session={session}
              onTerminate={
                handleTerminateSession
              }
              isTerminating={
                isTerminatingSession
              }
            />
          );
        })}
      </div>
    </section>
  );
}
