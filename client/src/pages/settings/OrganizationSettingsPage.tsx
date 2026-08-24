import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  updateCurrentOrganization,
} from "../../organizations/organization.api";

import {
  useOrganization,
} from "../../organizations/useOrganization";

import {
  ApiError,
} from "../../lib/apiClient";

import TopNavigation from "../../components/navigation/TopNavigation";

export default function OrganizationSettingsPage() {
  const {
    currentOrganization,
    refreshOrganizations,
  } = useOrganization();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  useEffect(() => {
    setName(currentOrganization?.name ?? "");
    setError(null);
    setSuccess(null);
  }, [currentOrganization]);

  const canManageOrganization =
    currentOrganization?.role === "OWNER";

  const hasChanges =
    currentOrganization !== null &&
    name.trim() !== currentOrganization.name;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !currentOrganization ||
      !canManageOrganization ||
      saving
    ) {
      return;
    }

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError(
        "Organization name is required.",
      );
      return;
    }

    if (normalizedName.length > 120) {
      setError(
        "Organization name must be 120 characters or fewer.",
      );
      return;
    }

    if (
      normalizedName ===
      currentOrganization.name
    ) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateCurrentOrganization(
        normalizedName,
      );

      await refreshOrganizations();

      setSuccess(
        "Organization settings updated.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to update organization.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (!currentOrganization) {
    return (
      <>
        <TopNavigation />

        <main className="settings-page">
          <section className="settings-panel">
            <h1>Organization Settings</h1>

            <p>
              No organization is currently
              selected.
            </p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNavigation />

      <main className="settings-page">
        <section className="settings-panel">
          <div className="settings-heading">
            <div>
              <h1>Organization Settings</h1>

              <p>
                Manage your CloudSight
                workspace.
              </p>
            </div>

            <span className="settings-role">
              {currentOrganization.role}
            </span>
          </div>

          <div className="settings-details">
            <div>
              <span className="settings-label">
                Workspace
              </span>

              <strong>
                {currentOrganization.name}
              </strong>
            </div>

            <div>
              <span className="settings-label">
                Slug
              </span>

              <strong>
                {currentOrganization.slug}
              </strong>
            </div>

            <div>
              <span className="settings-label">
                Your role
              </span>

              <strong>
                {currentOrganization.role}
              </strong>
            </div>
          </div>

          <form
            className="settings-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="organization-name">
              Organization name
            </label>

            <input
              id="organization-name"
              type="text"
              value={name}
              maxLength={120}
              disabled={
                !canManageOrganization ||
                saving
              }
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
                setSuccess(null);
              }}
            />

            {!canManageOrganization && (
              <p className="settings-help">
                Only organization owners can
                rename this workspace.
              </p>
            )}

            {error && (
              <p
                className="settings-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="settings-success"
                role="status"
              >
                {success}
              </p>
            )}

            {canManageOrganization && (
              <button
                type="submit"
                disabled={
                  saving ||
                  !name.trim() ||
                  !hasChanges
                }
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            )}
          </form>
        </section>
      </main>
    </>
  );
}