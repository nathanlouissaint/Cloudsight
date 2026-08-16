import bcrypt from "bcrypt";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createPrismaTestClient } from "./helpers/prisma-test-client";

const PREFIX = "c2-auth-";
let prisma: PrismaClient;
let sessionService: any;
let authIdentityRepository: any;
let passwordResetService: any;
let emailVerificationService: any;
let federatedAccountRepository: any;
let auditService: any;

async function cleanup() {
  await prisma.securityAudit.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
  await prisma.authIdentity.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
  await prisma.session.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
  await prisma.passwordResetToken.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
  await prisma.emailVerificationToken.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: PREFIX } } });
}

async function user(email: string) {
  return prisma.user.create({
    data: { email: `${PREFIX}${email}`, passwordHash: await bcrypt.hash("C2_RAW_PASSWORD_SENTINEL", 10) },
  });
}

const integrationDescribe = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integrationDescribe("real PostgreSQL authentication persistence", () => {
  beforeAll(async () => {
    prisma = createPrismaTestClient();
    await prisma.$connect();
    const identity = await prisma.$queryRaw<Array<{ database: string; role: string }>>`SELECT current_database() AS database, current_user AS role`;
    expect(identity[0]).toEqual({ database: "cloudsight_test", role: "cloudsight_test_user" });
    ({ sessionService } = await import("../../src/services/auth/session.service"));
    ({ authIdentityRepository } = await import("../../src/repositories/auth/auth-identity.repository"));
    ({ passwordResetService } = await import("../../src/services/auth/password-reset.service"));
    ({ emailVerificationService } = await import("../../src/services/auth/email-verification.service"));
    ({ federatedAccountRepository } = await import("../../src/repositories/auth/federated-account.repository"));
    ({ auditService } = await import("../../src/services/auth/audit.service"));
  });

  beforeEach(cleanup);
  afterAll(async () => {
    await cleanup();
    expect(await prisma.user.count({ where: { email: { startsWith: PREFIX } } })).toBe(0);
    await prisma.$disconnect();
  });

  it("persists users and enforces unique email", async () => {
    const first = await user("email@example.test");
    await expect(prisma.user.create({ data: { email: first.email, passwordHash: "other" } })).rejects.toMatchObject({ code: "P2002" });
    expect(await prisma.user.count({ where: { email: first.email } })).toBe(1);
    expect((await prisma.user.findUnique({ where: { id: first.id } }))?.passwordHash).not.toBe("C2_RAW_PASSWORD_SENTINEL");
  });

  it("persists sessions with hashed refresh tokens and unique hashes", async () => {
    const first = await user("session@example.test");
    const raw = "C2_RAW_REFRESH_TOKEN_SENTINEL";
    const session = await sessionService.createSession({ userId: first.id, expiresAt: new Date(Date.now() + 3600000) }, raw);
    const stored = await prisma.session.findUnique({ where: { id: session.id } });
    expect(stored?.userId).toBe(first.id);
    expect(stored?.refreshTokenHash).toBe(sessionService.hashRefreshToken(raw));
    expect(stored?.refreshTokenHash).not.toBe(raw);
    await expect(prisma.session.create({ data: { userId: first.id, refreshTokenHash: stored!.refreshTokenHash, expiresAt: new Date(Date.now() + 3600000) } })).rejects.toMatchObject({ code: "P2002" });
  });

  it("isolates session ownership and persists revocation across clients", async () => {
    const a = await user("a@example.test");
    const b = await user("b@example.test");
    const a1 = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, "C2_A1");
    const a2 = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, "C2_A2");
    const b1 = await sessionService.createSession({ userId: b.id, expiresAt: new Date(Date.now() + 3600000) }, "C2_B1");
    await sessionService.revokeOwnedSession(a.id, a1.id);
    expect((await prisma.session.findUnique({ where: { id: a1.id } }))?.revokedAt).not.toBeNull();
    expect((await prisma.session.findUnique({ where: { id: a2.id } }))?.revokedAt).toBeNull();
    expect((await prisma.session.findUnique({ where: { id: b1.id } }))?.revokedAt).toBeNull();
    const fresh = createPrismaTestClient();
    expect((await fresh.session.findUnique({ where: { id: a1.id } }))?.revokedAt).not.toBeNull();
    await fresh.$disconnect();
  });

  it("persists immutable federated identity ownership and enforces composite uniqueness", async () => {
    const a = await user("identity@example.test");
    await authIdentityRepository.create({ userId: a.id, providerKind: "GOOGLE", issuer: "https://accounts.google.com", providerSubject: "subject-a" });
    await expect(authIdentityRepository.create({ userId: a.id, providerKind: "GOOGLE", issuer: "https://accounts.google.com", providerSubject: "subject-a" })).rejects.toMatchObject({ code: "P2002" });
    expect(await prisma.authIdentity.count({ where: { issuer: "https://accounts.google.com", providerSubject: "subject-a" } })).toBe(1);
    await authIdentityRepository.create({ userId: a.id, providerKind: "GOOGLE", issuer: "https://accounts.google.com", providerSubject: "subject-b" });
    expect(await prisma.authIdentity.count({ where: { userId: a.id } })).toBe(2);
  });

  it("persists reset and verification token hashes, not raw tokens", async () => {
    const a = await user("tokens@example.test");
    const resetRaw = "C2_RAW_RESET_TOKEN_SENTINEL";
    const verifyRaw = "C2_RAW_VERIFICATION_TOKEN_SENTINEL";
    await prisma.passwordResetToken.create({ data: { userId: a.id, tokenHash: passwordResetService.hashToken(resetRaw), expiresAt: new Date(Date.now() + 3600000) } });
    await prisma.emailVerificationToken.create({ data: { userId: a.id, tokenHash: emailVerificationService.hashToken(verifyRaw), expiresAt: new Date(Date.now() + 3600000) } });
    const rows = await prisma.passwordResetToken.findMany({ where: { userId: a.id } });
    const verification = await prisma.emailVerificationToken.findMany({ where: { userId: a.id } });
    expect(rows[0].tokenHash).not.toBe(resetRaw);
    expect(verification[0].tokenHash).not.toBe(verifyRaw);
    await expect(prisma.passwordResetToken.create({ data: { userId: a.id, tokenHash: rows[0].tokenHash, expiresAt: new Date(Date.now() + 3600000) } })).rejects.toMatchObject({ code: "P2002" });
    await expect(prisma.emailVerificationToken.create({ data: { userId: a.id, tokenHash: verification[0].tokenHash, expiresAt: new Date(Date.now() + 3600000) } })).rejects.toMatchObject({ code: "P2002" });
  });

  it("treats expired persisted reset and verification tokens as invalid", async () => {
    const a = await user("expired@example.test");
    const resetRaw = "C2_EXPIRED_RESET_TOKEN";
    const verifyRaw = "C2_EXPIRED_VERIFICATION_TOKEN";
    await prisma.passwordResetToken.create({ data: { userId: a.id, tokenHash: passwordResetService.hashToken(resetRaw), expiresAt: new Date(Date.now() - 1000) } });
    await prisma.emailVerificationToken.create({ data: { userId: a.id, tokenHash: emailVerificationService.hashToken(verifyRaw), expiresAt: new Date(Date.now() - 1000) } });
    await expect(passwordResetService.validateToken(resetRaw)).rejects.toMatchObject({ code: "RESET_TOKEN_EXPIRED" });
    await expect(emailVerificationService.validateToken(verifyRaw)).rejects.toMatchObject({ code: "VERIFICATION_TOKEN_EXPIRED" });
  });

  it("enforces foreign keys and cascades auth records with their user", async () => {
    await expect(prisma.session.create({ data: { userId: "missing-user", refreshTokenHash: "missing-hash", expiresAt: new Date(Date.now() + 3600000) } })).rejects.toMatchObject({ code: "P2003" });
    const a = await user("cascade@example.test");
    await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, "C2_CASCADE");
    await prisma.authIdentity.create({ data: { userId: a.id, providerKind: "GOOGLE", issuer: "issuer-cascade", providerSubject: "subject-cascade" } });
    await prisma.user.delete({ where: { id: a.id } });
    expect(await prisma.session.count({ where: { userId: a.id } })).toBe(0);
    expect(await prisma.authIdentity.count({ where: { userId: a.id } })).toBe(0);
  });

  it("proves the real Prisma transaction rolls back all writes", async () => {
    await expect(prisma.$transaction(async (tx) => {
      await tx.user.create({ data: { email: `${PREFIX}rollback@example.test`, passwordHash: "rollback" } });
      await tx.user.create({ data: { email: `${PREFIX}rollback-second@example.test`, passwordHash: "rollback" } });
      throw new Error("C2 transaction rollback sentinel");
    })).rejects.toThrow("C2 transaction rollback sentinel");
    const fresh = createPrismaTestClient();
    expect(await fresh.user.count({ where: { email: { startsWith: `${PREFIX}rollback` } } })).toBe(0);
    await fresh.$disconnect();
  });

  it("rolls back the federated user when the later identity write fails", async () => {
    const existing = await user("federated-existing@example.test");
    await prisma.authIdentity.create({ data: { userId: existing.id, providerKind: "GOOGLE", issuer: "issuer-rollback", providerSubject: "subject-rollback" } });
    await expect(federatedAccountRepository.createUserWithIdentity({
      email: `${PREFIX}federated-rollback@example.test`,
      providerKind: "GOOGLE",
      issuer: "issuer-rollback",
      providerSubject: "subject-rollback",
      providerEmail: `${PREFIX}federated-rollback@example.test`,
      providerEmailVerified: true,
    })).rejects.toMatchObject({ code: "P2002" });
    const fresh = createPrismaTestClient();
    expect(await fresh.user.findUnique({ where: { email: `${PREFIX}federated-rollback@example.test` } })).toBeNull();
    expect(await fresh.authIdentity.count({ where: { issuer: "issuer-rollback", providerSubject: "subject-rollback" } })).toBe(1);
    await fresh.$disconnect();
  });

  it("persists accurate provider metadata for every supported account type", async () => {
    const providers = [
      {
        kind: "GOOGLE" as const,
        issuer: "https://accounts.google.com",
        subject: "metadata-google",
      },
      {
        kind: "MICROSOFT" as const,
        issuer:
          "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",
        subject: "metadata-microsoft",
      },
      {
        kind: "GITHUB" as const,
        issuer: "https://github.com",
        subject: "30001",
      },
    ];

    for (const provider of providers) {
      const email = `${PREFIX}metadata-${provider.kind.toLowerCase()}@example.test`;
      const created =
        await federatedAccountRepository.createUserWithIdentity({
          email,
          providerKind: provider.kind,
          issuer: provider.issuer,
          providerSubject: provider.subject,
          providerEmail: email,
          providerEmailVerified: true,
        });

      expect(created.user.authProvider).toBe(
        provider.kind,
      );
      expect(
        (
          await prisma.user.findUnique({
            where: { id: created.user.id },
          })
        )?.authProvider,
      ).toBe(provider.kind);
    }

    expect(
      (await user("metadata-local@example.test"))
        .authProvider,
    ).toBe("LOCAL");
  });

  it("proves sequential A to B to C rotation against persisted PostgreSQL state", async () => {
    const a = await user("rotation@example.test");
    const tokenA = "C4_TOKEN_A";
    const initial = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, tokenA);
    expect(await prisma.session.count({ where: { userId: a.id } })).toBe(1);

    const first = await sessionService.refreshSession(tokenA);
    const tokenB = first.refreshToken;
    expect(tokenB).not.toBe(tokenA);
    expect(first.session.userId).toBe(a.id);

    const afterA = await prisma.session.findUnique({ where: { id: initial.id } });
    expect(afterA?.refreshTokenHash).toBe(sessionService.hashRefreshToken(tokenB));
    expect(afterA?.refreshTokenHash).not.toBe(sessionService.hashRefreshToken(tokenA));
    expect(afterA?.userId).toBe(a.id);

    await expect(sessionService.refreshSession(tokenA)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
    const afterStaleA = await prisma.session.findUnique({ where: { id: initial.id } });
    expect(afterStaleA?.refreshTokenHash).toBe(sessionService.hashRefreshToken(tokenB));
    expect(await prisma.session.count({ where: { userId: a.id } })).toBe(1);

    const second = await sessionService.refreshSession(tokenB);
    const tokenC = second.refreshToken;
    expect(tokenC).not.toBe(tokenB);
    expect(tokenC).not.toBe(tokenA);
    expect((await prisma.session.findUnique({ where: { id: initial.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(tokenC));

    await expect(sessionService.refreshSession(tokenA)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
    await expect(sessionService.refreshSession(tokenB)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });

    const fresh = createPrismaTestClient();
    expect((await fresh.session.findUnique({ where: { id: initial.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(tokenC));
    await fresh.$disconnect();

    const third = await sessionService.refreshSession(tokenC);
    expect(third.refreshToken).not.toBe(tokenC);
    expect((await prisma.session.findUnique({ where: { id: initial.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(third.refreshToken));
  });

  it("does not rotate revoked, expired, or hash-mismatched sessions", async () => {
    const a = await user("controls@example.test");
    const revokedToken = "C4_REVOKED_TOKEN";
    const revoked = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, revokedToken);
    await sessionService.revokeOwnedSession(a.id, revoked.id);
    await expect(sessionService.refreshSession(revokedToken)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
    expect((await prisma.session.findUnique({ where: { id: revoked.id } }))?.revokedAt).not.toBeNull();

    const expiredToken = "C4_EXPIRED_TOKEN";
    const expired = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() - 1000) }, expiredToken);
    await expect(sessionService.refreshSession(expiredToken)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
    expect((await prisma.session.findUnique({ where: { id: expired.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(expiredToken));

    const actualToken = "C4_ACTUAL_TOKEN";
    const mismatch = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, actualToken);
    await expect(sessionService.refreshSession("C4_WRONG_TOKEN")).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
    expect((await prisma.session.findUnique({ where: { id: mismatch.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(actualToken));
  });

  it("allows exactly one winner when the same refresh token is used concurrently", async () => {
    const a = await user("concurrent@example.test");
    const token = "C5_TOKEN_A";
    const session = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, token);
    const outcomes = await Promise.allSettled([
      sessionService.refreshSession(token),
      sessionService.refreshSession(token),
    ]);
    const successes = outcomes.filter((result) => result.status === "fulfilled");
    const failures = outcomes.filter((result) => result.status === "rejected");
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    const winner = (successes[0] as PromiseFulfilledResult<{ refreshToken: string }>).value.refreshToken;
    expect((await prisma.session.findUnique({ where: { id: session.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(winner));
    const fresh = createPrismaTestClient();
    expect((await fresh.session.findUnique({ where: { id: session.id } }))?.refreshTokenHash).toBe(sessionService.hashRefreshToken(winner));
    await fresh.$disconnect();
    await expect(sessionService.refreshSession(token)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
  });

  it("maintains one winner across repeated independent races", async () => {
    for (let i = 0; i < 10; i += 1) {
      const a = await user(`repeat-${i}@example.test`);
      const token = `C5_REPEAT_TOKEN_${i}`;
      await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, token);
      const outcomes = await Promise.allSettled([
        sessionService.refreshSession(token),
        sessionService.refreshSession(token),
      ]);
      expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(outcomes.filter((result) => result.status === "rejected")).toHaveLength(1);
    }
  });

  it("allows one winner under five-way same-token contention", async () => {
    const a = await user("contention@example.test");
    const token = "C5_CONTENTION_TOKEN";
    await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, token);
    const outcomes = await Promise.allSettled(Array.from({ length: 5 }, () => sessionService.refreshSession(token)));
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter((result) => result.status === "rejected")).toHaveLength(4);
  });

  it("rejects every concurrent attempt for revoked and expired sessions", async () => {
    const a = await user("rejected-races@example.test");
    const revokedToken = "C5_REVOKED_TOKEN";
    const revoked = await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() + 3600000) }, revokedToken);
    await sessionService.revokeOwnedSession(a.id, revoked.id);
    const revokedResults = await Promise.allSettled([sessionService.refreshSession(revokedToken), sessionService.refreshSession(revokedToken)]);
    expect(revokedResults.every((result) => result.status === "rejected")).toBe(true);

    const expiredToken = "C5_EXPIRED_TOKEN";
    await sessionService.createSession({ userId: a.id, expiresAt: new Date(Date.now() - 1000) }, expiredToken);
    const expiredResults = await Promise.allSettled([sessionService.refreshSession(expiredToken), sessionService.refreshSession(expiredToken)]);
    expect(expiredResults.every((result) => result.status === "rejected")).toBe(true);
  });

  it("persists authentication audit events without credential fields", async () => {
    const a = await user("audit@example.test");
    const event = await auditService.recordEvent({ userId: a.id, eventType: "PASSWORD_RESET" });
    const stored = await prisma.securityAudit.findUnique({ where: { id: event.id } });
    expect(stored?.userId).toBe(a.id);
    expect(stored?.eventType).toBe("PASSWORD_RESET");
    expect(JSON.stringify(stored)).not.toContain("C2_RAW_PASSWORD_SENTINEL");
    expect(JSON.stringify(stored)).not.toContain("C4_TOKEN_A");
  });
});
