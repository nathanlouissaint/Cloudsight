import {
  CodeChallengeMethod,
  OAuth2Client,
} from "google-auth-library";

import {
  AuthDomainError,
} from "../../../errors/auth.errors";
import type {
  GoogleProviderConfig,
} from "../../../config/federated-auth.config";
import type {
  FederatedAuthProvider,
  FederatedAuthorizationRequest,
  NormalizedFederatedIdentity,
} from "../../../types/auth/federated.types";

const GOOGLE_ISSUERS = new Set([
  "https://accounts.google.com",
  "accounts.google.com",
]);

const CANONICAL_GOOGLE_ISSUER =
  "https://accounts.google.com";

interface VerifiedGoogleIdentity {
  verified: true;
  iss: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nonce?: string;
}

export class GoogleFederatedAuthProvider
  implements FederatedAuthProvider
{
  readonly providerKind = "GOOGLE" as const;
  readonly redirectUri: string;

  private readonly client: OAuth2Client;

  constructor(
    private readonly config: GoogleProviderConfig,
  ) {
    this.redirectUri = config.redirectUri;
    this.client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );
  }

  getAuthorizationUrl(
    request: FederatedAuthorizationRequest,
  ): string {
    if (
      request.redirectUri !==
      this.config.redirectUri
    ) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google redirect configuration is invalid.",
      );
    }

    const url = this.client.generateAuthUrl({
      access_type: "online",
      scope: [...this.config.scopes],
      state: request.state,
      code_challenge: request.codeChallenge,
      code_challenge_method:
        CodeChallengeMethod.S256,
      redirect_uri: request.redirectUri,
      prompt: "select_account",
    });

    if (request.nonce === undefined) {
      return url;
    }

    const authorizationUrl =
      new URL(url);
    authorizationUrl.searchParams.set(
      "nonce",
      request.nonce,
    );
    return authorizationUrl.toString();
  }

  async exchangeAuthorizationCode(
    authorizationCode: string,
    codeVerifier: string,
    expectedNonce?: string,
    redirectUri = this.config.redirectUri,
  ): Promise<NormalizedFederatedIdentity> {
    if (
      redirectUri !== this.config.redirectUri
    ) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google redirect configuration is invalid.",
      );
    }

    if (
      !authorizationCode ||
      !codeVerifier
    ) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google authorization response is invalid.",
      );
    }

    try {
      const tokenResponse =
        await this.client.getToken({
          code: authorizationCode,
          codeVerifier,
          redirect_uri: redirectUri,
        });
      const idToken = tokenResponse.tokens.id_token;

      if (typeof idToken !== "string") {
        throw new Error(
          "Google ID token was not returned",
        );
      }

      return this.verifyIdentity(
        idToken,
        expectedNonce,
      );
    } catch (error) {
      if (error instanceof AuthDomainError) {
        throw error;
      }

      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google authorization response is invalid.",
      );
    }
  }

  async verifyIdentity(
    idToken: string,
    expectedNonce?: string,
  ): Promise<NormalizedFederatedIdentity> {
    if (!idToken) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google identity response is invalid.",
      );
    }

    try {
      const ticket =
        await this.client.verifyIdToken({
          idToken,
          audience: this.config.clientId,
        });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("Google identity claims missing");
      }

      const identity: VerifiedGoogleIdentity = {
        verified: true,
        iss: payload.iss,
        sub: payload.sub,
        email: payload.email,
        email_verified:
          payload.email_verified,
        name: payload.name,
        picture: payload.picture,
        nonce: payload.nonce,
      };

      if (
        !GOOGLE_ISSUERS.has(identity.iss) ||
        !identity.sub
      ) {
        throw new Error(
          "Google identity claims invalid",
        );
      }

      if (
        expectedNonce !== undefined &&
        identity.nonce !== expectedNonce
      ) {
        throw new Error("Google nonce mismatch");
      }

      return this.normalizeIdentity(
        identity,
      );
    } catch (error) {
      if (error instanceof AuthDomainError) {
        throw error;
      }

      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google identity response is invalid.",
      );
    }
  }

  normalizeIdentity(
    providerIdentity: unknown,
  ): NormalizedFederatedIdentity {
    if (!isVerifiedGoogleIdentity(providerIdentity)) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google identity response is invalid.",
      );
    }

    const identity = providerIdentity;

    if (
      typeof identity.iss !== "string" ||
      !GOOGLE_ISSUERS.has(identity.iss) ||
      typeof identity.sub !== "string" ||
      identity.sub.length === 0
    ) {
      throw new AuthDomainError(
        "FEDERATED_PROVIDER_RESPONSE_INVALID",
        "Google identity response is invalid.",
      );
    }

    return {
      providerKind: "GOOGLE",
      issuer: CANONICAL_GOOGLE_ISSUER,
      subject: identity.sub,
      ...(typeof identity.email === "string"
        ? { email: identity.email }
        : {}),
      ...(typeof identity.email_verified ===
      "boolean"
        ? {
            emailVerified:
              identity.email_verified,
          }
        : {}),
      ...(typeof identity.name === "string"
        ? { displayName: identity.name }
        : {}),
      ...(typeof identity.picture === "string"
        ? { avatarUrl: identity.picture }
        : {}),
    };
  }
}

function isVerifiedGoogleIdentity(
  value: unknown,
): value is VerifiedGoogleIdentity {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Record<string, unknown>;

  return (
    candidate.verified === true &&
    typeof candidate.iss === "string" &&
    typeof candidate.sub === "string"
  );
}
