import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "./useAuth";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {
  const {
    isAuthenticated,
    initializing,
  } = useAuth();

  if (initializing) {
    return (
      <div className="auth-loading">
        Initializing CloudSight...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}
