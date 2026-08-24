import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/auth/layout/AuthLayout";

import {
  ApiError,
} from "../lib/apiClient";

import {
  createOrganization,
} from "../organizations/organization.api";

import {
  setStoredOrganizationId,
} from "../organizations/organizationStorage";

import {
  useOrganization,
} from "../organizations/useOrganization";

export default function WorkspaceOnboardingPage() {
  const navigate = useNavigate();

  const {
    organizations,
    loading: organizationsLoading,
    refreshOrganizations,
  } = useOrganization();

  const [name, setName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !organizationsLoading &&
      organizations.length > 0
    ) {
      navigate("/", {
        replace: true,
      });
    }
  }, [
    organizations,
    organizationsLoading,
    navigate,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const organizationName =
      name.trim();

    if (!organizationName) {
      setError(
        "Workspace name is required.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response =
        await createOrganization(
          organizationName,
        );

      setStoredOrganizationId(
        response.organization.id,
      );

      await refreshOrganizations();

      navigate("/", {
        replace: true,
      });
    } catch (requestError) {
      if (
        requestError instanceof ApiError
      ) {
        setError(
          requestError.message,
        );
      } else {
        setError(
          "Unable to create workspace.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="workspace-onboarding">
        <p className="workspace-onboarding__eyebrow">
          Workspace setup
        </p>

        <h1>
          Create your CloudSight workspace
        </h1>

        <p className="workspace-onboarding__description">
          Your workspace keeps cloud accounts,
          budgets, reports, alerts, and team
          access isolated from other organizations.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="workspace-name"
          >
            Workspace name
          </label>

          <input
            id="workspace-name"
            type="text"
            maxLength={120}
            autoComplete="organization"
            placeholder="Acme Inc"
            value={name}
            disabled={submitting}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
          />

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              !name.trim()
            }
          >
            {submitting
              ? "Creating Workspace..."
              : "Create Workspace"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
