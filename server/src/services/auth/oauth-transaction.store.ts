import type {
  FederatedProviderKind,
  OAuthTransaction,
} from "../../types/auth/federated.types";

export interface OAuthTransactionStore {
  put(transaction: OAuthTransaction): boolean;
  take(
    state: string,
    providerKind: FederatedProviderKind,
    now: Date,
  ): OAuthTransaction | null;
}

/**
 * Single-process transaction store for the initial OAuth implementation.
 * Replace with an atomic distributed store before running multiple instances.
 */
export class InMemoryOAuthTransactionStore
  implements OAuthTransactionStore
{
  private readonly transactions = new Map<
    string,
    OAuthTransaction
  >();

  constructor(
    private readonly maxTransactions = 1_000,
  ) {}

  put(transaction: OAuthTransaction): boolean {
    this.removeExpired(transaction.createdAt);

    if (
      this.transactions.size >=
      this.maxTransactions
    ) {
      return false;
    }

    this.transactions.set(
      transaction.state,
      transaction,
    );
    return true;
  }

  take(
    state: string,
    providerKind: FederatedProviderKind,
    now: Date,
  ): OAuthTransaction | null {
    this.removeExpired(now);

    const transaction =
      this.transactions.get(state);

    if (!transaction) {
      return null;
    }

    // Delete before returning so every path, including provider mismatch,
    // consumes the transaction and cannot be replayed.
    this.transactions.delete(state);

    if (
      transaction.providerKind !== providerKind ||
      transaction.expiresAt <= now
    ) {
      return null;
    }

    return transaction;
  }

  private removeExpired(now: Date): void {
    for (const [state, transaction] of this.transactions) {
      if (transaction.expiresAt <= now) {
        this.transactions.delete(state);
      }
    }
  }
}
