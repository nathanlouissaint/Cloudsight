import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NODE_ENV = "test";
  process.env.CSRF_SECRET = "test-only-csrf-secret-material-32-bytes-minimum";
});

import {
  CsrfService,
  CsrfValidationError,
  resolveCsrfSecret,
} from "../../src/services/auth/csrf.service";

describe("CSRF service security", () => {
  let service: CsrfService;

  beforeEach(() => {
    service = new CsrfService();
  });

  it("accepts a valid refresh-bound token and rejects tampering", () => {
    const issued = service.issueRefreshBoundToken("FRESH_REFRESH_TOKEN");

    expect(service.validateRefreshBoundToken(issued.token, "FRESH_REFRESH_TOKEN")).toMatchObject({
      version: "v1",
    });
    expect(() => service.validateRefreshBoundToken(`${issued.token}tampered`, "FRESH_REFRESH_TOKEN"))
      .toThrow(CsrfValidationError);
  });

  it("rejects a token bound to a different refresh token", () => {
    const issued = service.issueRefreshBoundToken("REFRESH_A");

    expect(() => service.validateRefreshBoundToken(issued.token, "REFRESH_B"))
      .toThrow(CsrfValidationError);
  });

  it("rejects missing refresh-token binding", () => {
    const issued = service.issueRefreshBoundToken("REFRESH_A");

    expect(() => service.validateRefreshBoundToken(issued.token, ""))
      .toThrow(CsrfValidationError);
  });
});

describe("CSRF startup configuration", () => {
  it("permits an ephemeral fallback only in explicit development", () => {
    expect(
      resolveCsrfSecret({
        NODE_ENV: "development",
      }),
    ).toHaveLength(32);

    expect(() =>
      resolveCsrfSecret({
        NODE_ENV: "production",
      }),
    ).toThrow(
      "CSRF_SECRET must be configured outside development",
    );
    expect(() => resolveCsrfSecret({})).toThrow(
      "CSRF_SECRET must be configured outside development",
    );
  });

  it("keeps the development entry point explicit", async () => {
    const { readFile } = await import(
      "node:fs/promises"
    );
    const packageJson = JSON.parse(
      await readFile(
        new URL(
          "../../package.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ) as { scripts: { dev: string } };
    const developmentEntry = await readFile(
      new URL(
        "../../src/dev.ts",
        import.meta.url,
      ),
      "utf8",
    );

    expect(packageJson.scripts.dev).toContain(
      "src/dev.ts",
    );
    expect(developmentEntry).toContain(
      'process.env.NODE_ENV ??= "development"',
    );
  });
});
