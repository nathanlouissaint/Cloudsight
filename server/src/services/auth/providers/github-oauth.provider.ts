import { z } from "zod";

import type { GitHubProviderConfig } from "../../../config/federated-auth.config";
import { AuthDomainError } from "../../../errors/auth.errors";
import type {
  FederatedAuthProvider,
  FederatedAuthorizationRequest,
  NormalizedFederatedIdentity,
} from "../../../types/auth/federated.types";

const GITHUB_AUTHORIZE_ENDPOINT = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";
const GITHUB_USER_ENDPOINT = "https://api.github.com/user";
const GITHUB_EMAILS_ENDPOINT = "https://api.github.com/user/emails";
const REQUEST_TIMEOUT_MS = 10_000;
const githubEmail = z.string().trim().email();

type Fetcher = typeof fetch;

interface GitHubUserResponse {
  id: number;
  login?: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
}

export class GitHubOAuthProvider implements FederatedAuthProvider {
  readonly providerKind = "GITHUB" as const;
  readonly redirectUri: string;

  constructor(
    private readonly config: GitHubProviderConfig,
    private readonly fetcher: Fetcher = fetch,
  ) {
    this.redirectUri = config.redirectUri;
  }

  getAuthorizationUrl(request: FederatedAuthorizationRequest): string {
    if (request.redirectUri !== this.redirectUri || !request.state || !request.codeChallenge) {
      throw this.invalid();
    }

    const url = new URL(GITHUB_AUTHORIZE_ENDPOINT);
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("scope", "user:email");
    url.searchParams.set("state", request.state);
    url.searchParams.set("code_challenge", request.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    return url.toString();
  }

  async exchangeAuthorizationCode(
    authorizationCode: string,
    codeVerifier: string,
    _expectedNonce?: string,
    redirectUri = this.redirectUri,
  ): Promise<NormalizedFederatedIdentity> {
    if (!authorizationCode || !codeVerifier || redirectUri !== this.redirectUri) {
      throw this.invalid();
    }

    const tokenResponse = await this.request(GITHUB_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authorizationCode,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) throw this.invalid();
    const tokenBody = await this.json(tokenResponse);
    const accessToken = this.readAccessToken(tokenBody);

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
    };
    const userResponse = await this.request(GITHUB_USER_ENDPOINT, { headers });
    if (!userResponse.ok) throw this.invalid();
    const user = this.readUser(await this.json(userResponse));

    const emailsResponse = await this.request(GITHUB_EMAILS_ENDPOINT, { headers });
    if (!emailsResponse.ok) throw this.invalid();
    const email = this.selectPrimaryEmail(await this.json(emailsResponse));

    return {
      providerKind: "GITHUB",
      issuer: "https://github.com",
      subject: String(user.id),
      email,
      emailVerified: true,
      ...(user.name ? { displayName: user.name } : {}),
      ...(user.avatar_url ? { avatarUrl: user.avatar_url } : {}),
    };
  }

  async verifyIdentity(): Promise<NormalizedFederatedIdentity> {
    throw this.invalid();
  }

  normalizeIdentity(value: unknown): NormalizedFederatedIdentity {
    if (!value || typeof value !== "object") throw this.invalid();
    const candidate = value as Record<string, unknown>;
    const subject = typeof candidate.subject === "string" ? candidate.subject : "";
    const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
    if (
      candidate.providerKind !== "GITHUB" ||
      candidate.issuer !== "https://github.com" ||
      !/^\d+$/.test(subject) ||
      !githubEmail.safeParse(email).success ||
      candidate.emailVerified !== true
    ) {
      throw this.invalid();
    }
    return {
      providerKind: "GITHUB",
      issuer: "https://github.com",
      subject,
      email,
      emailVerified: true,
      ...(typeof candidate.displayName === "string" ? { displayName: candidate.displayName } : {}),
      ...(typeof candidate.avatarUrl === "string" ? { avatarUrl: candidate.avatarUrl } : {}),
    };
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.fetcher(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch {
      throw this.invalid();
    }
  }

  private async json(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw this.invalid();
    }
  }

  private readAccessToken(value: unknown): string {
    if (!value || typeof value !== "object") throw this.invalid();
    const token = (value as Record<string, unknown>).access_token;
    if (typeof token !== "string" || token.length === 0) throw this.invalid();
    return token;
  }

  private readUser(value: unknown): GitHubUserResponse {
    if (!value || typeof value !== "object") throw this.invalid();
    const user = value as Record<string, unknown>;
    if (typeof user.id !== "number" || !Number.isSafeInteger(user.id) || user.id <= 0) {
      throw this.invalid();
    }
    if (user.login !== undefined && typeof user.login !== "string") throw this.invalid();
    if (user.name !== undefined && user.name !== null && typeof user.name !== "string") throw this.invalid();
    if (user.avatar_url !== undefined && user.avatar_url !== null && typeof user.avatar_url !== "string") throw this.invalid();
    return user as unknown as GitHubUserResponse;
  }

  private selectPrimaryEmail(value: unknown): string {
    if (!Array.isArray(value)) throw this.invalid();
    const records: GitHubEmailResponse[] = [];
    for (const item of value) {
      if (!item || typeof item !== "object") throw this.invalid();
      const record = item as Record<string, unknown>;
      if (
        typeof record.email !== "string" ||
        typeof record.primary !== "boolean" ||
        typeof record.verified !== "boolean" ||
        !githubEmail.safeParse(record.email.trim()).success
      ) {
        throw this.invalid();
      }
      records.push({
        email: record.email.trim().toLowerCase(),
        primary: record.primary,
        verified: record.verified,
      });
    }
    const primary = records.filter((record) => record.primary && record.verified);
    if (primary.length !== 1) throw this.invalid();
    return primary[0].email;
  }

  private invalid(): AuthDomainError {
    return new AuthDomainError(
      "FEDERATED_PROVIDER_RESPONSE_INVALID",
      "GitHub authorization response is invalid.",
    );
  }
}

export {
  GITHUB_AUTHORIZE_ENDPOINT,
  GITHUB_TOKEN_ENDPOINT,
  GITHUB_USER_ENDPOINT,
  GITHUB_EMAILS_ENDPOINT,
};
