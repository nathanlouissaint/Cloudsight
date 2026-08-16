import type {
  FederatedAuthProvider,
  FederatedProviderKind,
} from "../../types/auth/federated.types";
import {
  GOOGLE_PROVIDER_CONFIG,
  ENTRA_PROVIDER_CONFIG,
  GITHUB_PROVIDER_CONFIG,
} from "../../config/federated-auth.config";
import {
  GoogleFederatedAuthProvider,
} from "./providers/google-federated-auth.provider";
import { ControlledFederatedAuthProvider } from "./providers/controlled-federated-auth.provider";
import { EntraOidcProvider } from "./providers/entra-oidc.provider";
import { GitHubOAuthProvider } from "./providers/github-oauth.provider";

const providers = new Map<
  FederatedProviderKind,
  FederatedAuthProvider
>();
const testOverrides = new Map<
  FederatedProviderKind,
  FederatedAuthProvider
>();

if (GOOGLE_PROVIDER_CONFIG) {
  providers.set(
    "GOOGLE",
    new GoogleFederatedAuthProvider(
      GOOGLE_PROVIDER_CONFIG,
    ),
  );
}

if (ENTRA_PROVIDER_CONFIG) {
  providers.set("MICROSOFT", new EntraOidcProvider(ENTRA_PROVIDER_CONFIG));
}

if (GITHUB_PROVIDER_CONFIG) {
  providers.set("GITHUB", new GitHubOAuthProvider(GITHUB_PROVIDER_CONFIG));
}

export function isControlledFederatedProviderEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.NODE_ENV === "test" && env.CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER === "1";
}

if (isControlledFederatedProviderEnabled()) {
  providers.set("GOOGLE", new ControlledFederatedAuthProvider());
  providers.set("MICROSOFT", new ControlledFederatedAuthProvider("MICROSOFT"));
  providers.set("GITHUB", new ControlledFederatedAuthProvider("GITHUB"));
}

export function getFederatedProvider(
  providerKind: FederatedProviderKind,
): FederatedAuthProvider | null {
  return testOverrides.get(providerKind) ?? providers.get(providerKind) ?? null;
}

/** Test-only substitution for the external provider boundary. */
export function setFederatedProviderForTests(
  providerKind: FederatedProviderKind,
  provider: FederatedAuthProvider,
): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Federated provider overrides are test-only.");
  }
  testOverrides.set(providerKind, provider);
}

export function resetFederatedProviderTestOverrides(): void {
  testOverrides.clear();
}
