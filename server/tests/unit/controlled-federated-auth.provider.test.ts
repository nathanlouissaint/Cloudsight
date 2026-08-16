import { describe, expect, it } from "vitest";

import { ControlledFederatedAuthProvider } from "../../src/services/auth/providers/controlled-federated-auth.provider";

describe("controlled federated provider boundary", () => {
  it("supports a fixed server-controlled GitHub identity through the trusted callback", async () => {
    const provider = new ControlledFederatedAuthProvider("GITHUB");
    const authorizationUrl = new URL(provider.getAuthorizationUrl({
      state: "state-value",
      codeChallenge: "A".repeat(43),
      nonce: "unused",
      redirectUri: "http://127.0.0.1:4100/auth/oauth/github/callback",
    }));

    expect(authorizationUrl.origin).toBe("http://127.0.0.1:4100");
    expect(authorizationUrl.pathname).toBe("/auth/oauth/github/callback");
    expect(authorizationUrl.searchParams.get("state")).toBe("state-value");
    expect(await provider.exchangeAuthorizationCode()).toEqual({
      providerKind: "GITHUB",
      issuer: "https://github.com",
      subject: "9001001",
      email: "cloudsight-e2e-controlled-github@example.test",
      emailVerified: true,
      displayName: "CloudSight E2E GitHub User",
    });
  });

  it("rejects malformed start material instead of weakening PKCE", () => {
    const provider = new ControlledFederatedAuthProvider("GITHUB");
    expect(() => provider.getAuthorizationUrl({
      state: "state-value",
      codeChallenge: "not-a-s256-challenge",
      redirectUri: provider.redirectUri,
    })).toThrow("Controlled federated authorization request is invalid.");
  });
});
