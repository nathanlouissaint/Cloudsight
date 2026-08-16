import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyIdToken = vi.fn();
const generateAuthUrl = vi.fn(() => "https://accounts.google.test/oauth");

vi.mock("google-auth-library", () => ({
  CodeChallengeMethod: { S256: "S256" },
  OAuth2Client: class {
    generateAuthUrl = generateAuthUrl;
    verifyIdToken = verifyIdToken;
  },
}));

import { GoogleFederatedAuthProvider } from "../../src/services/auth/providers/google-federated-auth.provider";

const config = {
  providerKind: "GOOGLE" as const,
  issuer: "https://accounts.google.com",
  clientId: "google-client.test",
  clientSecret: "secret-not-real",
  redirectUri: "https://cloudsight.test/auth/oauth/google/callback",
  scopes: ["openid", "email", "profile"] as const,
};

describe("Google federated provider boundary", () => {
  const provider = new GoogleFederatedAuthProvider(config);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the configured audience and normalizes verified claims", async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "google-subject",
        email: "person@example.test",
        email_verified: true,
        nonce: "expected-nonce",
      }),
    });

    const identity = await provider.verifyIdentity("SECRET_GOOGLE_ID_TOKEN", "expected-nonce");

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: "SECRET_GOOGLE_ID_TOKEN",
      audience: "google-client.test",
    });
    expect(identity).toMatchObject({
      providerKind: "GOOGLE",
      issuer: "https://accounts.google.com",
      subject: "google-subject",
      email: "person@example.test",
      emailVerified: true,
    });
  });

  it.each([
    "accounts.google.com",
    "https://accounts.google.com",
  ])("canonicalizes the accepted issuer form %s", async (issuer) => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: issuer,
        sub: "same-google-subject",
        email: "person@example.test",
        email_verified: true,
        nonce: "expected-nonce",
      }),
    });

    await expect(provider.verifyIdentity("ID_TOKEN", "expected-nonce")).resolves.toMatchObject({
      issuer: "https://accounts.google.com",
      subject: "same-google-subject",
    });
  });

  it.each([
    ["provider verification failure", undefined],
    ["missing subject", { iss: "https://accounts.google.com" }],
    ["wrong issuer", { iss: "https://evil.example", sub: "subject" }],
  ])("fails closed for %s", async (_label, payload) => {
    if (payload === undefined) {
      verifyIdToken.mockRejectedValue(new Error("provider failure"));
    } else {
      verifyIdToken.mockResolvedValue({ getPayload: () => payload });
    }

    await expect(provider.verifyIdentity("SECRET_GOOGLE_ID_TOKEN", "nonce")).rejects.toThrow(
      "Google identity response is invalid.",
    );
  });

  it("rejects nonce mismatches and does not expose provider credentials", async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        iss: "https://accounts.google.com",
        sub: "subject",
        nonce: "different-nonce",
      }),
    });

    await expect(provider.verifyIdentity("SECRET_GOOGLE_ID_TOKEN", "expected-nonce")).rejects.toThrow();
    expect(JSON.stringify(verifyIdToken.mock.calls)).not.toContain("SECRET_GOOGLE_ACCESS_TOKEN");
    expect(JSON.stringify(verifyIdToken.mock.calls)).not.toContain("SECRET_GOOGLE_REFRESH_TOKEN");
  });
});
