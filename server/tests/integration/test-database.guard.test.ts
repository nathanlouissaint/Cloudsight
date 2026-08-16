import { describe, expect, it } from "vitest";
import { TEST_DATABASE_NAME, validateTestDatabaseUrl } from "./helpers/test-database";

const validUrl =
  "postgresql://test_user:SECRET_DB_PASSWORD@127.0.0.1:5434/cloudsight_test?schema=public";

describe("test database safety guard", () => {
  it("accepts the explicitly isolated local test database", () => {
    expect(validateTestDatabaseUrl(validUrl, "test")).toBe(validUrl);
  });

  it.each([
    ["development environment", validUrl, "development"],
  ["missing URL", "", "test"],
    ["development database", validUrl.replace(TEST_DATABASE_NAME, "cloudsight"), "test"],
    ["production-like database", validUrl.replace(TEST_DATABASE_NAME, "production"), "test"],
    ["malformed URL", "not-a-url", "test"],
    ["remote host", validUrl.replace("127.0.0.1", "db.example.com"), "test"],
  ])("rejects %s", (_label, url, env) => {
    expect(() => validateTestDatabaseUrl(url, env)).toThrow();
  });

  it("does not echo a database password in safety errors", () => {
    let thrown: unknown;
    try {
      validateTestDatabaseUrl(validUrl.replace(TEST_DATABASE_NAME, "cloudsight"), "test");
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).not.toContain("SECRET_DB_PASSWORD");
  });
});
