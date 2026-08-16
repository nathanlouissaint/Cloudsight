import { describe, expect, it, vi } from "vitest";

import {
  GITHUB_EMAILS_ENDPOINT,
  GITHUB_TOKEN_ENDPOINT,
  GITHUB_USER_ENDPOINT,
  GitHubOAuthProvider,
} from "../../src/services/auth/providers/github-oauth.provider";
import type { GitHubProviderConfig } from "../../src/config/federated-auth.config";

const config: GitHubProviderConfig = {
  providerKind: "GITHUB",
  issuer: "https://github.com",
  clientId: "client-id",
  clientSecret: "client-secret",
  redirectUri: "https://cloudsight.test/auth/oauth/github/callback",
  scopes: ["user:email"],
};

function response(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function providerWith(fetcher: typeof fetch) {
  return new GitHubOAuthProvider(config, fetcher);
}

describe("GitHub OAuth provider boundary", () => {
  it("constructs a trusted PKCE authorization URL", () => {
    const url = new URL(providerWith(vi.fn() as typeof fetch).getAuthorizationUrl({
      state: "state-value",
      codeChallenge: "challenge-value",
      nonce: "unused-nonce",
      redirectUri: config.redirectUri,
    }));
    expect(url.origin + url.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri);
    expect(url.searchParams.get("scope")).toBe("user:email");
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-value");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.toString()).not.toContain("client-secret");
  });

  it("exchanges the code and consumes the token internally", async () => {
    const calls: Array<[string, RequestInit | undefined]> = [];
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      calls.push([String(url), init]);
      if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "secret-token" });
      if (url === GITHUB_USER_ENDPOINT) return response({ id: 123, login: "old-name", name: "User" });
      if (url === GITHUB_EMAILS_ENDPOINT) return response([{ email: "User@Example.test", primary: true, verified: true }]);
      throw new Error("unexpected endpoint");
    });
    const identity = await providerWith(fetcher).exchangeAuthorizationCode("secret-code", "verifier");
    expect(identity).toMatchObject({
      providerKind: "GITHUB",
      issuer: "https://github.com",
      subject: "123",
      email: "user@example.test",
      emailVerified: true,
    });
    expect(calls).toHaveLength(3);
    expect(calls[0][0]).toBe(GITHUB_TOKEN_ENDPOINT);
    expect(calls[0][1]?.body?.toString()).toContain("code_verifier=verifier");
    expect(calls[0][1]?.body?.toString()).toContain("client_secret=client-secret");
    expect(calls[1][0]).toBe(GITHUB_USER_ENDPOINT);
    expect(calls[2][0]).toBe(GITHUB_EMAILS_ENDPOINT);
    expect(calls[1][1]?.headers).toMatchObject({ Authorization: "Bearer secret-token" });
    expect(calls[2][1]?.headers).toMatchObject({ Authorization: "Bearer secret-token" });
  });

  it("uses the numeric id, not login, as the subject", async () => {
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "token" });
      if (url === GITHUB_USER_ENDPOINT) return response({ id: 42, login: "renamed" });
      return response([{ email: "primary@example.test", primary: true, verified: true }]);
    });
    const identity = await providerWith(fetcher).exchangeAuthorizationCode("code", "verifier");
    expect(identity.subject).toBe("42");
  });

  it("keeps the same numeric identity when the GitHub username changes", async () => {
    const identityForLogin = async (login: string) => {
      const fetcher = vi.fn<typeof fetch>(async (url) => {
        if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "token" });
        if (url === GITHUB_USER_ENDPOINT) return response({ id: 424242, login });
        return response([{ email: "primary@example.test", primary: true, verified: true }]);
      });
      return providerWith(fetcher).exchangeAuthorizationCode("code", "verifier");
    };

    const before = await identityForLogin("original-name");
    const after = await identityForLogin("renamed-account");
    expect(before.subject).toBe("424242");
    expect(after.subject).toBe(before.subject);
    expect(before).not.toHaveProperty("login");
    expect(after).not.toHaveProperty("login");
  });

  it.each([
    [{ id: 0 }],
    [{ id: -1 }],
    [{ id: 1.5 }],
    [{ login: "missing-id" }],
    ["not-an-object"],
  ])("rejects malformed user response %j", async (user) => {
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "token" });
      if (url === GITHUB_USER_ENDPOINT) return response(user);
      return response([]);
    });
    await expect(providerWith(fetcher).exchangeAuthorizationCode("code", "verifier")).rejects.toThrow();
  });

  it("accepts a verified primary noreply address", async () => {
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "token" });
      if (url === GITHUB_USER_ENDPOINT) return response({ id: 9 });
      return response([{ email: "9+user@users.noreply.github.com", primary: true, verified: true }]);
    });
    await expect(providerWith(fetcher).exchangeAuthorizationCode("code", "verifier")).resolves.toMatchObject({ emailVerified: true });
  });

  it.each([
    [],
    [{ email: "secondary@example.test", primary: false, verified: true }],
    [{ email: "primary@example.test", primary: true, verified: false }],
    [
      { email: "one@example.test", primary: true, verified: true },
      { email: "two@example.test", primary: true, verified: true },
    ],
    [{ email: "bad", primary: true, verified: true }],
    [{ email: "primary@example.test", primary: true, verified: "yes" }],
  ])("rejects email selection %j", async (emails) => {
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "token" });
      if (url === GITHUB_USER_ENDPOINT) return response({ id: 9 });
      return response(emails);
    });
    await expect(providerWith(fetcher).exchangeAuthorizationCode("code", "verifier")).rejects.toThrow();
  });

  it("does not trust /user.email in place of the verified email list", async () => {
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      if (url === GITHUB_TOKEN_ENDPOINT) return response({ access_token: "token" });
      if (url === GITHUB_USER_ENDPOINT) return response({ id: 9, email: "unverified@example.test" });
      return response([{ email: "verified@example.test", primary: false, verified: true }]);
    });
    await expect(providerWith(fetcher).exchangeAuthorizationCode("code", "verifier")).rejects.toThrow();
  });

  it.each([
    { status: 401, body: { message: "unauthorized secret-token" } },
    { status: 403, body: { message: "rate limited secret-token" } },
    { status: 500, body: { message: "provider internals secret-token" } },
  ])("sanitizes provider failures", async ({ status, body }) => {
    const fetcher = vi.fn<typeof fetch>(async () => response(body, status));
    await expect(providerWith(fetcher).exchangeAuthorizationCode("secret-code", "secret-verifier")).rejects.toThrow("GitHub authorization response is invalid");
    try {
      await providerWith(fetcher).exchangeAuthorizationCode("secret-code", "secret-verifier");
    } catch (error) {
      expect(String(error)).not.toContain("secret-token");
      expect(String(error)).not.toContain("secret-code");
      expect(String(error)).not.toContain("secret-verifier");
    }
  });

  it.each([
    {},
    { access_token: "" },
    { access_token: 123 },
  ])("rejects malformed token response %j", async (tokenBody) => {
    const fetcher = vi.fn<typeof fetch>(async () => response(tokenBody));

    await expect(
      providerWith(fetcher).exchangeAuthorizationCode("secret-code", "secret-verifier"),
    ).rejects.toThrow("GitHub authorization response is invalid");
  });

  it.each([
    ["invalid JSON", vi.fn<typeof fetch>(async () => new Response("not-json"))],
    ["network failure", vi.fn<typeof fetch>(async () => { throw new Error("SECRET_NETWORK_FAILURE"); })],
  ])("sanitizes %s during token exchange", async (_label, fetcher) => {
    try {
      await providerWith(fetcher).exchangeAuthorizationCode("SECRET_CODE", "SECRET_VERIFIER");
      throw new Error("expected provider exchange to fail");
    } catch (error) {
      expect(String(error)).toContain("GitHub authorization response is invalid");
      expect(String(error)).not.toMatch(/SECRET_CODE|SECRET_VERIFIER|SECRET_NETWORK_FAILURE/);
    }
  });
});
