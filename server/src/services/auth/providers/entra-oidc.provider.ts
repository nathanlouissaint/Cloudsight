import { AuthDomainError } from "../../../errors/auth.errors";
import type { EntraProviderConfig } from "../../../config/federated-auth.config";
import type { FederatedAuthProvider, FederatedAuthorizationRequest, NormalizedFederatedIdentity } from "../../../types/auth/federated.types";
import type { LocalJWKSet } from "jose" with { "resolution-mode": "import" };
import { z } from "zod";

interface DiscoveryMetadata {
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  issuer: string;
}

const TENANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DISCOVERY_ISSUER = "https://login.microsoftonline.com/{tenantid}/v2.0";
const AUTHORIZATION_ENDPOINT = "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize";
const TOKEN_ENDPOINT = "https://login.microsoftonline.com/organizations/oauth2/v2.0/token";
const JWKS_ENDPOINT = "https://login.microsoftonline.com/organizations/discovery/v2.0/keys";
const entraEmail = z.string().trim().toLowerCase().email();

interface EntraJwks {
  keys: Record<string, unknown>[];
}

interface VerifiedJwks {
  resolver: LocalJWKSet;
  keys: Record<string, unknown>[];
}

export class EntraOidcProvider implements FederatedAuthProvider {
  readonly providerKind = "MICROSOFT" as const;
  readonly redirectUri: string;
  private metadataPromise: Promise<DiscoveryMetadata> | null = null;
  private jwksPromise: Promise<VerifiedJwks> | null = null;

  constructor(private readonly config: EntraProviderConfig, private readonly fetcher: typeof fetch = fetch) {
    this.redirectUri = config.redirectUri;
  }

  getAuthorizationUrl(request: FederatedAuthorizationRequest): string {
    if (request.redirectUri !== this.redirectUri) throw this.invalid("Entra redirect configuration is invalid.");
    const url = new URL(AUTHORIZATION_ENDPOINT);
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("response_mode", "query");
    url.searchParams.set("scope", this.config.scopes.join(" "));
    url.searchParams.set("state", request.state);
    url.searchParams.set("code_challenge", request.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    if (!request.nonce) throw this.invalid("Entra nonce is required.");
    url.searchParams.set("nonce", request.nonce);
    return url.toString();
  }

  async exchangeAuthorizationCode(code: string, codeVerifier: string, expectedNonce?: string, redirectUri = this.redirectUri): Promise<NormalizedFederatedIdentity> {
    if (!code || !codeVerifier || redirectUri !== this.redirectUri) throw this.invalid("Entra authorization response is invalid.");
    const metadata = await this.discovery();
    let response: Response;
    try {
      response = await this.fetcher(metadata.token_endpoint, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: this.config.clientId, client_secret: this.config.clientSecret, grant_type: "authorization_code", code, redirect_uri: this.redirectUri, code_verifier: codeVerifier }),
      });
    } catch {
      throw this.invalid("Entra authorization response is invalid.");
    }
    if (!response.ok) throw this.invalid("Entra authorization response is invalid.");
    let body: unknown;
    try { body = await response.json(); } catch { throw this.invalid("Entra authorization response is invalid."); }
    if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).id_token !== "string") throw this.invalid("Entra ID token is missing.");
    return this.verifyIdentity((body as { id_token: string }).id_token, expectedNonce);
  }

  async verifyIdentity(idToken: string, expectedNonce?: string): Promise<NormalizedFederatedIdentity> {
    if (!idToken || !expectedNonce) throw this.invalid("Entra ID token is invalid.");
    const metadata = await this.discovery();
    const { jwtVerify } = await import("jose");
    const jwks = await this.jwksFor(metadata.jwks_uri);
    const verified = await jwtVerify(idToken, jwks.resolver, { audience: this.config.clientId, algorithms: ["RS256"] }).catch(() => { throw this.invalid("Entra ID token is invalid."); });
    const identity = this.normalizeClaims(verified.payload, expectedNonce);
    const signingKeyMatchesIssuer = jwks.keys
      .filter((key) => key.kid === verified.protectedHeader.kid)
      .some((key) => key.issuer === DISCOVERY_ISSUER || key.issuer === identity.issuer);
    if (!signingKeyMatchesIssuer) throw this.invalid("Entra signing key issuer is invalid.");
    return identity;
  }

  normalizeIdentity(value: unknown): NormalizedFederatedIdentity {
    if (!value || typeof value !== "object") throw this.invalid("Entra identity is invalid.");
    return this.normalizeClaims(value as Record<string, any>, undefined);
  }

  private normalizeClaims(claims: Record<string, any>, expectedNonce?: string): NormalizedFederatedIdentity {
    const tid = typeof claims.tid === "string" ? claims.tid : "";
    const normalizedTid = tid.toLowerCase();
    const subject = typeof claims.sub === "string" ? claims.sub : "";
    const issuer = typeof claims.iss === "string" ? claims.iss : "";
    const expectedIssuer = `https://login.microsoftonline.com/${normalizedTid}/v2.0`;
    if (!TENANT.test(tid) || !this.config.allowedTenantIds.includes(normalizedTid) || !subject || issuer !== expectedIssuer) throw this.invalid("Entra tenant or identity is invalid.");
    if (expectedNonce !== undefined && claims.nonce !== expectedNonce) throw this.invalid("Entra nonce is invalid.");
    const email = this.usableEmail(claims);
    return { providerKind: "MICROSOFT", issuer: expectedIssuer, subject, ...(email ? { email, emailVerified: true } : {}), ...(typeof claims.name === "string" ? { displayName: claims.name } : {}) };
  }

  private async discovery(): Promise<DiscoveryMetadata> {
    if (!this.metadataPromise) this.metadataPromise = this.fetcher("https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration").then(async (response) => {
      if (!response.ok) throw this.invalid("Entra discovery failed.");
      const value = await response.json() as Partial<DiscoveryMetadata>;
      if (
        value.issuer !== DISCOVERY_ISSUER ||
        value.authorization_endpoint !== AUTHORIZATION_ENDPOINT ||
        value.token_endpoint !== TOKEN_ENDPOINT ||
        value.jwks_uri !== JWKS_ENDPOINT
      ) throw this.invalid("Entra discovery metadata is invalid.");
      return value as DiscoveryMetadata;
    }).catch((error) => { this.metadataPromise = null; throw error instanceof AuthDomainError ? error : this.invalid("Entra discovery failed."); });
    return this.metadataPromise;
  }

  private jwksFor(uri: string): Promise<VerifiedJwks> {
    if (!this.jwksPromise) {
      this.jwksPromise = this.fetcher(uri).then(async (response) => {
        if (!response.ok) throw this.invalid("Entra JWKS retrieval failed.");
        const value: unknown = await response.json();
        if (!value || typeof value !== "object" || !Array.isArray((value as EntraJwks).keys)) throw this.invalid("Entra JWKS is invalid.");
        const { createLocalJWKSet } = await import("jose");
        const keys = (value as EntraJwks).keys;
        return { resolver: createLocalJWKSet({ keys }), keys };
      }).catch((error) => { this.jwksPromise = null; throw error instanceof AuthDomainError ? error : this.invalid("Entra JWKS retrieval failed."); });
    }
    return this.jwksPromise;
  }
  private usableEmail(claims: Record<string, any>): string | undefined {
    // Entra has no standard email_verified claim. These signed, allowlisted-
    // tenant claims are metadata/collision inputs only; issuer + subject own
    // the identity.
    for (const candidate of [claims.email, claims.preferred_username, claims.upn]) {
      const parsed = entraEmail.safeParse(candidate);
      if (parsed.success) return parsed.data;
    }
    return undefined;
  }
  private invalid(message: string): AuthDomainError { return new AuthDomainError("FEDERATED_PROVIDER_RESPONSE_INVALID", message); }
}
