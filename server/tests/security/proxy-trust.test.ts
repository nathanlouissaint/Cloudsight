import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  isTrustedCloudSightProxy,
  resolveTrustProxy,
} from "../../src/config/http-security.config";
import {
  ipRateLimitKey,
} from "../../src/middleware/rate-limit.middleware";
import type { Request } from "express";

describe("production proxy trust", () => {
  it("trusts only the fixed internal Nginx subnet in production", () => {
    expect(resolveTrustProxy("development")).toBe(false);
    expect(resolveTrustProxy("test")).toBe(false);
    expect(resolveTrustProxy("production")).toBe(isTrustedCloudSightProxy);
    expect(isTrustedCloudSightProxy("172.30.0.2")).toBe(true);
    expect(isTrustedCloudSightProxy("::ffff:172.30.0.254")).toBe(true);
    expect(isTrustedCloudSightProxy("172.31.0.2")).toBe(false);
    expect(isTrustedCloudSightProxy("127.0.0.1")).toBe(false);
    expect(isTrustedCloudSightProxy("203.0.113.10")).toBe(false);
  });

  it("ignores forged forwarding headers on an untrusted direct path", async () => {
    const direct = express();
    direct.set("trust proxy", isTrustedCloudSightProxy);
    direct.get("/ip", (req, res) => res.json({ ip: req.ip }));

    const response = await request(direct)
      .get("/ip")
      .set("X-Forwarded-For", "198.51.100.1, 203.0.113.2");

    expect(response.body.ip).not.toBe("198.51.100.1");
    expect(response.body.ip).not.toBe("203.0.113.2");
  });

  it("assigns independent login-rate-limit keys to distinct resolved clients", () => {
    const first = { ip: "198.51.100.10" } as Request;
    const second = { ip: "198.51.100.11" } as Request;

    expect(ipRateLimitKey(first)).not.toBe(ipRateLimitKey(second));
    expect(ipRateLimitKey(first)).toBe(ipRateLimitKey(first));
  });
});
