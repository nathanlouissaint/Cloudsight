import { afterEach, describe, expect, it, vi } from "vitest";

import { authIdentityRepository } from "../../src/repositories/auth/auth-identity.repository";
import { userRepository } from "../../src/repositories/auth/user.repository";
import { FederatedAuthService } from "../../src/services/auth/federated-auth.service";
import { federatedAccountRepository } from "../../src/repositories/auth/federated-account.repository";

const identityLookup = vi.spyOn(authIdentityRepository, "findByIssuerAndSubject");
const userLookup = vi.spyOn(userRepository, "findById");
const emailLookup = vi.spyOn(userRepository, "findIdByNormalizedEmail");
const service = new FederatedAuthService();
const createAccount = vi.spyOn(federatedAccountRepository, "createUserWithIdentity");

afterEach(() => {
  vi.clearAllMocks();
});

describe("FederatedAuthService ownership policy", () => {
  it("permits a validated GitHub identity through the shared account path", async () => {
    createAccount.mockResolvedValue({ user: { id: "user-gh" } as never, identity: { id: "identity-gh" } as never });

    await service.createFederatedAccount({
      providerKind: "GITHUB",
      issuer: "https://github.com",
      subject: "12345",
      email: "github@example.test",
      emailVerified: true,
    });

    expect(createAccount).toHaveBeenCalledWith({
      email: "github@example.test",
      providerKind: "GITHUB",
      issuer: "https://github.com",
      providerSubject: "12345",
      providerEmail: "github@example.test",
      providerEmailVerified: true,
    });
  });

  it("permits a validated Microsoft identity through the shared account-creation path", async () => {
    createAccount.mockResolvedValue({ user: { id: "user-ms" } as never, identity: { id: "identity-ms" } as never });

    await service.createFederatedAccount({
      providerKind: "MICROSOFT",
      issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
      subject: "immutable-ms-subject",
      email: "  ms@example.test ",
      emailVerified: true,
    });

    expect(createAccount).toHaveBeenCalledWith({
      email: "ms@example.test",
      providerKind: "MICROSOFT",
      issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
      providerSubject: "immutable-ms-subject",
      providerEmail: "ms@example.test",
      providerEmailVerified: true,
    });
  });

  it("fails closed for unsupported provider kinds", async () => {
    await expect(service.createFederatedAccount({
      providerKind: "OIDC",
      issuer: "https://github.example",
      subject: "subject",
      email: "new@example.test",
      emailVerified: true,
    })).rejects.toMatchObject({ code: "FEDERATED_PROVIDER_UNAVAILABLE" });
    expect(createAccount).not.toHaveBeenCalled();
  });

  it("does not treat a matching verified email as federated ownership", async () => {
    identityLookup.mockResolvedValue(null);
    emailLookup.mockResolvedValue({ id: "victim-user" });

    const result = await service.classifyIdentity({
      providerKind: "GOOGLE",
      issuer: "https://accounts.google.com",
      subject: "attacker-subject",
      email: "victim@example.test",
      emailVerified: true,
    });

    expect(result).toEqual({ kind: "EMAIL_COLLISION", matchedUserId: "victim-user" });
    expect(userLookup).not.toHaveBeenCalled();
  });

  it("keeps issuer and subject ownership when provider email changes", async () => {
    identityLookup.mockResolvedValue({ id: "identity-1", userId: "user-1" } as never);
    userLookup.mockResolvedValue({
      id: "user-1",
      email: "original@example.test",
      name: null,
      avatarUrl: null,
      authProvider: "LOCAL",
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.classifyIdentity({
      providerKind: "GOOGLE",
      issuer: "https://accounts.google.com",
      subject: "immutable-subject",
      email: "changed@example.test",
      emailVerified: true,
    });

    expect(result).toEqual({ kind: "EXISTING_IDENTITY", identityId: "identity-1", userId: "user-1" });
    expect(emailLookup).not.toHaveBeenCalled();
  });

  it("resolves an existing Microsoft identity by issuer and subject, not email", async () => {
    identityLookup.mockResolvedValue({ id: "identity-ms", userId: "user-ms" } as never);
    userLookup.mockResolvedValue({ id: "user-ms", email: "actual@example.test", name: null, avatarUrl: null, authProvider: "MICROSOFT", emailVerifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });

    await expect(service.classifyIdentity({
      providerKind: "MICROSOFT",
      issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
      subject: "immutable-ms",
      email: "different@example.test",
      emailVerified: true,
    })).resolves.toEqual({ kind: "EXISTING_IDENTITY", identityId: "identity-ms", userId: "user-ms" });
    expect(emailLookup).not.toHaveBeenCalled();
  });

  it("classifies a Microsoft same-email collision without linking", async () => {
    identityLookup.mockResolvedValue(null);
    emailLookup.mockResolvedValue({ id: "existing-user" });

    await expect(service.classifyIdentity({
      providerKind: "MICROSOFT",
      issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
      subject: "different-ms-subject",
      email: "existing@example.test",
      emailVerified: true,
    })).resolves.toEqual({ kind: "EMAIL_COLLISION", matchedUserId: "existing-user" });
  });

  it("classifies a GitHub same-email collision without linking", async () => {
    identityLookup.mockResolvedValue(null);
    emailLookup.mockResolvedValue({ id: "existing-user" });

    await expect(service.classifyIdentity({
      providerKind: "GITHUB",
      issuer: "https://github.com",
      subject: "different-github-subject",
      email: "existing@example.test",
      emailVerified: true,
    })).resolves.toEqual({ kind: "EMAIL_COLLISION", matchedUserId: "existing-user" });
  });

  it.each([
    ["missing email", undefined, undefined],
    ["unverified email", "user@example.test", false],
    ["invalid email", "not-an-email", true],
  ])("classifies %s as unusable", async (_label, email, emailVerified) => {
    identityLookup.mockResolvedValue(null);

    const result = await service.classifyIdentity({
      providerKind: "GOOGLE",
      issuer: "https://accounts.google.com",
      subject: "new-subject",
      ...(email === undefined ? {} : { email }),
      ...(emailVerified === undefined ? {} : { emailVerified }),
    });

    expect(result).toEqual({ kind: "EMAIL_UNUSABLE" });
    expect(emailLookup).not.toHaveBeenCalled();
  });

  it("classifies a verified unused normalized email as a new account", async () => {
    identityLookup.mockResolvedValue(null);
    emailLookup.mockResolvedValue(null);

    const result = await service.classifyIdentity({
      providerKind: "GOOGLE",
      issuer: "https://accounts.google.com",
      subject: "new-subject",
      email: "  new@example.test ",
      emailVerified: true,
    });

    expect(result).toEqual({ kind: "NEW_FEDERATED_ACCOUNT" });
    expect(emailLookup).toHaveBeenCalledWith("new@example.test");
  });

  it("blocks an identity whose linked user is unavailable", async () => {
    identityLookup.mockResolvedValue({ id: "identity-1", userId: "missing-user" } as never);
    userLookup.mockResolvedValue(null);

    const result = await service.classifyIdentity({
      providerKind: "GOOGLE",
      issuer: "https://accounts.google.com",
      subject: "owned-subject",
      email: "new@example.test",
      emailVerified: true,
    });

    expect(result).toEqual({ kind: "ACCOUNT_UNAVAILABLE" });
    expect(emailLookup).not.toHaveBeenCalled();
  });
});
