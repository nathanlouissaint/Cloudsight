export const TEST_DATABASE_NAME = "cloudsight_test";

const ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "postgres-test"]);

export function validateTestDatabaseUrl(
  rawUrl: string | undefined = process.env.TEST_DATABASE_URL,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string {
  if (nodeEnv !== "test") {
    throw new Error("Test database requires NODE_ENV=test");
  }

  if (!rawUrl) {
    throw new Error("TEST_DATABASE_URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL URL");
  }

  const databaseName = decodeURIComponent(parsed.pathname.slice(1));
  if (parsed.protocol !== "postgresql:" || databaseName !== TEST_DATABASE_NAME) {
    throw new Error(`TEST_DATABASE_URL must target database ${TEST_DATABASE_NAME}`);
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`TEST_DATABASE_URL host is not an approved local test host: ${parsed.hostname}`);
  }

  return parsed.toString();
}
