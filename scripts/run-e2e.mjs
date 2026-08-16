import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import process from "node:process";
import { unlinkSync } from "node:fs";
import net from "node:net";

const root = process.cwd();
const testDatabaseUrl =
  "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public";
const frontendOrigin = "http://127.0.0.1:4174";
const backendOrigin = "http://127.0.0.1:4100";
const environment = {
  ...process.env,
  NODE_ENV: "test",
  TEST_DATABASE_URL: testDatabaseUrl,
  DATABASE_URL: testDatabaseUrl,
  PORT: "4100",
  CORS_ORIGIN: frontendOrigin,
  FRONTEND_URL: frontendOrigin,
  VITE_API_URL: backendOrigin,
  VITE_MICROSOFT_AUTH_ENABLED: "true",
  VITE_GITHUB_AUTH_ENABLED: "true",
  JWT_SECRET: "e2e-only-jwt-secret-material-32-bytes",
  CSRF_SECRET: "e2e-only-csrf-secret-material-32-bytes",
  E2E_EMAIL_CAPTURE_FILE: `/tmp/cloudsight-e2e-email-${process.pid}.jsonl`,
  CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER: "1",
};

const children = [];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (${result.status ?? "signal"})`);
  }
}

function start(command, args) {
  const child = spawn(command, args, {
    cwd: root,
    env: environment,
    detached: true,
    stdio: "inherit",
  });
  children.push(child);
  return child;
}

async function waitFor(label, check, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`);
}

async function waitForHttp(url) {
  await waitFor(url, async () => {
    const response = await fetch(url);
    return response.ok;
  });
}

async function waitForPostgres() {
  await waitFor("postgres-test health", () => {
    const result = spawnSync("docker", ["inspect", "-f", "{{.State.Health.Status}}", "cloudsight-postgres-test"], {
      cwd: root,
      env: environment,
      encoding: "utf8",
    });
    return result.status === 0 && result.stdout.trim() === "healthy";
  });
}

function verifyDatabaseIdentity() {
  const result = spawnSync("docker", [
    "exec", "cloudsight-postgres-test", "psql", "-U", "cloudsight_test_user",
    "-d", "cloudsight_test", "-Atqc", "SELECT current_database(), current_user;",
  ], { cwd: root, env: environment, encoding: "utf8" });
  if (result.status !== 0 || result.stdout.trim() !== "cloudsight_test|cloudsight_test_user") {
    throw new Error("E2E database identity check failed");
  }
}

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("error", () => resolve(false));
    socket.setTimeout(250, () => { socket.destroy(); resolve(false); });
  });
}

async function stopChildren() {
  for (const child of children.reverse()) {
    if (!child.pid) continue;
    try { process.kill(-child.pid, "SIGTERM"); } catch { /* already stopped */ }
  }
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline && (await portIsOpen(4100) || await portIsOpen(4174))) {
    await delay(100);
  }
}

let databaseStarted = false;
try {
  run("npm", ["run", "test:db:up", "--workspace=server"]);
  databaseStarted = true;
  await waitForPostgres();
  run("npm", ["run", "test:db:migrate", "--workspace=server"]);
  verifyDatabaseIdentity();

  start("npm", ["run", "dev", "--workspace=server"]);
  await waitForHttp(`${backendOrigin}/health/ready`);

  start("npm", ["run", "dev", "--workspace=client", "--", "--host", "127.0.0.1", "--port", "4174", "--strictPort"]);
  await waitForHttp(`${frontendOrigin}/login`);

  run("npx", ["playwright", "test", "--config=playwright.config.ts", ...process.argv.slice(2)]);
} finally {
  await stopChildren();
  if (databaseStarted) {
    try { run("npm", ["run", "test:db:down", "--workspace=server"]); } catch { /* preserve original failure */ }
  }
  try { unlinkSync(environment.E2E_EMAIL_CAPTURE_FILE); } catch { /* absent */ }
}
