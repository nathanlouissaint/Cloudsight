export type FederatedProviderKind =
  | "GOOGLE"
  | "MICROSOFT"
  | "GITHUB"
  | "OIDC"
  | "SAML";

export interface NormalizedFederatedIdentity {
  providerKind: FederatedProviderKind;
  issuer: string;
  subject: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  avatarUrl?: string;
}

export interface CreateAuthIdentityInput {
  userId: string;
  providerKind: FederatedProviderKind;
  issuer: string;
  providerSubject: string;
  providerEmail?: string;
  providerEmailVerified?: boolean;
}

export interface FederatedAuthorizationRequest {
  state: string;
  codeChallenge: string;
  redirectUri: string;
  nonce?: string;
}

export interface OAuthTransaction {
  state: string;
  providerKind: FederatedProviderKind;
  codeVerifier: string;
  nonce: string;
  browserBindingHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface OAuthTransactionCreationResult {
  state: string;
  codeChallenge: string;
  nonce: string;
  browserBindingSecret: string;
  expiresAt: Date;
}

export interface FederatedProviderConfig {
  providerKind: FederatedProviderKind;
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: readonly string[];
}

export interface FederatedAuthProvider {
  readonly providerKind: FederatedProviderKind;
  readonly redirectUri: string;
  getAuthorizationUrl(
    request: FederatedAuthorizationRequest,
  ): string;
  exchangeAuthorizationCode(
    authorizationCode: string,
    codeVerifier: string,
    expectedNonce?: string,
    redirectUri?: string,
  ): Promise<NormalizedFederatedIdentity>;
  verifyIdentity(
    idToken: string,
    expectedNonce?: string,
  ): Promise<NormalizedFederatedIdentity>;
  normalizeIdentity(
    providerIdentity: unknown,
  ): NormalizedFederatedIdentity;
}

export type FederatedIdentityResolution =
  | {
      kind: "EXISTING_IDENTITY";
      identityId: string;
      user: {
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        authProvider:
          | "LOCAL"
          | "GOOGLE"
          | "MICROSOFT"
          | "GITHUB";
        emailVerifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  | {
      kind: "UNRESOLVED_IDENTITY";
      issuer: string;
      subject: string;
    };

export type FederatedAccountPolicyResult =
  | {
      kind: "EXISTING_IDENTITY";
      identityId: string;
      userId: string;
    }
  | {
      kind: "EMAIL_COLLISION";
      matchedUserId: string;
    }
  | {
      kind: "NEW_FEDERATED_ACCOUNT";
    }
  | {
      kind: "EMAIL_UNUSABLE";
    }
  | {
      kind: "ACCOUNT_UNAVAILABLE";
    };
