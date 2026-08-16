import request from "supertest";
import bcrypt from "bcrypt";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../../src/app";
import { prisma } from "../../../src/config/prisma";
import crypto from "node:crypto";
import { clearCapturedTestEmails, getCapturedTestEmails } from "../../../src/services/email/test-email-capture";
import { setFederatedProviderForTests, resetFederatedProviderTestOverrides } from "../../../src/services/auth/federated-provider.registry";
import type { FederatedAuthProvider, FederatedAuthorizationRequest, NormalizedFederatedIdentity } from "../../../src/types/auth/federated.types";

const origin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const prefix = `http-${Date.now()}`;
const email = `${prefix}@example.test`;
const password = "HttpBoundaryPassword!123";
let requestIp = 10;

class ControlledFederatedProvider implements FederatedAuthProvider {
  readonly providerKind: "GOOGLE" | "MICROSOFT" | "GITHUB";
  readonly redirectUri: string;
  constructor(private readonly identities: Record<string, NormalizedFederatedIdentity>, providerKind: "GOOGLE" | "MICROSOFT" | "GITHUB" = "GOOGLE") {
    this.providerKind = providerKind;
    const path = providerKind === "GOOGLE" ? "google" : providerKind === "MICROSOFT" ? "microsoft" : "github";
    this.redirectUri = `http://localhost:4100/auth/oauth/${path}/callback`;
  }
  getAuthorizationUrl(request: FederatedAuthorizationRequest): string {
    const url = new URL("https://controlled-provider.invalid/authorize");
    url.searchParams.set("state", request.state);
    url.searchParams.set("redirect_uri", request.redirectUri);
    return url.toString();
  }
  async exchangeAuthorizationCode(code: string): Promise<NormalizedFederatedIdentity> {
    const identity = this.identities[code];
    if (!identity) throw new Error("controlled provider failure");
    return identity;
  }
  async verifyIdentity(idToken: string): Promise<NormalizedFederatedIdentity> {
    return this.exchangeAuthorizationCode(idToken);
  }
  normalizeIdentity(value: unknown): NormalizedFederatedIdentity {
    return value as NormalizedFederatedIdentity;
  }
}

function cookieHeader(setCookie: string[] | undefined): string {
  return (setCookie ?? []).map((value) => value.split(";", 1)[0]).join("; ");
}

async function csrf(agent: request.SuperAgentTest) {
  const response = await agent.get("/auth/csrf").set("Origin", origin).set("X-Forwarded-For", `10.0.0.${requestIp++}`);
  expect(response.status).toBe(200);
  return response.body.csrfToken as string;
}

async function registerAndLogin(suffix: string) {
  const userEmail = `${prefix}-${suffix}@example.test`;
  const ip = `10.0.0.${requestIp++}`;
  const registration = await request(app).post("/auth/register").set("X-Forwarded-For", ip).send({ email: userEmail, password });
  if (registration.status === 429) {
    await prisma.user.create({ data: { email: userEmail, passwordHash: await bcrypt.hash(password, 4) } });
  }
  const agent = request.agent(app);
  const token = await csrf(agent);
  const login = await agent.post("/auth/login").set("Origin", origin).set("X-Forwarded-For", ip).set("X-CSRF-Token", token).send({ email: userEmail, password });
  expect(login.status).toBe(200);
  return { agent, email: userEmail, accessToken: login.body.accessToken as string, csrfToken: login.body.csrfToken as string, cookies: cookieHeader(login.headers["set-cookie"] as string[]) };
}

async function loginExisting(userEmail: string) {
  const agent = request.agent(app);
  const pre = await csrf(agent);
  const login = await agent.post("/auth/login").set("Origin", origin).set("X-Forwarded-For", `10.0.0.${requestIp++}`).set("X-CSRF-Token", pre).send({ email: userEmail, password });
  expect(login.status).toBe(200);
  return { agent, email: userEmail, accessToken: login.body.accessToken as string, csrfToken: login.body.csrfToken as string, cookies: cookieHeader(login.headers["set-cookie"] as string[]) };
}

const httpDescribe = process.env.TEST_DATABASE_URL ? describe : describe.skip;

httpDescribe("real HTTP authentication boundary", () => {
  beforeAll(async () => {
    app.set("trust proxy", true);
    await prisma.$connect();
    await prisma.user.deleteMany({ where: { email: { startsWith: "http-" } } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: "http-" } } });
    await prisma.$disconnect();
  });

  it("registers safely and rejects duplicate email", async () => {
    const created = await request(app).post("/auth/register").send({ email, password });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ email });
    expect(JSON.stringify(created.body)).not.toContain(password);
    expect(created.body.password).toBeUndefined();

    const duplicate = await request(app).post("/auth/register").send({ email, password });
    expect(duplicate.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(duplicate.body)).not.toMatch(/prisma|database|sql/i);
  });

  it("logs in through HTTP, issues cookies, and resolves /me", async () => {
    const agent = request.agent(app);
    const preAuthCsrf = await csrf(agent);
    const response = await agent
      .post("/auth/login")
      .set("Origin", origin)
      .set("X-CSRF-Token", preAuthCsrf)
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(email);
    expect(response.body.password).toBeUndefined();
    expect(response.body.refreshToken).toBeUndefined();
    const cookies = response.headers["set-cookie"] as string[];
    expect(cookies.join("\n")).toContain("refreshToken=");
    expect(cookies.join("\n")).toContain("HttpOnly");
    expect(cookies.join("\n")).toContain("Path=/auth");

    const me = await agent.get("/auth/me").set("Authorization", `Bearer ${response.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);
  });

  it("rejects login and protected requests without leaking internals", async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const wrong = await agent.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", token).send({ email, password: "wrong" });
    expect(wrong.status).toBe(401);
    expect(JSON.stringify(wrong.body)).not.toMatch(/hash|prisma|sql|stack/i);
    expect((wrong.headers["set-cookie"] ?? []).join("\n")).not.toContain("refreshToken=");

    const unauthenticated = await request(app).get("/auth/me");
    expect(unauthenticated.status).toBe(401);
  });

  it("enforces Origin and CSRF on refresh", async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const login = await agent.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", token).send({ email, password });
    expect(login.status).toBe(200);
    const missing = await agent.post("/auth/refresh").set("Origin", origin);
    expect(missing.status).toBe(403);
    const wrong = await agent.post("/auth/refresh").set("Origin", origin).set("X-CSRF-Token", "wrong");
    expect(wrong.status).toBe(403);
  });

  it("rotates refresh cookies and rejects the captured stale cookie", async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const login = await agent.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", token).send({ email, password });
    expect(login.status).toBe(200);
    const originalCookies = cookieHeader(login.headers["set-cookie"] as string[]);
    const originalCsrf = login.body.csrfToken as string;

    const rotated = await agent.post("/auth/refresh").set("Origin", origin).set("X-CSRF-Token", originalCsrf);
    expect(rotated.status).toBe(200);
    const stale = await request(app).post("/auth/refresh").set("Origin", origin).set("Cookie", originalCookies).set("X-CSRF-Token", originalCsrf);
    expect(stale.status).toBe(401);
    expect(JSON.stringify(stale.body)).not.toMatch(/prisma|sql|hash|refreshToken/i);
  });

  it("allows exactly one winner for concurrent same-cookie refresh", async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const login = await agent.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", token).send({ email, password });
    expect(login.status).toBe(200);
    const cookies = cookieHeader(login.headers["set-cookie"] as string[]);
    const csrfToken = login.body.csrfToken as string;
    const results = await Promise.all([
      request(app).post("/auth/refresh").set("Origin", origin).set("Cookie", cookies).set("X-CSRF-Token", csrfToken),
      request(app).post("/auth/refresh").set("Origin", origin).set("Cookie", cookies).set("X-CSRF-Token", csrfToken),
    ]);
    expect(results.filter((result) => result.status === 200)).toHaveLength(1);
    expect(results.filter((result) => result.status !== 200)).toHaveLength(1);
  });

  it("clears authentication on logout", async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const login = await agent.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", token).send({ email, password });
    const logout = await agent.post("/auth/logout").set("Origin", origin).set("X-CSRF-Token", login.body.csrfToken);
    expect(logout.status).toBe(204);
    expect((logout.headers["set-cookie"] ?? []).join("\n")).toMatch(/refreshToken=;|cloudsight\.csrf=;/);
    expect((await agent.get("/auth/me")).status).toBe(401);
  });

  it("scopes active sessions and logout-all to the authenticated user", async () => {
    const a1 = await registerAndLogin("owner-a1");
    const a2 = await loginExisting(a1.email);
    const b1 = await registerAndLogin("owner-b1");
    const sessions = await a1.agent.get("/auth/sessions").set("Authorization", `Bearer ${a1.accessToken}`);
    expect(sessions.status).toBe(200);
    expect(sessions.body.every((item: Record<string, unknown>) => !("refreshTokenHash" in item))).toBe(true);
    expect(sessions.body.every((item: Record<string, unknown>) => item.userId === undefined || item.userId === sessions.body[0]?.userId)).toBe(true);

    const logoutAll = await a1.agent.post("/auth/logout-all").set("Origin", origin).set("X-CSRF-Token", a1.csrfToken).set("Authorization", `Bearer ${a1.accessToken}`);
    expect(logoutAll.status).toBe(200);
    expect((await request(app).post("/auth/refresh").set("Origin", origin).set("Cookie", a1.cookies).set("X-CSRF-Token", a1.csrfToken)).status).toBe(401);
    expect((await request(app).post("/auth/refresh").set("Origin", origin).set("Cookie", a2.cookies).set("X-CSRF-Token", a2.csrfToken)).status).toBe(401);
    expect((await b1.agent.get("/auth/me").set("Authorization", `Bearer ${b1.accessToken}`)).status).toBe(200);
  });

  it("revokes only the requested owned session", async () => {
    const owner = await registerAndLogin("revoke-owner");
    const other = await registerAndLogin("revoke-other");
    const sessions = await owner.agent.get("/auth/sessions").set("Authorization", `Bearer ${owner.accessToken}`);
    expect(sessions.status).toBe(200);
    const foreignSessions = await other.agent.get("/auth/sessions").set("Authorization", `Bearer ${other.accessToken}`);
    const foreignId = foreignSessions.body[0].id as string;
    const foreignAttempt = await owner.agent.delete(`/auth/sessions/${foreignId}`).set("Origin", origin).set("X-CSRF-Token", owner.csrfToken).set("Authorization", `Bearer ${owner.accessToken}`);
    expect([403, 404]).toContain(foreignAttempt.status);
    expect((await other.agent.get("/auth/me").set("Authorization", `Bearer ${other.accessToken}`)).status).toBe(200);
  });

  it("changes password through HTTP and rejects an incorrect current password", async () => {
    const account = await registerAndLogin("change-password");
    const newPassword = "NewHttpBoundaryPassword!456";
    const changed = await account.agent.post("/auth/change-password").set("Authorization", `Bearer ${account.accessToken}`).send({ currentPassword: password, newPassword, confirmPassword: newPassword });
    expect(changed.status).toBe(200);
    expect(JSON.stringify(changed.body)).not.toMatch(/hash|passwordHash/i);
    const oldLoginAgent = request.agent(app);
    const oldLoginCsrf = await csrf(oldLoginAgent);
    const oldLogin = await oldLoginAgent.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", oldLoginCsrf).send({ email: account.email, password });
    expect(oldLogin.status).toBe(401);
    const newLogin = await request(app).get("/auth/csrf").set("Origin", origin);
    expect(newLogin.status).toBe(200);
    const fresh = request.agent(app);
    const pre = await csrf(fresh);
    expect((await fresh.post("/auth/login").set("Origin", origin).set("X-CSRF-Token", pre).send({ email: account.email, password: newPassword })).status).toBe(200);
  });

  it("returns configured security headers and credentialed CORS behavior", async () => {
    const allowed = await request(app).get("/health/live").set("Origin", origin);
    expect(allowed.status).toBe(200);
    expect(allowed.headers["access-control-allow-origin"]).toBe(origin);
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");
    expect(allowed.headers["content-security-policy"]).toBeDefined();
    expect(allowed.headers["x-content-type-options"]).toBe("nosniff");
    const denied = await request(app).get("/health/live").set("Origin", "https://attacker.example");
    expect(denied.headers["access-control-allow-origin"]).not.toBe("https://attacker.example");
    expect(denied.headers["access-control-allow-origin"]).not.toBe("*");
  });

  it("enforces the configured login rate limit", async () => {
    const responses = [];
    for (let index = 0; index < 11; index += 1) {
      responses.push(await request(app).post("/auth/login").send({ email: `rate-${prefix}-${index}@example.test`, password }));
    }
    expect(responses.some((response) => response.status === 429)).toBe(true);
    expect(JSON.stringify(responses.at(-1)?.body)).not.toMatch(/prisma|sql|stack|secret/i);
  });

  it("delivers reset tokens only through the test email boundary and consumes them over HTTP", async () => {
    const account = await registerAndLogin("reset-flow");
    clearCapturedTestEmails();
    const forgot = await request(app).post("/auth/forgot-password").send({ email: account.email });
    expect(forgot.status).toBe(200);
    expect(JSON.stringify(forgot.body)).not.toMatch(/token|hash|passwordHash/i);
    const message = getCapturedTestEmails().at(-1);
    expect(message?.subject).toContain("Reset");
    const token = message?.text.match(/token: (\S+)/)?.[1];
    expect(token).toBeTruthy();
    const record = await prisma.passwordResetToken.findFirst({ where: { user: { email: account.email } } });
    expect(record).toBeTruthy();
    expect(record?.tokenHash).toBe(crypto.createHash("sha256").update(token as string).digest("hex"));
    expect(record?.tokenHash).not.toBe(token);

    const newPassword = "ResetHttpPassword!456";
    const reset = await request(app).post("/auth/reset-password").send({ token, password: newPassword });
    expect(reset.status).toBe(200);
    expect(JSON.stringify(reset.body)).not.toMatch(/token|hash|passwordHash/i);
    expect(await prisma.passwordResetToken.findUnique({ where: { id: record?.id } })).toBeNull();
    expect((await request(app).post("/auth/reset-password").send({ token, password: newPassword })).status).toBe(400);
  });

  it("rejects invalid and expired reset tokens without disclosure", async () => {
    const invalid = await request(app).post("/auth/reset-password").send({ token: "invalid-reset-token", password: "ResetHttpPassword!456" });
    expect(invalid.status).toBe(400);
    const account = await registerAndLogin("expired-reset");
    clearCapturedTestEmails();
    await request(app).post("/auth/forgot-password").send({ email: account.email });
    const token = getCapturedTestEmails().at(-1)?.text.match(/token: (\S+)/)?.[1] as string;
    const record = await prisma.passwordResetToken.findFirst({ where: { user: { email: account.email } } });
    await prisma.passwordResetToken.update({ where: { id: record?.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const expired = await request(app).post("/auth/reset-password").send({ token, password: "ResetHttpPassword!456" });
    expect(expired.status).toBe(400);
  });

  it("captures verification delivery and verifies the user over HTTP", async () => {
    const account = await registerAndLogin("verification-flow");
    clearCapturedTestEmails();
    const resend = await account.agent.post("/auth/resend-verification").set("Authorization", `Bearer ${account.accessToken}`);
    expect(resend.status).toBe(200);
    const message = getCapturedTestEmails().at(-1);
    expect(message?.subject).toContain("Verify");
    const token = message?.text.match(/token: (\S+)/)?.[1] as string;
    const record = await prisma.emailVerificationToken.findFirst({ where: { user: { email: account.email } } });
    expect(record?.tokenHash).toBe(crypto.createHash("sha256").update(token).digest("hex"));
    expect(record?.tokenHash).not.toBe(token);
    const [verified, concurrent] = await Promise.all([
      request(app).post("/auth/verify-email").send({ token }),
      request(app).post("/auth/verify-email").send({ token }),
    ]);
    expect(verified.status).toBe(200);
    expect(concurrent.status).toBe(200);
    expect((await prisma.user.findUnique({ where: { email: account.email } }))?.emailVerifiedAt).not.toBeNull();
    expect((await request(app).post("/auth/verify-email").send({ token })).status).toBe(200);
    expect(await prisma.securityAudit.count({
      where: {
        user: { email: account.email },
        eventType: "EMAIL_VERIFIED",
      },
    })).toBe(1);
  });

  it("rejects invalid and expired verification tokens", async () => {
    expect((await request(app).post("/auth/verify-email").send({ token: "invalid-verification-token" })).status).toBe(400);
    const account = await registerAndLogin("expired-verification");
    clearCapturedTestEmails();
    await account.agent.post("/auth/resend-verification").set("Authorization", `Bearer ${account.accessToken}`);
    const token = getCapturedTestEmails().at(-1)?.text.match(/token: (\S+)/)?.[1] as string;
    const record = await prisma.emailVerificationToken.findFirst({ where: { user: { email: account.email } } });
    await prisma.emailVerificationToken.update({ where: { id: record?.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await request(app).post("/auth/verify-email").send({ token })).status).toBe(400);
  });

  it("completes federated OAuth through HTTP with real CloudSight persistence", async () => {
    const controlled = new ControlledFederatedProvider({
      codeA: { providerKind: "GOOGLE", issuer: "https://accounts.google.com", subject: `${prefix}-provider-a`, email: `${prefix}-federated-a@example.test`, emailVerified: true, displayName: "Federated A" },
      codeB: { providerKind: "GOOGLE", issuer: "https://accounts.google.com", subject: `${prefix}-provider-b`, email: `${prefix}-federated-b@example.test`, emailVerified: true, displayName: "Federated B" },
    });
    setFederatedProviderForTests("GOOGLE", controlled);
    try {
      const agent = request.agent(app);
      const initiation = await agent.get("/auth/oauth/google/start");
      expect(initiation.status).toBe(302);
      const location = initiation.headers.location as string;
      const state = new URL(location).searchParams.get("state");
      expect(state).toBeTruthy();
      const genericAgent = request.agent(app);
      const genericInitiation = await genericAgent.get("/auth/oauth/google/start");
      expect(genericInitiation.status).toBe(302);
      const genericState = new URL(genericInitiation.headers.location as string).searchParams.get("state");
      expect(genericState).toBeTruthy();
      const genericCallback = await genericAgent.get("/auth/oauth/google/callback").query({ state: genericState, code: "unknown-code" });
      expect(genericCallback.status).toBe(302);
      expect(genericCallback.headers.location).toContain("authError=oauth_failed");
      const callback = await agent.get("/auth/oauth/google/callback").query({ state, code: "codeA" });
      expect(callback.status).toBe(302);
      expect(callback.headers.location).toContain("/auth/oauth/complete");
      const userA = await prisma.user.findUnique({ where: { email: `${prefix}-federated-a@example.test` } });
      expect(userA).toBeTruthy();
      const identityA = await prisma.authIdentity.findUnique({ where: { issuer_providerSubject: { issuer: "https://accounts.google.com", providerSubject: `${prefix}-provider-a` } } });
      expect(identityA?.userId).toBe(userA?.id);
      const sessionA = await prisma.session.findFirst({ where: { userId: userA?.id } });
      expect(sessionA).toBeTruthy();
      expect(sessionA?.refreshTokenHash).not.toContain("codeA");
      const callbackCsrf = await csrf(agent);
      const refreshed = await agent.post("/auth/refresh").set("Origin", origin).set("X-CSRF-Token", callbackCsrf);
      expect(refreshed.status).toBe(200);
      expect((await agent.get("/auth/me").set("Authorization", `Bearer ${refreshed.body.accessToken}`)).status).toBe(200);

      const repeatAgent = request.agent(app);
      const repeatStart = await repeatAgent.get("/auth/oauth/google/start");
      const repeatState = new URL(repeatStart.headers.location as string).searchParams.get("state");
      const repeat = await repeatAgent.get("/auth/oauth/google/callback").query({ state: repeatState, code: "codeA" });
      expect(repeat.status).toBe(302);
      expect(await prisma.user.count({ where: { email: `${prefix}-federated-a@example.test` } })).toBe(1);
      expect(await prisma.authIdentity.count({ where: { issuer: "https://accounts.google.com", providerSubject: `${prefix}-provider-a` } })).toBe(1);

      const secondAgent = request.agent(app);
      const secondStart = await secondAgent.get("/auth/oauth/google/start");
      const secondState = new URL(secondStart.headers.location as string).searchParams.get("state");
      const second = await secondAgent.get("/auth/oauth/google/callback").query({ state: secondState, code: "codeB" });
      expect(second.status).toBe(302);
      const userB = await prisma.user.findUnique({ where: { email: `${prefix}-federated-b@example.test` } });
      expect(userB?.id).not.toBe(userA?.id);

      const failedAgent = request.agent(app);
      const failedStart = await failedAgent.get("/auth/oauth/google/start");
      const failedState = new URL(failedStart.headers.location as string).searchParams.get("state");
      const failed = await failedAgent.get("/auth/oauth/google/callback").query({ state: failedState, code: "unknown-code" });
      expect(failed.status).toBe(302);
      expect(failed.headers.location).toContain("authError=oauth_failed");
      expect(await prisma.user.count({ where: { email: { startsWith: `${prefix}-unknown` } } })).toBe(0);

      const missing = await request(app).get("/auth/oauth/google/callback").query({ state: "missing", code: "codeA" });
      expect(missing.status).toBe(302);
      expect(missing.headers.location).toContain("authError=oauth_failed");
      const unknownProvider = await request(app).get("/auth/oauth/not-a-provider/start");
      expect(unknownProvider.status).toBe(302);
      expect(unknownProvider.headers.location).toContain("authError=oauth_failed");
      const disabledMicrosoft = await request(app).get("/auth/oauth/microsoft/start");
      expect(disabledMicrosoft.status).toBe(503);
      expect(disabledMicrosoft.text).not.toContain("MICROSOFT");

      const microsoft = new ControlledFederatedProvider({
        codeMs: { providerKind: "MICROSOFT", issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0", subject: `${prefix}-microsoft-subject`, email: `${prefix}-microsoft@example.test`, emailVerified: true, displayName: "Microsoft User" },
      }, "MICROSOFT");
      setFederatedProviderForTests("MICROSOFT", microsoft);
      const microsoftAgent = request.agent(app);
      const microsoftStart = await microsoftAgent.get("/auth/oauth/microsoft/start");
      expect(microsoftStart.status).toBe(302);
      const microsoftState = new URL(microsoftStart.headers.location as string).searchParams.get("state");
      const microsoftCallback = await microsoftAgent.get("/auth/oauth/microsoft/callback").query({ state: microsoftState, code: "codeMs" });
      expect(microsoftCallback.status).toBe(302);
      expect(microsoftCallback.headers.location).toContain("/auth/oauth/complete");
      const microsoftUser = await prisma.user.findUnique({ where: { email: `${prefix}-microsoft@example.test` } });
      expect(microsoftUser).toBeTruthy();
      const microsoftIdentity = await prisma.authIdentity.findUnique({ where: { issuer_providerSubject: { issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0", providerSubject: `${prefix}-microsoft-subject` } } });
      expect(microsoftIdentity?.providerKind).toBe("MICROSOFT");
      expect(microsoftIdentity?.userId).toBe(microsoftUser?.id);

      const github = new ControlledFederatedProvider({
        codeGithub: { providerKind: "GITHUB", issuer: "https://github.com", subject: "12345", email: `${prefix}-github@example.test`, emailVerified: true, displayName: "GitHub User" },
        codeGithubChangedEmail: { providerKind: "GITHUB", issuer: "https://github.com", subject: "12345", email: `${prefix}-github-renamed-email@example.test`, emailVerified: true, displayName: "GitHub User" },
        codeGithubLocalCollision: { providerKind: "GITHUB", issuer: "https://github.com", subject: "20001", email: `${prefix}-github-local-collision@example.test`, emailVerified: true },
        codeGithubGoogleCollision: { providerKind: "GITHUB", issuer: "https://github.com", subject: "20002", email: `${prefix}-github-google-collision@example.test`, emailVerified: true },
        codeGithubMicrosoftCollision: { providerKind: "GITHUB", issuer: "https://github.com", subject: "20003", email: `${prefix}-github-microsoft-collision@example.test`, emailVerified: true },
      }, "GITHUB");
      setFederatedProviderForTests("GITHUB", github);
      const githubAgent = request.agent(app);
      const githubStart = await githubAgent.get("/auth/oauth/github/start");
      expect(githubStart.status).toBe(302);
      const githubLocation = new URL(githubStart.headers.location as string);
      expect(githubLocation.hostname).toBe("controlled-provider.invalid");
      const githubState = githubLocation.searchParams.get("state");
      const githubCallback = await githubAgent.get("/auth/oauth/github/callback").query({ state: githubState, code: "codeGithub" });
      expect(githubCallback.status).toBe(302);
      expect(githubCallback.headers.location).toContain("/auth/oauth/complete");
      const githubUser = await prisma.user.findUnique({ where: { email: `${prefix}-github@example.test` } });
      const githubIdentity = await prisma.authIdentity.findUnique({ where: { issuer_providerSubject: { issuer: "https://github.com", providerSubject: "12345" } } });
      expect(githubUser).toBeTruthy();
      expect(githubIdentity?.providerKind).toBe("GITHUB");
      expect(githubIdentity?.userId).toBe(githubUser?.id);

      const sessionsBeforeReplay = await prisma.session.count({ where: { userId: githubUser?.id } });
      const replay = await githubAgent.get("/auth/oauth/github/callback").query({ state: githubState, code: "codeGithub" });
      expect(replay.status).toBe(302);
      expect(replay.headers.location).toContain("authError=oauth_failed");
      expect(replay.headers.location).not.toContain(String(githubState));
      expect(await prisma.session.count({ where: { userId: githubUser?.id } })).toBe(sessionsBeforeReplay);

      const githubRepeat = request.agent(app);
      const githubRepeatStart = await githubRepeat.get("/auth/oauth/github/start");
      const githubRepeatState = new URL(githubRepeatStart.headers.location as string).searchParams.get("state");
      const repeatCallback = await githubRepeat.get("/auth/oauth/github/callback").query({ state: githubRepeatState, code: "codeGithub" });
      expect(repeatCallback.status).toBe(302);
      expect(await prisma.user.count({ where: { email: `${prefix}-github@example.test` } })).toBe(1);
      expect(await prisma.authIdentity.count({ where: { issuer: "https://github.com", providerSubject: "12345" } })).toBe(1);

      const changedEmailAgent = request.agent(app);
      const changedEmailStart = await changedEmailAgent.get("/auth/oauth/github/start");
      const changedEmailState = new URL(changedEmailStart.headers.location as string).searchParams.get("state");
      const changedEmailCallback = await changedEmailAgent.get("/auth/oauth/github/callback").query({ state: changedEmailState, code: "codeGithubChangedEmail" });
      expect(changedEmailCallback.status).toBe(302);
      expect(changedEmailCallback.headers.location).toContain("/auth/oauth/complete");
      expect(await prisma.user.count({ where: { email: `${prefix}-github-renamed-email@example.test` } })).toBe(0);
      expect((await prisma.authIdentity.findUnique({ where: { issuer_providerSubject: { issuer: "https://github.com", providerSubject: "12345" } } }))?.userId).toBe(githubUser?.id);

      const localCollision = await prisma.user.create({
        data: { email: `${prefix}-github-local-collision@example.test`, passwordHash: await bcrypt.hash(password, 4) },
      });
      const googleCollision = await prisma.user.create({
        data: {
          email: `${prefix}-github-google-collision@example.test`,
          authProvider: "GOOGLE",
          authIdentities: { create: { providerKind: "GOOGLE", issuer: "https://accounts.google.com", providerSubject: `${prefix}-collision-google` } },
        },
      });
      const microsoftCollision = await prisma.user.create({
        data: {
          email: `${prefix}-github-microsoft-collision@example.test`,
          authProvider: "MICROSOFT",
          authIdentities: { create: { providerKind: "MICROSOFT", issuer: "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0", providerSubject: `${prefix}-collision-microsoft` } },
        },
      });

      for (const collision of [
        { code: "codeGithubLocalCollision", subject: "20001", userId: localCollision.id },
        { code: "codeGithubGoogleCollision", subject: "20002", userId: googleCollision.id },
        { code: "codeGithubMicrosoftCollision", subject: "20003", userId: microsoftCollision.id },
      ]) {
        const collisionAgent = request.agent(app);
        const collisionStart = await collisionAgent.get("/auth/oauth/github/start");
        const collisionState = new URL(collisionStart.headers.location as string).searchParams.get("state");
        const collisionCallback = await collisionAgent.get("/auth/oauth/github/callback").query({ state: collisionState, code: collision.code });
        expect(collisionCallback.status).toBe(302);
        expect(collisionCallback.headers.location).toContain("authError=account_link_required");
        expect(collisionCallback.headers["set-cookie"]?.join("\n") ?? "").not.toContain("refreshToken=");
        expect(await prisma.authIdentity.count({ where: { providerKind: "GITHUB", issuer: "https://github.com", providerSubject: collision.subject } })).toBe(0);
        expect(await prisma.session.count({ where: { userId: collision.userId } })).toBe(0);
      }
    } finally {
      resetFederatedProviderTestOverrides();
    }
  });
});
