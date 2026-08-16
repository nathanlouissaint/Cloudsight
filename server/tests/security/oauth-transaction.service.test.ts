import crypto from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  OAuthTransactionService,
  deriveCodeChallenge,
} from "../../src/services/auth/oauth-transaction.service";
import { InMemoryOAuthTransactionStore } from "../../src/services/auth/oauth-transaction.store";

describe("OAuthTransactionService security", () => {
  it("creates independent state, verifier, nonce, and browser binding material", () => {
    const service = new OAuthTransactionService(new InMemoryOAuthTransactionStore());
    const first = service.create("GOOGLE");
    const second = service.create("GOOGLE");

    expect(first.state).not.toBe(second.state);
    expect(first.nonce).not.toBe(second.nonce);
    expect(first.browserBindingSecret).not.toBe(second.browserBindingSecret);
    expect(first.state.length).toBeGreaterThanOrEqual(43);
    expect(first.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(first.codeChallenge).not.toContain("=");
  });

  it("derives the S256 base64url challenge from the server-side verifier", () => {
    const verifier = "verifier-for-security-test";
    const expected = crypto.createHash("sha256").update(verifier).digest("base64url");

    expect(deriveCodeChallenge(verifier)).toBe(expected);
  });

  it("consumes valid transactions once and rejects replay or wrong binding", () => {
    const service = new OAuthTransactionService(new InMemoryOAuthTransactionStore());
    const created = service.create("GOOGLE");

    expect(service.consume(created.state, "GOOGLE", created.browserBindingSecret)).toMatchObject({
      providerKind: "GOOGLE",
      nonce: created.nonce,
    });
    expect(() => service.consume(created.state, "GOOGLE", created.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );

    const wrongBinding = service.create("GOOGLE");
    expect(() => service.consume(wrongBinding.state, "GOOGLE", "wrong-binding")).toThrowError(
      "OAuth transaction is invalid.",
    );
    expect(() => service.consume(wrongBinding.state, "GOOGLE", wrongBinding.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );
  });

  it("rejects expired transactions", () => {
    let now = new Date("2026-01-01T00:00:00.000Z");
    const service = new OAuthTransactionService(
      new InMemoryOAuthTransactionStore(),
      () => now,
    );
    const created = service.create("GOOGLE");
    now = new Date(created.expiresAt.getTime() + 1);

    expect(() => service.consume(created.state, "GOOGLE", created.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );
  });

  it("consumes provider-mismatched GitHub and Google transactions without allowing replay", () => {
    const service = new OAuthTransactionService(new InMemoryOAuthTransactionStore());
    const github = service.create("GITHUB");
    expect(() => service.consume(github.state, "GOOGLE", github.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );
    expect(() => service.consume(github.state, "GITHUB", github.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );

    const google = service.create("GOOGLE");
    expect(() => service.consume(google.state, "GITHUB", google.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );
    expect(() => service.consume(google.state, "GOOGLE", google.browserBindingSecret)).toThrowError(
      "OAuth transaction is invalid.",
    );
  });
});
