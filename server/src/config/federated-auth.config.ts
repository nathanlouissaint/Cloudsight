import type {
  FederatedProviderConfig,
  FederatedProviderKind,
} from "../types/auth/federated.types";

export interface GoogleProviderConfig
  extends FederatedProviderConfig {
  providerKind: "GOOGLE";
  clientSecret: string;
}

export interface EntraProviderConfig
  extends FederatedProviderConfig {
  providerKind: "MICROSOFT";
  clientSecret: string;
  authority: "organizations";
  allowedTenantIds: readonly string[];
}

export interface GitHubProviderConfig
  extends FederatedProviderConfig {
  providerKind: "GITHUB";
  clientSecret: string;
}

function readRequired(name: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const value = env[name]?.trim();
  return value || undefined;
}

function validateRedirectUri(
  redirectUri: string,
  providerName = "Federated",
): string {
  let parsed: URL;

  try {
    parsed = new URL(redirectUri);
  } catch {
    throw new Error(
      `${providerName}_REDIRECT_URI must be a valid URL`,
    );
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      `${providerName}_REDIRECT_URI must use http or https`,
    );
  }

  return parsed.toString();
}

function readTenantIds(env: NodeJS.ProcessEnv): readonly string[] {
  const raw = readRequired("ENTRA_ALLOWED_TENANT_IDS", env);
  if (!raw) throw new Error("ENTRA_ALLOWED_TENANT_IDS must contain at least one tenant ID");
  const ids = raw.split(",").map((value) => value.trim());
  if (ids.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
    throw new Error("ENTRA_ALLOWED_TENANT_IDS contains an invalid tenant ID");
  }
  return [...new Set(ids.map((id) => id.toLowerCase()))];
}

export function loadEntraConfig(env: NodeJS.ProcessEnv = process.env): EntraProviderConfig | null {
  const clientId = readRequired("ENTRA_CLIENT_ID", env);
  const clientSecret = readRequired("ENTRA_CLIENT_SECRET", env);
  const redirectUri = readRequired("ENTRA_REDIRECT_URI", env);
  const authority = readRequired("ENTRA_AUTHORITY", env);
  const configuredCount = [clientId, clientSecret, redirectUri, authority, env.ENTRA_ALLOWED_TENANT_IDS?.trim()].filter(Boolean).length;
  if (configuredCount === 0) return null;
  if (!clientId || !clientSecret || !redirectUri || !authority || !env.ENTRA_ALLOWED_TENANT_IDS?.trim()) {
    throw new Error("Microsoft Entra authentication configuration is incomplete");
  }
  if (authority !== "organizations") throw new Error("ENTRA_AUTHORITY must be organizations");
  return {
    providerKind: "MICROSOFT",
    issuer: "https://login.microsoftonline.com/organizations/v2.0",
    clientId,
    clientSecret,
    authority,
    allowedTenantIds: readTenantIds(env),
    redirectUri: validateRedirectUri(redirectUri, "ENTRA"),
    scopes: ["openid", "profile", "email"],
  };
}

export function loadGoogleConfig(
  env: NodeJS.ProcessEnv = process.env,
):
  | GoogleProviderConfig
  | null {
  const clientId =
    readRequired("GOOGLE_CLIENT_ID", env);
  const clientSecret =
    readRequired("GOOGLE_CLIENT_SECRET", env);
  const redirectUri =
    readRequired("GOOGLE_REDIRECT_URI", env);

  const configuredCount = [
    clientId,
    clientSecret,
    redirectUri,
  ].filter(Boolean).length;

  if (configuredCount === 0) {
    return null;
  }

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri
  ) {
    throw new Error(
      "Google authentication configuration is incomplete",
    );
  }

  return {
    providerKind: "GOOGLE",
    issuer: "https://accounts.google.com",
    clientId,
    clientSecret,
    redirectUri: validateRedirectUri(redirectUri, "GOOGLE"),
    scopes: [
      "openid",
      "email",
      "profile",
    ],
  };
}

export const GOOGLE_PROVIDER_CONFIG =
  loadGoogleConfig();

export const ENTRA_PROVIDER_CONFIG =
  loadEntraConfig();

export function loadGitHubConfig(
  env: NodeJS.ProcessEnv = process.env,
): GitHubProviderConfig | null {
  const clientId = readRequired("GITHUB_CLIENT_ID", env);
  const clientSecret = readRequired("GITHUB_CLIENT_SECRET", env);
  const redirectUri = readRequired("GITHUB_REDIRECT_URI", env);
  const configuredCount = [clientId, clientSecret, redirectUri].filter(Boolean).length;

  if (configuredCount === 0) return null;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("GitHub authentication configuration is incomplete");
  }

  return {
    providerKind: "GITHUB",
    issuer: "https://github.com",
    clientId,
    clientSecret,
    redirectUri: validateRedirectUri(redirectUri, "GITHUB"),
    scopes: ["user:email"],
  };
}

export const GITHUB_PROVIDER_CONFIG =
  loadGitHubConfig();

/**
 * Provider configuration is intentionally empty until a provider is enabled.
 * Secrets and provider credentials must be supplied by a later implementation.
 */
export const FEDERATED_PROVIDER_CONFIGS: readonly FederatedProviderConfig[] =
  [
    ...(GOOGLE_PROVIDER_CONFIG ? [GOOGLE_PROVIDER_CONFIG] : []),
    ...(ENTRA_PROVIDER_CONFIG ? [ENTRA_PROVIDER_CONFIG] : []),
    ...(GITHUB_PROVIDER_CONFIG ? [GITHUB_PROVIDER_CONFIG] : []),
  ];

export function getFederatedProviderConfig(
  providerKind: FederatedProviderKind,
): FederatedProviderConfig | null {
  return FEDERATED_PROVIDER_CONFIGS.find((config) => config.providerKind === providerKind) ?? null;
}
