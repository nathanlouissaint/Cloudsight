import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/services/auth/token.service", () => ({
  generateAccessToken: vi.fn(() => "SECRET_ACCESS_TOKEN"),
}));

vi.hoisted(() => {
  process.env.NODE_ENV = "test";
  process.env.CSRF_SECRET = "test-only-csrf-secret-material-32-bytes-minimum";
});

import { createAuthTestApp } from "../helpers/create-auth-test-app";
import { csrfService } from "../../src/services/auth/csrf.service";
import { sessionService } from "../../src/services/auth/session.service";
import { refreshTokenService } from "../../src/services/auth/refresh-token.service";
import { AuthDomainError } from "../../src/errors/auth.errors";

const refreshSession = vi.spyOn(sessionService, "refreshSession");
const generate = vi.spyOn(refreshTokenService, "generate");
const app = createAuthTestApp({ refreshSecurity: true });

const user = { id: "user-1", email: "person@example.test", name: null, avatarUrl: null, authProvider: "GOOGLE" as const };

beforeEach(() => {
  vi.clearAllMocks();
  generate.mockReturnValue("SECRET_REPLACEMENT_REFRESH_TOKEN");
  refreshSession.mockResolvedValue({
    refreshToken: "SECRET_REPLACEMENT_REFRESH_TOKEN",
    session: {
      id: "session-1", userId: "user-1", email: user.email,
      user, expiresAt: new Date(Date.now() + 60_000),
    },
  } as never);
});

function cookies(response: { headers: Record<string, string | string[] | undefined> }): string {
  return response.headers["set-cookie"]?.join("\n") ?? "";
}

describe("refresh controller HTTP security", () => {
  it("rotates a valid refresh cookie and emits replacement auth cookies", async () => {
    const csrf = csrfService.issueRefreshBoundToken("SECRET_OLD_REFRESH_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=SECRET_OLD_REFRESH_TOKEN`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);

    expect(response.status).toBe(200);
    expect(refreshSession).toHaveBeenCalledWith("SECRET_OLD_REFRESH_TOKEN");
    expect(response.body.accessToken).toBe("SECRET_ACCESS_TOKEN");
    expect(cookies(response)).toContain("refreshToken=SECRET_REPLACEMENT_REFRESH_TOKEN");
    expect(cookies(response)).toContain("cloudsight.csrf=");
    expect(cookies(response)).toContain("HttpOnly");
    expect(cookies(response)).toContain("Path=/auth");
    expect(cookies(response)).toContain("SameSite=Lax");
  });

  it("rejects a missing refresh cookie without access or replacement tokens", async () => {
    const response = await request(app).post("/auth/refresh").set("Origin", "http://localhost:5173");
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Forbidden" });
    expect(refreshSession).not.toHaveBeenCalled();
    expect(response.body.accessToken).toBeUndefined();
    expect(cookies(response)).not.toContain("SECRET_REPLACEMENT_REFRESH_TOKEN");
  });

  it.each([
    ["invalid", "SECRET_MALFORMED_REFRESH_TOKEN"],
    ["expired", "EXPIRED_REFRESH_TOKEN"],
    ["revoked", "REVOKED_REFRESH_TOKEN"],
  ])("rejects %s refresh sessions safely", async (_label, token) => {
    refreshSession.mockRejectedValue(new AuthDomainError("INVALID_REFRESH_TOKEN", "Refresh token is invalid."));
    const csrf = csrfService.issueRefreshBoundToken(token).token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=${token}`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid refresh token" });
    expect(JSON.stringify(response.body)).not.toContain(token);
    expect(cookies(response)).not.toContain("SECRET_REPLACEMENT_REFRESH_TOKEN");
    expect(cookies(response)).toContain("refreshToken=;");
    expect(cookies(response)).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(cookies(response)).toContain("Path=/auth");
  });

  it("does not disclose internal refresh failures", async () => {
    refreshSession.mockRejectedValue(new Error("SECRET_REFRESH_INTERNAL_ERROR"));
    const csrf = csrfService.issueRefreshBoundToken("OLD_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=OLD_TOKEN`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);
    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain("SECRET_REFRESH_INTERNAL_ERROR");
  });

  it("ignores an unrelated authorization header for cookie-based identity", async () => {
    const csrf = csrfService.issueRefreshBoundToken("SECRET_OLD_REFRESH_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Authorization", "Bearer SECRET_ATTACKER_TOKEN")
      .set("Cookie", [`refreshToken=SECRET_OLD_REFRESH_TOKEN`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);
    expect(response.status).toBe(200);
    expect(refreshSession).toHaveBeenCalledWith("SECRET_OLD_REFRESH_TOKEN");
  });

  it("rejects missing CSRF material before refresh rotation", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", "refreshToken=SECRET_OLD_REFRESH_TOKEN");
    expect(response.status).toBe(403);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("rejects invalid CSRF material before refresh rotation", async () => {
    const valid = csrfService.issueRefreshBoundToken("SECRET_OLD_REFRESH_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=SECRET_OLD_REFRESH_TOKEN`, `cloudsight.csrf=${valid}`])
      .set("X-CSRF-Token", "SECRET_INVALID_CSRF");
    expect(response.status).toBe(403);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("rejects an attacker origin before refresh rotation", async () => {
    const csrf = csrfService.issueRefreshBoundToken("SECRET_OLD_REFRESH_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "https://attacker.example")
      .set("Cookie", [`refreshToken=SECRET_OLD_REFRESH_TOKEN`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);
    expect(response.status).toBe(403);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("rejects a missing Origin through the real refresh route chain", async () => {
    const csrf = csrfService.issueRefreshBoundToken("SECRET_OLD_REFRESH_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [`refreshToken=SECRET_OLD_REFRESH_TOKEN`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);
    expect(response.status).toBe(403);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("rejects stale token A after HTTP rotation to token B", async () => {
    let current = "SECRET_REFRESH_TOKEN_A";
    refreshSession.mockImplementation(async (submitted) => {
      if (submitted !== current) {
        throw new AuthDomainError("INVALID_REFRESH_TOKEN", "Refresh token is invalid.");
      }
      current = "SECRET_REFRESH_TOKEN_B";
      return {
        refreshToken: current,
        session: { id: "session-1", userId: "user-1", email: user.email, user, expiresAt: new Date(Date.now() + 60_000) },
      } as never;
    });

    const csrfA = csrfService.issueRefreshBoundToken("SECRET_REFRESH_TOKEN_A").token;
    const first = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=SECRET_REFRESH_TOKEN_A`, `cloudsight.csrf=${csrfA}`])
      .set("X-CSRF-Token", csrfA);
    expect(first.status).toBe(200);
    expect(cookies(first)).toContain("refreshToken=SECRET_REFRESH_TOKEN_B");

    const csrfReplay = csrfService.issueRefreshBoundToken("SECRET_REFRESH_TOKEN_A").token;
    const replay = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=SECRET_REFRESH_TOKEN_A`, `cloudsight.csrf=${csrfReplay}`])
      .set("X-CSRF-Token", csrfReplay);
    expect(replay.status).toBe(401);
    expect(replay.body).toEqual({ message: "Invalid refresh token" });
    expect(cookies(replay)).not.toContain("SECRET_REFRESH_TOKEN_B");

    const csrfB = csrfService.issueRefreshBoundToken("SECRET_REFRESH_TOKEN_B").token;
    const second = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Cookie", [`refreshToken=SECRET_REFRESH_TOKEN_B`, `cloudsight.csrf=${csrfB}`])
      .set("X-CSRF-Token", csrfB);
    expect(second.status).toBe(200);
  });
});
