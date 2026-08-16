import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NODE_ENV = "test";
  process.env.CSRF_SECRET = "test-only-csrf-secret-material-32-bytes-minimum";
});

import { csrfService } from "../../src/services/auth/csrf.service";
import { validateRefreshBoundCsrf, requireTrustedOrigin } from "../../src/middleware/csrf.middleware";

function response() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as never;
}

function request(csrf: string | undefined, refresh = "REFRESH", origin = "http://localhost:5173") {
  return {
    headers: { "x-csrf-token": csrf, origin },
    rawHeaders: csrf === undefined ? ["Origin", origin] : ["Origin", origin, "X-CSRF-Token", csrf],
    cookies: { "cloudsight.csrf": csrf, refreshToken: refresh },
    get(name: string) {
      return this.headers[name.toLowerCase() as keyof typeof this.headers];
    },
  } as never;
}

describe("CSRF and trusted-origin middleware", () => {
  const next = vi.fn();

  beforeEach(() => next.mockReset());

  it("accepts a valid refresh-bound token from the trusted origin", () => {
    const token = csrfService.issueRefreshBoundToken("REFRESH").token;
    validateRefreshBoundCsrf(request(token), response(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it.each([
    ["missing token", request(undefined)],
    ["wrong binding", request(csrfService.issueRefreshBoundToken("OTHER").token)],
    ["attacker origin", request(csrfService.issueRefreshBoundToken("REFRESH").token, "REFRESH", "https://attacker.example")],
  ])("rejects %s", (_label, req) => {
    const res = response();
    validateRefreshBoundCsrf(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("rejects missing origin for trusted-origin protection", () => {
    const req = request(undefined) as { get: (name: string) => string | undefined; headers: Record<string, string>; rawHeaders: string[] };
    req.get = () => undefined;
    const res = response();
    requireTrustedOrigin(req as never, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
