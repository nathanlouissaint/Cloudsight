import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveTrustedFrontendOrigin,
} from "../../src/config/http-security.config";
import {
  resolveCsrfSecret,
} from "../../src/services/auth/csrf.service";

const root = resolve(import.meta.dirname, "../../..");
const read = (path: string) =>
  readFileSync(resolve(root, path), "utf8");

describe("production authentication deployment configuration", () => {
  it("fails closed without CSRF and CORS configuration and accepts valid explicit values", () => {
    expect(() => resolveCsrfSecret({ NODE_ENV: "production" })).toThrow();
    expect(() => resolveTrustedFrontendOrigin({ NODE_ENV: "production" })).toThrow();

    expect(resolveCsrfSecret({
      NODE_ENV: "production",
      CSRF_SECRET: "production-test-only-csrf-material-at-least-32-bytes",
    }).toString("utf8")).toBe("production-test-only-csrf-material-at-least-32-bytes");
    expect(resolveTrustedFrontendOrigin({
      NODE_ENV: "production",
      CORS_ORIGIN: "https://cloudsight.example",
    })).toBe("https://cloudsight.example");
  });

  it("wires required values from SSM through staging and Docker Compose", () => {
    const staging = read("scripts/stage-assets.sh");
    const compose = read("docker-compose.prod.yml");
    const template = read("config/.env.production.template");

    expect(staging).toContain("/cloudsight/production/csrf/secret");
    expect(staging).toContain("/cloudsight/production/http/cors-origin");
    expect(compose).toContain("CSRF_SECRET: ${CSRF_SECRET:?CSRF_SECRET is required}");
    expect(compose).toContain("CORS_ORIGIN: ${CORS_ORIGIN:?CORS_ORIGIN is required}");
    expect(template).toContain("CSRF_SECRET=CHANGE_ME");
    expect(template).toContain("CORS_ORIGIN=CHANGE_ME");
  });

  it("keeps OAuth secrets server-side while exposing only explicit public build flags", () => {
    const dockerfile = read("client/Dockerfile");
    const publish = read(".github/workflows/publish.yml");
    const compose = read("docker-compose.prod.yml");

    expect(dockerfile).toContain("ARG PUBLIC_MICROSOFT_LOGIN_ENABLED=false");
    expect(dockerfile).toContain("ARG PUBLIC_GITHUB_LOGIN_ENABLED=false");
    expect(dockerfile).toContain('VITE_MICROSOFT_AUTH_ENABLED="${PUBLIC_MICROSOFT_LOGIN_ENABLED}"');
    expect(dockerfile).toContain('VITE_GITHUB_AUTH_ENABLED="${PUBLIC_GITHUB_LOGIN_ENABLED}"');
    expect(publish).toContain("PUBLIC_MICROSOFT_LOGIN_ENABLED=${{ vars.VITE_MICROSOFT_AUTH_ENABLED || 'false' }}");
    expect(publish).toContain("PUBLIC_GITHUB_LOGIN_ENABLED=${{ vars.VITE_GITHUB_AUTH_ENABLED || 'false' }}");
    expect(dockerfile).not.toMatch(/VITE_.*(?:SECRET|CLIENT_ID)/);
    expect(compose).toContain("GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:-}");
  });

  it("uses root workspace Docker build contexts and the ALB-facing port", () => {
    for (const workflow of [".github/workflows/docker.yml", ".github/workflows/publish.yml"]) {
      expect(read(workflow)).toContain("context: .");
      expect(read(workflow)).not.toContain("context: ./client");
      expect(read(workflow)).not.toContain("context: ./server");
    }
    expect(read("docker-compose.prod.yml")).toContain('- "80:80"');
  });

  it("guards the browser verification effect against StrictMode duplication", () => {
    const page = read("client/src/pages/VerifyEmailPage.tsx");

    expect(page).toContain("const verificationStarted = useRef(false)");
    expect(page).toContain("if (verificationStarted.current) return");
    expect(page).toContain("verificationStarted.current = true");
  });
});
