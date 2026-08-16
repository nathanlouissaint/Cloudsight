import type {
  FederatedAuthProvider,
  FederatedAuthorizationRequest,
  NormalizedFederatedIdentity,
} from "../../../types/auth/federated.types";

/** Startup-selected E2E provider; it replaces only the external IdP boundary. */
export class ControlledFederatedAuthProvider implements FederatedAuthProvider {
  readonly providerKind: "GOOGLE" | "MICROSOFT" | "GITHUB";
  readonly redirectUri: string;

  constructor(providerKind: "GOOGLE" | "MICROSOFT" | "GITHUB" = "GOOGLE") {
    this.providerKind = providerKind;
    const path = providerKind === "GOOGLE"
      ? "google"
      : providerKind === "MICROSOFT"
        ? "microsoft"
        : "github";
    this.redirectUri = `http://127.0.0.1:4100/auth/oauth/${path}/callback`;
  }

  getAuthorizationUrl(request: FederatedAuthorizationRequest): string {
    if (
      request.redirectUri !== this.redirectUri ||
      !request.state ||
      !/^[A-Za-z0-9_-]{43}$/.test(request.codeChallenge)
    ) {
      throw new Error("Controlled federated authorization request is invalid.");
    }

    const callback = new URL(this.redirectUri);
    callback.searchParams.set("state", request.state);
    callback.searchParams.set("code", "cloudsight-e2e-controlled-code");
    return callback.toString();
  }

  async exchangeAuthorizationCode(): Promise<NormalizedFederatedIdentity> {
    if (this.providerKind === "GITHUB") {
      return {
        providerKind: "GITHUB",
        issuer: "https://github.com",
        subject: "9001001",
        email: "cloudsight-e2e-controlled-github@example.test",
        emailVerified: true,
        displayName: "CloudSight E2E GitHub User",
      };
    }

    return {
      providerKind: this.providerKind,
      issuer: this.providerKind === "GOOGLE" ? "https://accounts.google.com" : "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
      subject: this.providerKind === "GOOGLE" ? "cloudsight-e2e-controlled-subject" : "cloudsight-e2e-controlled-microsoft-subject",
      email: this.providerKind === "GOOGLE" ? "cloudsight-e2e-federated@example.test" : "cloudsight-e2e-controlled-microsoft@example.test",
      emailVerified: true,
      displayName: "CloudSight E2E User",
    };
  }

  async verifyIdentity(): Promise<NormalizedFederatedIdentity> {
    return this.exchangeAuthorizationCode();
  }

  normalizeIdentity(value: unknown): NormalizedFederatedIdentity {
    return value as NormalizedFederatedIdentity;
  }
}
