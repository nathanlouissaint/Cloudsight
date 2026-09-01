import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import TopNavigation from "../../components/navigation/TopNavigation";

import {
  configureCloudAccountConnection,
  createCloudAccount,
  disconnectCloudAccount,
  getCloudAccounts,
  reconnectCloudAccount,
  renameCloudAccount,
  verifyCloudAccountConnection,
} from "../../cloud-accounts/cloud-account.api";

import type {
  CloudAccount,
} from "../../cloud-accounts/types";

import {
  buildAwsTrustPolicy,
  getCloudSightPrincipalArn,
} from "../../cloud-accounts/aws-onboarding";


import {
  useOrganization,
} from "../../organizations/useOrganization";

import {
  ApiError,
} from "../../lib/apiClient";

export default function CloudAccountsSettingsPage() {
  const {
    currentOrganization,
    currentOrganizationId,
  } = useOrganization();

  const [accounts, setAccounts] =
    useState<CloudAccount[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [awsAccountId, setAwsAccountId] =
    useState("");

  const [accountName, setAccountName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [mutatingAccountId, setMutatingAccountId] =
    useState<string | null>(null);

  const [roleArns, setRoleArns] =
    useState<Record<string, string>>({});

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const canManageAccounts =
    currentOrganization?.role === "OWNER" ||
    currentOrganization?.role === "ADMIN";

  const loadAccounts =
    useCallback(async () => {
      if (!currentOrganizationId) {
        setAccounts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getCloudAccounts();

        setAccounts(response.accounts);
      } catch (requestError) {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError(
            "Failed to load cloud accounts.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, [currentOrganizationId]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    setAwsAccountId("");
    setAccountName("");
    setRoleArns({});
    setError(null);
    setSuccess(null);
  }, [currentOrganizationId]);

  async function handleAddAccount(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !canManageAccounts ||
      submitting
    ) {
      return;
    }

    const normalizedAwsAccountId =
      awsAccountId.trim();

    const normalizedAccountName =
      accountName.trim();

    if (
      !/^\d{12}$/.test(
        normalizedAwsAccountId,
      )
    ) {
      setError(
        "AWS account ID must contain exactly 12 digits.",
      );
      return;
    }

    if (!normalizedAccountName) {
      setError(
        "Account name is required.",
      );
      return;
    }

    if (normalizedAccountName.length > 120) {
      setError(
        "Account name must be 120 characters or fewer.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createCloudAccount(
        normalizedAwsAccountId,
        normalizedAccountName,
      );

      setAwsAccountId("");
      setAccountName("");

      await loadAccounts();

      setSuccess(
        "Cloud account added.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to add cloud account.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRename(
    account: CloudAccount,
  ) {
    if (
      !canManageAccounts ||
      mutatingAccountId
    ) {
      return;
    }

    const nextName =
      window.prompt(
        "Cloud account name",
        account.accountName,
      );

    if (nextName === null) {
      return;
    }

    const normalizedName =
      nextName.trim();

    if (!normalizedName) {
      setError(
        "Account name is required.",
      );
      return;
    }

    if (normalizedName.length > 120) {
      setError(
        "Account name must be 120 characters or fewer.",
      );
      return;
    }

    if (
      normalizedName === account.accountName
    ) {
      return;
    }

    setMutatingAccountId(account.id);
    setError(null);
    setSuccess(null);

    try {
      await renameCloudAccount(
        account.id,
        normalizedName,
      );

      await loadAccounts();

      setSuccess(
        "Cloud account renamed.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to rename cloud account.",
        );
      }
    } finally {
      setMutatingAccountId(null);
    }
  }

  async function handleDisconnect(
    account: CloudAccount,
  ) {
    if (
      !canManageAccounts ||
      mutatingAccountId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Disconnect ${account.accountName}? Historical cost data will be preserved.`,
      );

    if (!confirmed) {
      return;
    }

    setMutatingAccountId(account.id);
    setError(null);
    setSuccess(null);

    try {
      await disconnectCloudAccount(
        account.id,
      );

      await loadAccounts();

      setSuccess(
        "Cloud account disconnected.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to disconnect cloud account.",
        );
      }
    } finally {
      setMutatingAccountId(null);
    }
  }

  async function handleReconnect(
    account: CloudAccount,
  ) {
    if (
      !canManageAccounts ||
      mutatingAccountId
    ) {
      return;
    }

    setMutatingAccountId(account.id);
    setError(null);
    setSuccess(null);

    try {
      await reconnectCloudAccount(
        account.id,
      );

      await loadAccounts();

      setSuccess(
        "Cloud account reconnected.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to reconnect cloud account.",
        );
      }
    } finally {
      setMutatingAccountId(null);
    }
  }

  async function handleCopy(
    value: string,
    label: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setError(null);
      setSuccess(
        `${label} copied.`,
      );
    } catch {
      setSuccess(null);
      setError(
        `Failed to copy ${label.toLowerCase()}.`,
      );
    }
  }

  async function handleConfigureConnection(
    account: CloudAccount,
  ) {
    if (
      !canManageAccounts ||
      mutatingAccountId ||
      !account.isActive
    ) {
      return;
    }

    const roleArn =
      (roleArns[account.id] ?? account.roleArn ?? "")
        .trim();

    if (!roleArn) {
      setError(
        "AWS role ARN is required.",
      );
      return;
    }

    setMutatingAccountId(account.id);
    setError(null);
    setSuccess(null);

    try {
      await configureCloudAccountConnection(
        account.id,
        roleArn,
      );

      await loadAccounts();

      setSuccess(
        "AWS role saved. Verify the connection to continue.",
      );
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "Failed to configure AWS connection.",
        );
      }
    } finally {
      setMutatingAccountId(null);
    }
  }

  async function handleVerifyConnection(
    account: CloudAccount,
  ) {
    if (
      !canManageAccounts ||
      mutatingAccountId ||
      !account.isActive ||
      !account.roleArn
    ) {
      return;
    }

    setMutatingAccountId(account.id);
    setError(null);
    setSuccess(null);

    try {
      await verifyCloudAccountConnection(
        account.id,
      );

      await loadAccounts();

      setSuccess(
        "AWS connection verified.",
      );
    } catch (requestError) {
      await loadAccounts();

      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError(
          "AWS connection verification failed.",
        );
      }
    } finally {
      setMutatingAccountId(null);
    }
  }

  if (!currentOrganization) {
    return (
      <>
        <TopNavigation />

        <main className="settings-page">
          <section className="settings-panel">
            <h1>Cloud Accounts</h1>

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
              <h1>Cloud Accounts</h1>

              <p>
                Manage cloud accounts connected to{" "}
                {currentOrganization.name}.
              </p>
            </div>

            <span className="settings-role">
              {currentOrganization.role}
            </span>
          </div>

          {canManageAccounts ? (
            <form
              className="settings-form"
              onSubmit={handleAddAccount}
            >
              <label htmlFor="aws-account-id">
                AWS account ID
              </label>

              <input
                id="aws-account-id"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={12}
                value={awsAccountId}
                disabled={submitting}
                placeholder="123456789012"
                onChange={(event) => {
                  setAwsAccountId(
                    event.target.value,
                  );
                  setError(null);
                  setSuccess(null);
                }}
              />

              <label htmlFor="cloud-account-name">
                Account name
              </label>

              <input
                id="cloud-account-name"
                type="text"
                maxLength={120}
                value={accountName}
                disabled={submitting}
                placeholder="Production"
                onChange={(event) => {
                  setAccountName(
                    event.target.value,
                  );
                  setError(null);
                  setSuccess(null);
                }}
              />

              <button
                type="submit"
                disabled={
                  submitting ||
                  !awsAccountId.trim() ||
                  !accountName.trim()
                }
              >
                {submitting
                  ? "Adding..."
                  : "Add cloud account"}
              </button>
            </form>
          ) : (
            <p className="settings-help">
              Your role allows you to view cloud
              accounts but not manage them.
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

          <div className="settings-details">
            {loading ? (
              <p>Loading cloud accounts...</p>
            ) : accounts.length === 0 ? (
              <p>
                No cloud accounts are connected to
                this workspace.
              </p>
            ) : (
              accounts.map((account) => {
                const mutating =
                  mutatingAccountId ===
                  account.id;

                const trustPolicy =
                  account.externalId
                    ? buildAwsTrustPolicy(
                        account.externalId,
                      )
                    : null;

                const cloudSightPrincipalArn =
                  getCloudSightPrincipalArn();

                return (
                  <div key={account.id}>
                    <span className="settings-label">
                      {account.isActive
                        ? "Active"
                        : "Disconnected"}
                    </span>

                    <strong>
                      {account.accountName}
                    </strong>

                    <p>
                      AWS account{" "}
                      {account.awsAccountId}
                    </p>

                    <div className="settings-details">
                      <div>
                        <span className="settings-label">
                          AWS connection
                        </span>

                        <strong>
                          {account.connectionStatus ===
                          "CONNECTED"
                            ? "Connected"
                            : account.connectionStatus ===
                                "PENDING"
                              ? "Pending verification"
                              : account.connectionStatus ===
                                  "ERROR"
                                ? "Connection error"
                                : "Not configured"}
                        </strong>
                      </div>

                      {account.externalId && (
                        <div>
                          <span className="settings-label">
                            AWS setup
                          </span>

                          <p className="settings-help">
                            1. Create an IAM role in AWS
                            for this account.
                          </p>

                          <p className="settings-help">
                            2. Require this CloudSight
                            External ID:
                          </p>

                          <code>
                            {account.externalId}
                          </code>

                          {canManageAccounts && (
                            <button
                              type="button"
                              onClick={() => {
                                void handleCopy(
                                  account.externalId!,
                                  "External ID",
                                );
                              }}
                            >
                              Copy External ID
                            </button>
                          )}

                          {trustPolicy ? (
                            <>
                              <p className="settings-help">
                                3. Use this trust policy
                                on the IAM role:
                              </p>

                              <pre>
                                <code>
                                  {trustPolicy}
                                </code>
                              </pre>

                              {canManageAccounts && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleCopy(
                                      trustPolicy,
                                      "Trust policy",
                                    );
                                  }}
                                >
                                  Copy trust policy
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="settings-help">
                              CloudSight AWS principal
                              configuration is required
                              before a trust policy can
                              be generated.
                            </p>
                          )}

                          {cloudSightPrincipalArn && (
                            <>
                              <p className="settings-help">
                                CloudSight principal:
                              </p>

                              <code>
                                {cloudSightPrincipalArn}
                              </code>
                            </>
                          )}

                          <p className="settings-help">
                            4. After creating the role,
                            paste its ARN below and save
                            it.
                          </p>

                          <p className="settings-help">
                            5. Verify the connection.
                          </p>
                        </div>
                      )}

                      {account.lastVerifiedAt && (
                        <p className="settings-help">
                          Last verified{" "}
                          {new Date(
                            account.lastVerifiedAt,
                          ).toLocaleString()}
                        </p>
                      )}

                      {account.connectionError && (
                        <p
                          className="settings-error"
                          role="alert"
                        >
                          {account.connectionError}
                        </p>
                      )}

                      {canManageAccounts &&
                        account.isActive && (
                          <div>
                            <label
                              htmlFor={`role-arn-${account.id}`}
                            >
                              AWS IAM role ARN
                            </label>

                            <input
                              id={`role-arn-${account.id}`}
                              type="text"
                              autoComplete="off"
                              value={
                                roleArns[
                                  account.id
                                ] ??
                                account.roleArn ??
                                ""
                              }
                              disabled={
                                mutating ||
                                mutatingAccountId !==
                                  null
                              }
                              placeholder="arn:aws:iam::123456789012:role/CloudSightReadRole"
                              onChange={(event) => {
                                setRoleArns(
                                  (current) => ({
                                    ...current,
                                    [account.id]:
                                      event.target.value,
                                  }),
                                );

                                setError(null);
                                setSuccess(null);
                              }}
                            />

                            <div>
                              <button
                                type="button"
                                disabled={
                                  mutating ||
                                  mutatingAccountId !==
                                    null ||
                                  !(
                                    roleArns[
                                      account.id
                                    ] ??
                                    account.roleArn ??
                                    ""
                                  ).trim()
                                }
                                onClick={() => {
                                  void handleConfigureConnection(
                                    account,
                                  );
                                }}
                              >
                                {mutating
                                  ? "Saving..."
                                  : account.roleArn
                                    ? "Update role"
                                    : "Save role"}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  mutating ||
                                  mutatingAccountId !==
                                    null ||
                                  !account.roleArn
                                }
                                onClick={() => {
                                  void handleVerifyConnection(
                                    account,
                                  );
                                }}
                              >
                                {mutating
                                  ? "Verifying..."
                                  : "Verify connection"}
                              </button>
                            </div>
                          </div>
                        )}
                    </div>

                    {canManageAccounts && (
                      <div>
                        <button
                          type="button"
                          disabled={
                            mutating ||
                            mutatingAccountId !== null
                          }
                          onClick={() => {
                            void handleRename(
                              account,
                            );
                          }}
                        >
                          Rename
                        </button>

                        {account.isActive ? (
                          <button
                            type="button"
                            disabled={
                              mutating ||
                              mutatingAccountId !==
                                null
                            }
                            onClick={() => {
                              void handleDisconnect(
                                account,
                              );
                            }}
                          >
                            {mutating
                              ? "Disconnecting..."
                              : "Disconnect"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              mutating ||
                              mutatingAccountId !==
                                null
                            }
                            onClick={() => {
                              void handleReconnect(
                                account,
                              );
                            }}
                          >
                            {mutating
                              ? "Reconnecting..."
                              : "Reconnect"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
