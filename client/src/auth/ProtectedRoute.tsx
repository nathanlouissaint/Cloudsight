import {
  Navigate,
} from "react-router-dom";

import type {
  ReactNode,
} from "react";

import {
  useAuth,
} from "./useAuth";

import {
  useOrganization,
} from "../organizations/useOrganization";

interface Props {
  children: ReactNode;
  requireOrganization?: boolean;
}

export default function ProtectedRoute({
  children,
  requireOrganization = true,
}: Props) {
  const {
    isAuthenticated,
    initializing,
  } = useAuth();

  const {
    organizations,
    loading: organizationsLoading,
    initialized: organizationsInitialized,
  } = useOrganization();

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

  if (
    requireOrganization &&
    (
      !organizationsInitialized ||
      organizationsLoading
    )
  ) {
    return (
      <div className="auth-loading">
        Loading workspace...
      </div>
    );
  }

  if (
    requireOrganization &&
    organizations.length === 0
  ) {
    return (
      <Navigate
        to="/onboarding/workspace"
        replace
      />
    );
  }

  return <>{children}</>;
}
