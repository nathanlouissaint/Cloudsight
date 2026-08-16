import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { describe, expect, it } from "vitest";
import {
  loadEntraConfig,
  loadGitHubConfig,
  loadGoogleConfig,
  FEDERATED_PROVIDER_CONFIGS,
} from "../../src/config/federated-auth.config";

const tenant = "11111111-1111-4111-8111-111111111111";
const complete = {
  ENTRA_CLIENT_ID: "client",
  ENTRA_CLIENT_SECRET: "secret",
  ENTRA_AUTHORITY: "organizations",
  ENTRA_REDIRECT_URI: "https://cloudsight.test/auth/oauth/microsoft/callback",
  ENTRA_ALLOWED_TENANT_IDS: tenant,
};

describe("Microsoft Entra configuration foundation", () => {
  it("is disabled when absent and accepts complete configuration", () => {
    expect(loadEntraConfig({})).toBeNull();
    expect(loadEntraConfig({ ...complete, ENTRA_ALLOWED_TENANT_IDS: `${tenant},${tenant.toUpperCase()}` })).toMatchObject({ providerKind: "MICROSOFT", authority: "organizations", allowedTenantIds: [tenant] });
  });

  it.each([
    { ENTRA_CLIENT_ID: "client" },
    { ENTRA_CLIENT_SECRET: "secret" },
    { ...complete, ENTRA_ALLOWED_TENANT_IDS: undefined },
    { ...complete, ENTRA_AUTHORITY: "common" },
    { ...complete, ENTRA_ALLOWED_TENANT_IDS: "" },
    { ...complete, ENTRA_ALLOWED_TENANT_IDS: "common" },
  ])("rejects invalid or partial configuration", (values) => {
    expect(() => loadEntraConfig(values)).toThrow();
  });

  it("keeps the existing provider configuration list stable when Entra is absent", () => {
    expect(FEDERATED_PROVIDER_CONFIGS.every((entry) => entry.providerKind === "GOOGLE" || entry.providerKind === "MICROSOFT")).toBe(true);
  });
});

describe("optional provider example configuration", () => {
  it("keeps every optional provider disabled when .env.example is copied", () => {
    const example = dotenv.parse(
      readFileSync(
        resolve(process.cwd(), "../.env.example"),
      ),
    );

    expect(loadGoogleConfig(example)).toBeNull();
    expect(loadEntraConfig(example)).toBeNull();
    expect(loadGitHubConfig(example)).toBeNull();
  });

  it.each([
    { GOOGLE_CLIENT_ID: "client" },
    { GOOGLE_CLIENT_SECRET: "secret" },
    {
      GOOGLE_REDIRECT_URI:
        "https://cloudsight.test/auth/oauth/google/callback",
    },
  ])("keeps partial Google configuration fail-closed", (values) => {
    expect(() => loadGoogleConfig(values)).toThrow();
  });
});

describe("GitHub configuration foundation", () => {
  const complete = {
    GITHUB_CLIENT_ID: "github-client",
    GITHUB_CLIENT_SECRET: "github-secret",
    GITHUB_REDIRECT_URI: "https://cloudsight.test/auth/oauth/github/callback",
  };

  it("is disabled when all GitHub variables are absent", () => {
    expect(loadGitHubConfig({})).toBeNull();
  });

  it("accepts complete configuration without affecting other providers", () => {
    expect(loadGitHubConfig(complete)).toMatchObject({
      providerKind: "GITHUB",
      issuer: "https://github.com",
      scopes: ["user:email"],
    });
    expect(loadEntraConfig({})).toBeNull();
  });

  it.each([
    { GITHUB_CLIENT_ID: "github-client" },
    { GITHUB_CLIENT_SECRET: "github-secret" },
    { GITHUB_REDIRECT_URI: complete.GITHUB_REDIRECT_URI },
    { GITHUB_CLIENT_ID: "github-client", GITHUB_CLIENT_SECRET: "github-secret" },
    { GITHUB_CLIENT_ID: "github-client", GITHUB_REDIRECT_URI: complete.GITHUB_REDIRECT_URI },
    { GITHUB_CLIENT_SECRET: "github-secret", GITHUB_REDIRECT_URI: complete.GITHUB_REDIRECT_URI },
    { ...complete, GITHUB_REDIRECT_URI: "not-a-url" },
    { ...complete, GITHUB_REDIRECT_URI: "javascript:alert(1)" },
  ])("rejects partial or invalid configuration", (values) => {
    expect(() => loadGitHubConfig(values)).toThrow();
  });

  it("uses only the authentication scope", () => {
    expect(loadGitHubConfig(complete)?.scopes).toEqual(["user:email"]);
  });
});
