import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  acceptOrganizationInvitation,
  getOrganizationInvitationPreview,
} from "../organizations/organization.api";

import type {
  OrganizationInvitationPreview,
} from "../organizations/types";

import {
  useAuth,
} from "../auth/useAuth";

import {
  useOrganization,
} from "../organizations/useOrganization";

import {
  ApiError,
} from "../lib/apiClient";

import {
  buildAuthPath,
} from "../auth/utils/returnTo";

export default function OrganizationInvitationPage() {
  const navigate = useNavigate();

  const {
    token = "",
  } = useParams<{
    token: string;
  }>();

  const {
    isAuthenticated,
    initializing,
  } = useAuth();

  const {
    refreshOrganizations,
  } = useOrganization();

  const [
    invitation,
    setInvitation,
  ] =
    useState<OrganizationInvitationPreview | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    accepting,
    setAccepting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const returnTo =
    useMemo(
      () =>
        `/organization-invitations/${encodeURIComponent(
          token,
        )}`,
      [token],
    );

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      if (
        initializing ||
        !isAuthenticated ||
        !token
      ) {
        if (!initializing) {
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getOrganizationInvitationPreview(
            token,
          );

        if (active) {
          setInvitation(
            response.invitation,
          );
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (
          requestError instanceof ApiError
        ) {
          setError(
            requestError.message,
          );
        } else {
          setError(
            "Failed to load invitation.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      active = false;
    };
  }, [
    initializing,
    isAuthenticated,
    token,
  ]);

  async function handleAccept() {
    if (
      !token ||
      !invitation ||
      accepting
    ) {
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      await acceptOrganizationInvitation(
        token,
      );

      const refreshedOrganizations =
        await refreshOrganizations(
          invitation.organization.id,
        );

      const joinedOrganizationExists =
        refreshedOrganizations.some(
          (organization) =>
            organization.id ===
            invitation.organization.id,
        );

      if (!joinedOrganizationExists) {
        throw new Error(
          "Accepted organization was not available after refresh.",
        );
      }

      navigate(
        "/settings/team",
        {
          replace: true,
        },
      );
    } catch (requestError) {
      if (
        requestError instanceof ApiError
      ) {
        setError(
          requestError.message,
        );
      } else {
        setError(
          "Failed to accept invitation.",
        );
      }
    } finally {
      setAccepting(false);
    }
  }

  if (initializing) {
    return (
      <main className="auth-loading">
        Loading invitation...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="auth-loading">
        <div>
          <h1>Organization invitation</h1>

          <p>
            Sign in or create an account to
            continue.
          </p>

          <p>
            <Link
              to={buildAuthPath(
                "/login",
                returnTo,
              )}
            >
              Sign in
            </Link>
          </p>

          <p>
            <Link
              to={buildAuthPath(
                "/register",
                returnTo,
              )}
            >
              Create account
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="auth-loading">
        Loading invitation...
      </main>
    );
  }

  return (
    <main className="settings-page">
      <section className="settings-panel">
        <div className="settings-heading">
          <div>
            <h1>Organization invitation</h1>

            <p>
              Review the invitation before
              joining.
            </p>
          </div>
        </div>

        {error && (
          <p
            className="settings-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {invitation && (
          <>
            <div className="settings-members">
              <div className="settings-member">
                <div className="settings-member__identity">
                  <strong>
                    {
                      invitation.organization
                        .name
                    }
                  </strong>

                  <span>
                    Role:{" "}
                    {invitation.role}
                  </span>

                  <span>
                    Expires{" "}
                    {new Date(
                      invitation.expiresAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={accepting}
              onClick={() =>
                void handleAccept()
              }
            >
              {accepting
                ? "Accepting..."
                : "Accept invitation"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
