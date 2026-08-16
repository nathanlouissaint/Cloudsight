import { describe, expect, it } from "vitest";

import { mapAuthDomainError } from "../../src/errors/auth-error-mapper";
import { AuthDomainError } from "../../src/errors/auth.errors";

describe("authentication error mapping", () => {
  it("does not mislabel non-Google federated accounts during password login", () => {
    const response = mapAuthDomainError(
      new AuthDomainError(
        "PASSWORD_LOGIN_UNAVAILABLE",
        "internal",
      ),
    );

    expect(response).toEqual({
      status: 400,
      message:
        "Password sign-in is not available for this account",
    });
    expect(response.message).not.toContain("Google");
  });
});
