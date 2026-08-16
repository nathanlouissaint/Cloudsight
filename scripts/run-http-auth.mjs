import { spawnSync } from "node:child_process";

const root = process.cwd();
const url = "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public";
const env = { ...process.env, NODE_ENV: "test", TEST_DATABASE_URL: url, DATABASE_URL: url, CORS_ORIGIN: "http://127.0.0.1:4174", JWT_SECRET: "http-only-jwt-secret-material-32-bytes", CSRF_SECRET: "http-only-csrf-secret-material-32-bytes" };
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed`);
}
let started = false;
try {
  run("npm", ["run", "test:db:up", "--workspace=server"]);
  started = true;
  run("npm", ["run", "test:db:migrate", "--workspace=server"]);
  run("npm", ["run", "test:http:auth", "--workspace=server"]);
} finally {
  if (started) {
    try { run("npm", ["run", "test:db:down", "--workspace=server"]); } catch { /* preserve original failure */ }
  }
}
