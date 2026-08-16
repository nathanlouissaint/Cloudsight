import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.hoisted(() => {
  process.env.NODE_ENV = "test";
  process.env.CSRF_SECRET = "test-only-csrf-secret-material-32-bytes-minimum";
});

import { createAuthTestApp } from "../helpers/create-auth-test-app";
import { sessionService } from "../../src/services/auth/session.service";
import express from "express";
import { errorHandler } from "../../src/middleware/error.middleware";
import { csrfService } from "../../src/services/auth/csrf.service";
import {
  sanitizeRequestForLogging,
  sanitizeResponseForLogging,
} from "../../src/config/http-logging.config";

const app = createAuthTestApp({ refreshSecurity: true });
const refreshSession = vi.spyOn(sessionService, "refreshSession");

describe("authentication runtime logging", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it("does not log refresh credentials or raw internal error content", async () => {
    refreshSession.mockRejectedValue(new Error("SECRET_REFRESH_INTERNAL_ERROR"));
    const csrf = csrfService.issueRefreshBoundToken("SECRET_REFRESH_TOKEN").token;
    const response = await request(app)
      .post("/auth/refresh")
      .set("Origin", "http://localhost:5173")
      .set("Authorization", "Bearer SECRET_AUTHORIZATION_HEADER")
      .set("Cookie", [`refreshToken=SECRET_REFRESH_TOKEN`, `cloudsight.csrf=${csrf}`])
      .set("X-CSRF-Token", csrf);

    expect(response.status).toBe(500);
    const output = JSON.stringify(errorSpy.mock.calls);
    expect(output).not.toContain("SECRET_REFRESH_INTERNAL_ERROR");
    expect(output).not.toContain("SECRET_REFRESH_TOKEN");
    expect(output).not.toContain("SECRET_CSRF_TOKEN");
    expect(output).not.toContain("SECRET_AUTHORIZATION_HEADER");
  });

  it("does not log credential-bearing global errors", async () => {
    const app = express();
    app.get("/auth-test-error", (_req, _res, next) => {
      next(new Error("SECRET_INTERNAL_DATABASE_CREDENTIAL"));
    });
    app.use(errorHandler);

    const response = await request(app).get("/auth-test-error");
    expect(response.status).toBe(500);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("SECRET_INTERNAL_DATABASE_CREDENTIAL");
  });

  it("removes OAuth callback code and state before request logging", () => {
    const original = {
      method: "GET",
      url: "/auth/oauth/github/callback?state=SECRET_STATE&code=SECRET_CODE",
      query: { state: "SECRET_STATE", code: "SECRET_CODE" },
      headers: { host: "cloudsight.test" },
    };
    const sanitized = sanitizeRequestForLogging(original);

    expect(sanitized.url).toBe("/auth/oauth/github/callback");
    expect(sanitized.query).toEqual({});
    expect(JSON.stringify(sanitized)).not.toMatch(/SECRET_STATE|SECRET_CODE/);
    expect(original.query).toEqual({ state: "SECRET_STATE", code: "SECRET_CODE" });
    expect(sanitizeRequestForLogging({ url: "/auth/me", query: { view: "full" } })).toEqual({
      url: "/auth/me",
      query: { view: "full" },
    });
  });

  it.each([
    "/AUTH/OAUTH/GITHUB/CALLBACK?state=SECRET_STATE&code=SECRET_CODE",
    "https://cloudsight.test/auth/oauth/github/callback?state=SECRET_STATE&code=SECRET_CODE",
  ])("removes credentials from accepted callback URL form %s", (url) => {
    const sanitized = sanitizeRequestForLogging({
      url,
      query: { state: "SECRET_STATE", code: "SECRET_CODE" },
    });

    expect(JSON.stringify(sanitized)).not.toMatch(/SECRET_STATE|SECRET_CODE/);
    expect(sanitized.query).toEqual({});
  });

  it("removes OAuth credentials from logged redirect locations", () => {
    const original = {
      statusCode: 302,
      headers: {
        location: "https://github.com/login/oauth/authorize?client_id=public-client&state=SECRET_STATE&code_challenge=SECRET_CHALLENGE",
      },
    };
    const sanitized = sanitizeResponseForLogging(original);

    expect(sanitized.headers?.location).toBe("https://github.com/login/oauth/authorize");
    expect(JSON.stringify(sanitized)).not.toMatch(/SECRET_STATE|SECRET_CHALLENGE/);
    expect(original.headers.location).toContain("SECRET_STATE");
    expect(sanitizeResponseForLogging({
      statusCode: 302,
      headers: { location: "http://localhost:4174/login?authError=oauth_failed" },
    }).headers?.location).toBe("http://localhost:4174/login?authError=oauth_failed");
  });

  it.each([
    ["relative", "/auth/oauth/github/callback?state=SECRET_STATE", "/auth/oauth/github/callback"],
    ["protocol-relative", "//github.com/login/oauth/authorize?code_challenge=SECRET_CHALLENGE", "//github.com/login/oauth/authorize"],
    ["malformed absolute", "http://[invalid]?access_token=SECRET_TOKEN", "http://[invalid]"],
    ["encoded key", "/callback?%73tate=SECRET_STATE", "/callback"],
    ["fragment", "/complete#id_token=SECRET_ID_TOKEN", "/complete"],
  ])("removes OAuth credentials from %s logged Location values", (_label, location, expected) => {
    const sanitized = sanitizeResponseForLogging({
      statusCode: 302,
      headers: { location },
    });

    expect(sanitized.headers?.location).toBe(expected);
    expect(JSON.stringify(sanitized)).not.toMatch(/SECRET_/);
  });
});
