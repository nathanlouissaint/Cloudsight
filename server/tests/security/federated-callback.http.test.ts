import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.hoisted(() => {
  process.env.NODE_ENV = "test";
  process.env.CORS_ORIGIN = "http://localhost:5173";
  process.env.CSRF_SECRET = "test-only-csrf-secret-material-32-bytes-minimum";
});

import { createAuthTestApp } from "../helpers/create-auth-test-app";
import { authCookieService } from "../../src/services/auth/auth-cookie.service";
import { oauthTransactionService } from "../../src/services/auth/oauth-transaction.service";
import { sessionIssuanceService } from "../../src/services/auth/session-issuance.service";
import { federatedAuthService } from "../../src/services/auth/federated-auth.service";
import { userRepository } from "../../src/repositories/auth/user.repository";
import { auditService } from "../../src/services/auth/audit.service";
import * as providerRegistry from "../../src/services/auth/federated-provider.registry";

const consume = vi.spyOn(oauthTransactionService, "consume");
const getBinding = vi.spyOn(authCookieService, "getOAuthTransactionBinding");
const clearBinding = vi.spyOn(authCookieService, "clearOAuthTransactionBinding");
const issue = vi.spyOn(sessionIssuanceService, "issue");
const classify = vi.spyOn(federatedAuthService, "classifyIdentity");
const findUser = vi.spyOn(userRepository, "findById");
const audit = vi.spyOn(auditService, "recordEvent");
const providerResolver = vi.spyOn(providerRegistry, "getFederatedProvider");
const app = createAuthTestApp();

function expectSafeFailure(response: request.Response, sentinels: string[]) {
  const headers = response.headers["set-cookie"]?.join("\n") ?? "";
  const location = response.headers.location ?? "";
  const body = response.text ?? "";
  for (const value of sentinels) {
    expect(`${location}\n${body}\n${headers}`).not.toContain(value);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  getBinding.mockReturnValue("BROWSER_BINDING");
  consume.mockReturnValue({
    state: "STATE",
    providerKind: "GOOGLE",
    codeVerifier: "VERIFIER",
    nonce: "NONCE",
    browserBindingHash: "HASH",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
  });
  issue.mockResolvedValue({
    accessToken: "SECRET_CLOUDSIGHT_ACCESS_TOKEN",
    refreshToken: "SECRET_CLOUDSIGHT_REFRESH_TOKEN",
    sessionExpiresAt: new Date(Date.now() + 60_000),
    sessionId: "session-1",
    ipAddress: "127.0.0.1",
    userAgent: "test",
    user: { id: "user-1", email: "person@example.test", name: null, avatarUrl: null, authProvider: "GOOGLE" },
  });
  findUser.mockResolvedValue({
    id: "user-1", email: "person@example.test", name: null, avatarUrl: null,
    authProvider: "GOOGLE", emailVerifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
  });
  audit.mockResolvedValue({} as never);
  providerResolver.mockReturnValue({
    providerKind: "GOOGLE",
    redirectUri: "https://cloudsight.test/auth/oauth/google/callback",
    getAuthorizationUrl: vi.fn(),
    exchangeAuthorizationCode: vi.fn().mockResolvedValue({
      providerKind: "GOOGLE", issuer: "https://accounts.google.com", subject: "SECRET_PROVIDER_SUBJECT",
      email: "person@example.test", emailVerified: true,
    }),
    verifyIdentity: vi.fn(),
    normalizeIdentity: vi.fn(),
  });
});

describe("federated callback HTTP harness", () => {
  it("executes the real controller and safely redirects provider cancellation", async () => {
    const response = await request(app)
      .get("/auth/oauth/google/callback")
      .query({
        state: "STATE",
        error: "access_denied",
        error_description: "SECRET_PROVIDER_DESCRIPTION",
      });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "http://localhost:5173/login?authError=cancelled",
    );
    expect(response.headers.location).not.toContain("SECRET_PROVIDER_DESCRIPTION");
    expect(response.headers["set-cookie"]?.join("\n")).not.toContain("refreshToken=");
    expect(issue).not.toHaveBeenCalled();
    expect(clearBinding).toHaveBeenCalledOnce();
  });

  it("issues a session for the immutable existing identity and keeps secrets out of Location", async () => {
    classify.mockResolvedValue({ kind: "EXISTING_IDENTITY", identityId: "identity-1", userId: "user-1" });

    const response = await request(app)
      .get("/auth/oauth/google/callback")
      .query({ state: "CALLBACK_STATE", code: "SECRET_GOOGLE_AUTH_CODE" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/auth/oauth/complete");
    expect(issue).toHaveBeenCalledWith(expect.objectContaining({ id: "user-1" }), expect.anything());
    expect(response.headers.location).not.toMatch(/SECRET_|accessToken|refreshToken|csrfToken|id_token|code|state/i);
    expect(response.headers["set-cookie"]?.join("\n")).toContain("refreshToken=");
  });

  it("keeps EMAIL_COLLISION non-authenticating at the HTTP boundary", async () => {
    classify.mockResolvedValue({ kind: "EMAIL_COLLISION", matchedUserId: "SECRET_MATCHED_USER_ID" });

    const response = await request(app)
      .get("/auth/oauth/google/callback")
      .query({ state: "CALLBACK_STATE", code: "SECRET_GOOGLE_AUTH_CODE" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=account_link_required");
    expect(issue).not.toHaveBeenCalled();
    expect(response.headers["set-cookie"]?.join("\n")).not.toContain("refreshToken=");
    expect(response.headers.location).not.toContain("SECRET_MATCHED_USER_ID");
  });

  it("maps unusable email to a safe non-authenticating redirect", async () => {
    classify.mockResolvedValue({ kind: "EMAIL_UNUSABLE" });

    const response = await request(app)
      .get("/auth/oauth/google/callback")
      .query({ state: "CALLBACK_STATE", code: "SECRET_GOOGLE_AUTH_CODE" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=email_required");
    expect(issue).not.toHaveBeenCalled();
  });

  it("maps arbitrary provider errors to the safe cancellation outcome", async () => {
    const response = await request(app).get("/auth/oauth/google/callback").query({
      state: "CALLBACK_STATE", error: "SECRET_PROVIDER_ERROR", error_description: "SECRET_PROVIDER_DESCRIPTION",
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=cancelled");
    expectSafeFailure(response, ["SECRET_PROVIDER_ERROR", "SECRET_PROVIDER_DESCRIPTION"]);
  });

  it("fails safely when provider exchange throws", async () => {
    providerResolver.mockReturnValueOnce({
      providerKind: "GOOGLE", redirectUri: "https://cloudsight.test/auth/oauth/google/callback",
      getAuthorizationUrl: vi.fn(), verifyIdentity: vi.fn(), normalizeIdentity: vi.fn(),
      exchangeAuthorizationCode: vi.fn().mockRejectedValue(new Error("SECRET_INTERNAL_FAILURE")),
    });

    const response = await request(app).get("/auth/oauth/google/callback").query({ state: "CALLBACK_STATE", code: "CODE" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=oauth_failed");
    expectSafeFailure(response, ["SECRET_INTERNAL_FAILURE"]);
  });

  it.each([
    ["invalid state", () => { throw new Error("SECRET_INVALID_STATE"); }],
    ["expired state", () => { throw new Error("expired"); }],
    ["replayed state", () => { throw new Error("replayed"); }],
  ])("rejects %s at the HTTP boundary", async (_label, failure) => {
    consume.mockImplementation(failure as never);
    const response = await request(app).get("/auth/oauth/google/callback").query({ state: "CALLBACK_STATE", code: "CODE" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=oauth_failed");
    expect(issue).not.toHaveBeenCalled();
    expectSafeFailure(response, ["SECRET_INVALID_STATE"]);
  });

  it("rejects a missing browser binding", async () => {
    getBinding.mockReturnValue(null);
    const response = await request(app).get("/auth/oauth/google/callback").query({ state: "CALLBACK_STATE", code: "CODE" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=oauth_failed");
    expect(consume).not.toHaveBeenCalled();
    expect(issue).not.toHaveBeenCalled();
  });

  it.each([
    ["missing state", { code: "SECRET_CODE" }],
    ["missing code", { state: "SECRET_STATE" }],
    ["duplicate state", { state: ["SECRET_STATE", "SECOND_STATE"], code: "SECRET_CODE" }],
    ["duplicate code", { state: "SECRET_STATE", code: ["SECRET_CODE", "SECOND_CODE"] }],
  ])("rejects %s without disclosing callback parameters", async (_label, query) => {
    const response = await request(app).get("/auth/oauth/google/callback").query(query);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=oauth_failed");
    expect(issue).not.toHaveBeenCalled();
    expectSafeFailure(response, ["SECRET_CODE", "SECRET_STATE", "SECOND_CODE", "SECOND_STATE"]);
  });

  it("rejects a wrong browser binding", async () => {
    consume.mockImplementation(() => { throw new Error("binding mismatch"); });
    const response = await request(app).get("/auth/oauth/google/callback").query({ state: "CALLBACK_STATE", code: "CODE" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/login?authError=oauth_failed");
    expect(issue).not.toHaveBeenCalled();
  });

  it("keeps attacker redirect material out of callback destinations", async () => {
    for (const key of ["error_description", "error", "returnTo", "redirect", "redirect_uri", "next"]) {
      const response = await request(app).get("/auth/oauth/google/callback").query({ state: "CALLBACK_STATE", [key]: "https://attacker.example" });
      const location = new URL(response.headers.location);
      expect(location.origin).toBe("http://localhost:5173");
      expect(response.headers.location).not.toContain("https://attacker.example");
    }
  });

  it("emits secure success cookie attributes", async () => {
    classify.mockResolvedValue({ kind: "EXISTING_IDENTITY", identityId: "identity-1", userId: "user-1" });
    const response = await request(app).get("/auth/oauth/google/callback").query({ state: "CALLBACK_STATE", code: "CODE" });
    const cookies = response.headers["set-cookie"]?.join("\n") ?? "";
    expect(cookies).toContain("refreshToken=");
    expect(cookies).toContain("HttpOnly");
    expect(cookies).toContain("Path=/auth");
    expect(cookies).toContain("SameSite=Lax");
    expect(cookies).toContain("cloudsight.csrf=");
  });
});
