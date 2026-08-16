import { spawnSync } from "node:child_process";
import { validateTestDatabaseUrl } from "../tests/integration/helpers/test-database";

const testDatabaseUrl = validateTestDatabaseUrl();
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  cwd: process.cwd(),
  env: { ...process.env, DATABASE_URL: testDatabaseUrl, NODE_ENV: "test" },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
