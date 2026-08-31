import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import TopNavigation from "../../components/navigation/TopNavigation";

import {
  createOrganizationInvitation,
  getOrganizationInvitations,
  getOrganizationMembers,
  removeOrganizationMember,
  revokeOrganizationInvitation,
  updateOrganizationMemberRole,
} from "../../organizations/organization.api";

import {
  useOrganization,
} from "../../organizations/useOrganization";

import type {
  OrganizationInvitation,
  OrganizationMember,
  OrganizationRole,
} from "../../organizations/types";

import {
  ApiError,
} from "../../lib/apiClient";

const ALL_ROLES: OrganizationRole[] = [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "VIEWER",
];

export default function TeamSettingsPage() {
  const {
    currentOrganization,
    currentOrganizationId,
  } = useOrganization();

  const [members, setMembers] =
    useState<OrganizationMember[]>([]);

  const [invitations, setInvitations] =
    useState<OrganizationInvitation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [newMemberRole, setNewMemberRole] =
    useState<OrganizationRole>("MEMBER");

  const [submitting, setSubmitting] =
    useState(false);

  const [mutatingMembershipId, setMutatingMembershipId] =
    useState<string | null>(null);

  const [mutatingInvitationId, setMutatingInvitationId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const canManageMembers =
    currentOrganization?.role === "OWNER" ||
    currentOrganization?.role === "ADMIN";

  const isOwner =
    currentOrganization?.role === "OWNER";

  const allowedAssignableRoles =
    useMemo<OrganizationRole[]>(
      () =>
        isOwner
          ? ALL_ROLES
          : [
              "ADMIN",
              "MEMBER",
              "VIEWER",
            ],
      [isOwner],
    );

  const loadMembers =
    useCallback(async () => {
      if (
        !currentOrganizationId ||
        !canManageMembers
      ) {
        setMembers([]);
        setInvitations([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          membersResponse,
          invitationsResponse,
        ] = await Promise.all([
          getOrganizationMembers(),
          getOrganizationInvitations(),
        ]);

        setMembers(membersResponse.members);

        setInvitations(
          invitationsResponse.invitations.filter(
            (invitation) =>
              !invitation.acceptedAt &&
              !invitation.revokedAt,
          ),
        );
      } catch (requestError) {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError(
            "Failed to load organization members.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, [
      currentOrganizationId,
      canManageMembers,
    ]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    setEmail("");
    setNewMemberRole("MEMBER");
    setError(null);
    setSuccess(null);
  }, [currentOrganizationId]);

  async function handleAddMember(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !canManageMembers ||
      submitting
    ) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createOrganizationInvitation(
        normalizedEmail,
        newMemberRole,
      );

      setEmail("");
      setNewMemberRole("MEMBER");

      await loadMembers();

      setSuccess(
        "Invitation sent.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to add organization member.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevokeInvitation(
    invitation: OrganizationInvitation,
  ) {
    if (
      !canManageMembers ||
      mutatingInvitationId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Revoke invitation for ${invitation.email}?`,
      );

    if (!confirmed) {
      return;
    }

    setMutatingInvitationId(
      invitation.id,
    );
    setError(null);
    setSuccess(null);

    try {
      await revokeOrganizationInvitation(
        invitation.id,
      );

      await loadMembers();

      setSuccess(
        "Invitation revoked.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to revoke invitation.",
        );
      }
    } finally {
      setMutatingInvitationId(null);
    }
  }

  async function handleRoleChange(
    member: OrganizationMember,
    role: OrganizationRole,
  ) {
    if (
      !canManageMembers ||
      member.role === role ||
      mutatingMembershipId
    ) {
      return;
    }

    if (
      !isOwner &&
      member.role === "OWNER"
    ) {
      return;
    }

    if (
      !isOwner &&
      role === "OWNER"
    ) {
      return;
    }

    setMutatingMembershipId(member.id);
    setError(null);
    setSuccess(null);

    try {
      await updateOrganizationMemberRole(
        member.id,
        role,
      );

      await loadMembers();

      setSuccess(
        "Member role updated.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to update member role.",
        );
      }
    } finally {
      setMutatingMembershipId(null);
    }
  }

  async function handleRemoveMember(
    member: OrganizationMember,
  ) {
    if (
      !canManageMembers ||
      mutatingMembershipId
    ) {
      return;
    }

    if (
      !isOwner &&
      member.role === "OWNER"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${member.user.email} from this organization?`,
      );

    if (!confirmed) {
      return;
    }

    setMutatingMembershipId(member.id);
    setError(null);
    setSuccess(null);

    try {
      await removeOrganizationMember(
        member.id,
      );

      await loadMembers();

      setSuccess(
        "Organization member removed.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to remove organization member.",
        );
      }
    } finally {
      setMutatingMembershipId(null);
    }
  }

  if (!currentOrganization) {
    return (
      <>
        <TopNavigation />

        <main className="settings-page">
          <section className="settings-panel">
            <h1>Team</h1>

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
              <h1>Team</h1>

              <p>
                Manage access to{" "}
                {currentOrganization.name}.
              </p>
            </div>

            <span className="settings-role">
              {currentOrganization.role}
            </span>
          </div>

          {!canManageMembers ? (
            <p className="settings-help">
              Your role does not allow team
              management.
            </p>
          ) : (
            <>
              <form
                className="settings-form"
                onSubmit={handleAddMember}
              >
                <label htmlFor="member-email">
                  Add existing CloudSight user
                </label>

                <input
                  id="member-email"
                  type="email"
                  autoComplete="email"
                  placeholder="person@example.com"
                  value={email}
                  disabled={submitting}
                  onChange={(event) => {
                    setEmail(
                      event.target.value,
                    );
                    setError(null);
                    setSuccess(null);
                  }}
                />

                <label htmlFor="member-role">
                  Role
                </label>

                <select
                  id="member-role"
                  value={newMemberRole}
                  disabled={submitting}
                  onChange={(event) =>
                    setNewMemberRole(
                      event.target.value as OrganizationRole,
                    )
                  }
                >
                  {allowedAssignableRoles.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ),
                  )}
                </select>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !email.trim()
                  }
                >
                  {submitting
                    ? "Sending..."
                    : "Send invitation"}
                </button>
              </form>

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

              <div className="settings-members">
                <div className="settings-members__header">
                  <h2>Pending invitations</h2>

                  <span>
                    {invitations.length}
                  </span>
                </div>

                {loading ? (
                  <p>Loading invitations...</p>
                ) : invitations.length === 0 ? (
                  <p>No pending invitations.</p>
                ) : (
                  <div className="settings-members__list">
                    {invitations.map(
                      (invitation) => (
                        <div
                          key={invitation.id}
                          className="settings-member"
                        >
                          <div className="settings-member__identity">
                            <strong>
                              {invitation.email}
                            </strong>

                            <span>
                              {invitation.role}
                            </span>

                            <span>
                              Expires{" "}
                              {new Date(
                                invitation.expiresAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={
                              mutatingInvitationId !== null
                            }
                            onClick={() =>
                              void handleRevokeInvitation(
                                invitation,
                              )
                            }
                          >
                            {mutatingInvitationId ===
                            invitation.id
                              ? "Revoking..."
                              : "Revoke"}
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="settings-members">
                <div className="settings-members__header">
                  <h2>Members</h2>

                  <span>
                    {members.length}
                  </span>
                </div>

                {loading ? (
                  <p>Loading members...</p>
                ) : members.length === 0 ? (
                  <p>No members found.</p>
                ) : (
                  <div className="settings-members__list">
                    {members.map(
                      (member) => {
                        const isCurrentMembership =
                          member.id ===
                          currentOrganization.membershipId;

                        const adminCannotModifyOwner =
                          !isOwner &&
                          member.role === "OWNER";

                        const disabled =
                          mutatingMembershipId !== null ||
                          adminCannotModifyOwner;

                        return (
                          <div
                            key={member.id}
                            className="settings-member"
                          >
                            <div className="settings-member__identity">
                              <strong>
                                {member.user.name ||
                                  member.user.email}
                              </strong>

                              <span>
                                {member.user.email}
                              </span>

                              {isCurrentMembership && (
                                <span>
                                  You
                                </span>
                              )}
                            </div>

                            <select
                              aria-label={`Role for ${member.user.email}`}
                              value={member.role}
                              disabled={disabled}
                              onChange={(event) =>
                                void handleRoleChange(
                                  member,
                                  event.target.value as OrganizationRole,
                                )
                              }
                            >
                              {ALL_ROLES.map(
                                (role) => (
                                  <option
                                    key={role}
                                    value={role}
                                    disabled={
                                      !isOwner &&
                                      role === "OWNER"
                                    }
                                  >
                                    {role}
                                  </option>
                                ),
                              )}
                            </select>

                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() =>
                                void handleRemoveMember(
                                  member,
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
