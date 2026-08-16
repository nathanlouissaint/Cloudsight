import { spawnSync } from "node:child_process";
import { validateTestDatabaseUrl } from "../tests/integration/helpers/test-database";

const databaseUrl = validateTestDatabaseUrl();
const result = spawnSync("npx", ["vitest", "run", "tests/integration/auth-persistence.integration.test.ts"], {
  cwd: process.cwd(),
  env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: "test" },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
