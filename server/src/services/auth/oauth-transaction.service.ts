import crypto from "crypto";

import {
  AuthDomainError,
} from "../../errors/auth.errors";
import type {
  FederatedProviderKind,
  OAuthTransaction,
  OAuthTransactionCreationResult,
} from "../../types/auth/federated.types";
import {
  InMemoryOAuthTransactionStore,
  type OAuthTransactionStore,
} from "./oauth-transaction.store";

const OAUTH_TRANSACTION_TTL_MS =
  10 * 60 * 1000;
const RANDOM_BYTES = 32;

function base64UrlRandom(): string {
  return crypto
    .randomBytes(RANDOM_BYTES)
    .toString("base64url");
}

function deriveCodeChallenge(
  codeVerifier: string,
): string {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
}

function hashBrowserBinding(
  secret: string,
): string {
  return crypto
    .createHash("sha256")
    .update(secret)
    .digest("hex");
}

export class OAuthTransactionService {
  constructor(
    private readonly store: OAuthTransactionStore =
      new InMemoryOAuthTransactionStore(),
    private readonly now: () => Date = () =>
      new Date(),
  ) {}

  create(
    providerKind: FederatedProviderKind,
  ): OAuthTransactionCreationResult {
    const createdAt = this.now();
    const expiresAt = new Date(
      createdAt.getTime() +
        OAUTH_TRANSACTION_TTL_MS,
    );
    const state = base64UrlRandom();
    const codeVerifier = base64UrlRandom();
    const nonce = base64UrlRandom();
    const browserBindingSecret =
      base64UrlRandom();

    const stored = this.store.put({
      state,
      providerKind,
      codeVerifier,
      nonce,
      browserBindingHash:
        hashBrowserBinding(
          browserBindingSecret,
        ),
      createdAt,
      expiresAt,
    });

    if (!stored) {
      throw new AuthDomainError(
        "FEDERATED_OAUTH_UNAVAILABLE",
        "Federated authentication is temporarily unavailable.",
      );
    }

    return {
      state,
      codeChallenge:
        deriveCodeChallenge(codeVerifier),
      nonce,
      browserBindingSecret,
      expiresAt,
    };
  }

  consume(
    state: string,
    providerKind: FederatedProviderKind,
    browserBindingSecret: string,
  ): OAuthTransaction {
    const transaction = this.store.take(
      state,
      providerKind,
      this.now(),
    );

    if (
      !transaction ||
      !browserBindingMatches(
        transaction.browserBindingHash,
        browserBindingSecret,
      )
    ) {
      throw new AuthDomainError(
        "OAUTH_TRANSACTION_INVALID",
        "OAuth transaction is invalid.",
      );
    }

    return transaction;
  }
}

export const oauthTransactionService =
  new OAuthTransactionService();

export const OAUTH_TRANSACTION_TTL_MS_VALUE =
  OAUTH_TRANSACTION_TTL_MS;

export { deriveCodeChallenge };
export { hashBrowserBinding };

function browserBindingMatches(
  expectedHash: string,
  secret: string,
): boolean {
  const actualHash = hashBrowserBinding(secret);
  const expected = Buffer.from(
    expectedHash,
    "utf8",
  );
  const actual = Buffer.from(
    actualHash,
    "utf8",
  );

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}
