import { describe, expect, it } from "vitest";
import { EntraOidcProvider } from "../../src/services/auth/providers/entra-oidc.provider";
import type { EntraProviderConfig } from "../../src/config/federated-auth.config";

const tenant = "11111111-1111-4111-8111-111111111111";
const config: EntraProviderConfig = {
  providerKind: "MICROSOFT",
  issuer: "https://login.microsoftonline.com/organizations/v2.0",
  clientId: "entra-client",
  clientSecret: "entra-secret",
  authority: "organizations",
  allowedTenantIds: [tenant],
  redirectUri: "http://localhost:4100/auth/microsoft/callback",
  scopes: ["openid", "profile", "email"],
};

function response(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

async function signedToken(overrides: Record<string, unknown> = {}) {
  const jose = await import("jose");
  const { privateKey, publicKey } = await jose.generateKeyPair("RS256");
  const jwk = await jose.exportJWK(publicKey);
  const token = await new jose.SignJWT({
    tid: tenant,
    iss: `https://login.microsoftonline.com/${tenant}/v2.0`,
    sub: "immutable-subject",
    aud: config.clientId,
    nonce: "nonce-1",
    email: "person@example.test",
    name: "Person",
    ...overrides,
  }).setProtectedHeader({ alg: "RS256", kid: "entra-test" }).setIssuedAt().setExpirationTime("5m").sign(privateKey);
  return { token, jwks: { keys: [{ ...jwk, kid: "entra-test", alg: "RS256", use: "sig", issuer: "https://login.microsoftonline.com/{tenantid}/v2.0" }] } };
}

const discovery = {
  issuer: "https://login.microsoftonline.com/{tenantid}/v2.0",
  authorization_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize",
  token_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token",
  jwks_uri: "https://login.microsoftonline.com/organizations/discovery/v2.0/keys",
};

function providerFor(tokenMaterial?: { jwks: unknown }) {
  return new EntraOidcProvider(config, async (input, init) => {
    const url = String(input);
    if (url.includes("openid-configuration")) return response(discovery);
    if (url.includes("/discovery/")) return response(tokenMaterial?.jwks ?? { keys: [] });
    return response({ id_token: "unused" });
  });
}

describe("Entra OIDC provider boundary", () => {
  it("builds a trusted authorization URL with state, PKCE, nonce, and minimal scopes", () => {
    const url = new URL(new EntraOidcProvider(config).getAuthorizationUrl({ state: "state", codeChallenge: "challenge", nonce: "nonce", redirectUri: config.redirectUri }));
    expect(url.origin).toBe("https://login.microsoftonline.com");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toBe("openid profile email");
    expect(url.searchParams.get("offline_access")).toBeNull();
    expect(url.searchParams.get("state")).toBe("state");
    expect(url.searchParams.get("nonce")).toBe("nonce");
  });

  it("normalizes an allowed tenant GUID before exact issuer construction", async () => {
    const uppercaseTenant = tenant.toUpperCase();
    const material = await signedToken({ tid: uppercaseTenant, iss: `https://login.microsoftonline.com/${tenant}/v2.0` });
    const identity = await providerFor(material).verifyIdentity(material.token, "nonce-1");
    expect(identity.issuer).toBe(`https://login.microsoftonline.com/${tenant}/v2.0`);
  });

  it("exchanges a code and cryptographically validates a signed ID token", async () => {
    const material = await signedToken();
    let request: RequestInit | undefined;
    const provider = new EntraOidcProvider(config, async (input, init) => {
      const url = String(input);
      if (url.includes("openid-configuration")) return response(discovery);
      if (url.includes("/discovery/")) return response(material.jwks);
      request = init;
      return response({ id_token: material.token });
    });
    const identity = await provider.exchangeAuthorizationCode("code", "verifier", "nonce-1");
    expect(identity).toMatchObject({ providerKind: "MICROSOFT", issuer: `https://login.microsoftonline.com/${tenant}/v2.0`, subject: "immutable-subject", email: "person@example.test" });
    expect(String(request?.body)).toContain("code_verifier=verifier");
    expect(String(request?.body)).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A4100%2Fauth%2Fmicrosoft%2Fcallback");
  });

  it("rejects provider errors and malformed token responses", async () => {
    const provider = new EntraOidcProvider(config, async (input) => {
      if (String(input).includes("openid-configuration")) return response(discovery);
      return response({ error: "invalid_grant" }, 400);
    });
    await expect(provider.exchangeAuthorizationCode("code", "verifier", "nonce-1")).rejects.toMatchObject({ code: "FEDERATED_PROVIDER_RESPONSE_INVALID" });
  });

  it("rejects invalid signature, audience, nonce, tenant, and issuer", async () => {
    const valid = await signedToken();
    const cases = [
      { token: `${valid.token}x`, label: "signature" },
      { token: (await signedToken({ aud: "other" })).token, label: "audience" },
      { token: (await signedToken({ nonce: "wrong" })).token, label: "nonce" },
      { token: (await signedToken({ tid: "22222222-2222-4222-8222-222222222222" })).token, label: "tenant" },
      { token: (await signedToken({ iss: `https://login.microsoftonline.com/${tenant}/v2.0/other` })).token, label: "issuer" },
    ];
    for (const item of cases) {
      const provider = providerFor(valid);
      await expect(provider.verifyIdentity(item.token, "nonce-1")).rejects.toMatchObject({ code: "FEDERATED_PROVIDER_RESPONSE_INVALID" });
    }
  });

  it.each([
    "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0/other",
    "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0?anything=true",
    "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0#fragment",
    "https://login.microsoftonline.com/evil/11111111-1111-4111-8111-111111111111/v2.0",
    "https://example.com/11111111-1111-4111-8111-111111111111/v2.0",
    "https://login.microsoftonline.com/22222222-2222-4222-8222-222222222222/v2.0",
  ])("requires exact tenant issuer equality: %s", async (issuer) => {
    const material = await signedToken({ iss: issuer });
    await expect(providerFor(material).verifyIdentity(material.token, "nonce-1")).rejects.toMatchObject({ code: "FEDERATED_PROVIDER_RESPONSE_INVALID" });
  });

  it("rejects missing nonce and missing subject, and accepts realistic Entra email claims without email_verified", async () => {
    const noSubject = await signedToken({ sub: undefined });
    const provider = providerFor(noSubject);
    await expect(provider.verifyIdentity(noSubject.token, "nonce-1")).rejects.toBeInstanceOf(Error);
    const preferred = await signedToken({ email: undefined, preferred_username: "Preferred@Example.test" });
    const identity = await providerFor(preferred).verifyIdentity(preferred.token, "nonce-1");
    expect(identity).toMatchObject({ email: "preferred@example.test", emailVerified: true });
  });

  it("uses email, preferred_username, then upn only when the claim is email-shaped", async () => {
    const material = await signedToken({
      email: "Primary@Example.test",
      preferred_username: "preferred@example.test",
      upn: "upn@example.test",
    });
    await expect(providerFor(material).verifyIdentity(material.token, "nonce-1")).resolves.toMatchObject({ email: "primary@example.test" });

    const unusable = await signedToken({ email: undefined, preferred_username: "phone-or-handle", upn: undefined });
    const identity = await providerFor(unusable).verifyIdentity(unusable.token, "nonce-1");
    expect(identity.email).toBeUndefined();
    expect(identity.emailVerified).toBeUndefined();
  });

  it("rejects non-template discovery issuers, endpoint overrides, and mismatched signing-key issuers", async () => {
    for (const override of [
      { issuer: config.issuer },
      { token_endpoint: "https://login.microsoftonline.com/evil/token" },
      { jwks_uri: "https://example.test/keys" },
    ]) {
      const provider = new EntraOidcProvider(config, async () => response({ ...discovery, ...override }));
      await expect(provider.verifyIdentity("token", "nonce-1")).rejects.toMatchObject({ code: "FEDERATED_PROVIDER_RESPONSE_INVALID" });
    }

    const material = await signedToken();
    const wrongKeyIssuer = {
      jwks: {
        keys: material.jwks.keys.map((key) => ({ ...key, issuer: "https://login.microsoftonline.com/22222222-2222-4222-8222-222222222222/v2.0" })),
      },
    };
    await expect(providerFor(wrongKeyIssuer).verifyIdentity(material.token, "nonce-1")).rejects.toMatchObject({ code: "FEDERATED_PROVIDER_RESPONSE_INVALID" });
  });
});
