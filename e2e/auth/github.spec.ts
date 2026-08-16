import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";

import { readBrowserStorage } from "../helpers/browser-state";

const apiOrigin = "http://127.0.0.1:4100";
const githubEmail = "cloudsight-e2e-controlled-github@example.test";
const githubSubject = "9001001";
const testDatabaseUrl = "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public";

function runGitHubUserHelper(command: "seed-local" | "remove-local") {
  execFileSync("npx", ["tsx", "server/scripts/manage-e2e-github-user.ts", command], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      TEST_DATABASE_URL: testDatabaseUrl,
      DATABASE_URL: testDatabaseUrl,
    },
    stdio: "pipe",
  });
}

function readGitHubState() {
  return JSON.parse(execFileSync(
    "npx",
    ["tsx", "server/scripts/assert-e2e-federated-state.ts", githubEmail, "GITHUB"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "test",
        TEST_DATABASE_URL: testDatabaseUrl,
        DATABASE_URL: testDatabaseUrl,
      },
      encoding: "utf8",
    },
  ));
}

test("deterministically closes the GitHub browser authentication journey", async ({ page }) => {
  test.setTimeout(60_000);
  const browserRequests: string[] = [];
  const authResponseBodies: string[] = [];
  page.on("request", (request) => browserRequests.push(request.url()));
  page.on("response", async (response) => {
    if (response.url().startsWith(`${apiOrigin}/auth/`)) {
      try {
        authResponseBodies.push(await response.text());
      } catch {
        // Redirect and empty responses do not necessarily expose a body.
      }
    }
  });

  runGitHubUserHelper("seed-local");

  await page.goto("/login", { waitUntil: "networkidle" });
  const googleButton = page.getByRole("button", { name: "Continue with Google" });
  const microsoftButton = page.getByRole("button", { name: "Continue with Microsoft" });
  const githubButton = page.getByRole("button", { name: "Continue with GitHub" });
  await expect(googleButton).toBeVisible();
  await expect(microsoftButton).toBeVisible();
  await expect(githubButton).toBeVisible();
  await expect(googleButton.locator("svg[aria-hidden='true']")).toHaveCount(1);
  await expect(microsoftButton.locator("svg[aria-hidden='true']")).toHaveCount(1);
  await expect(githubButton.locator("svg.github-login-icon[aria-hidden='true']")).toHaveCount(1);
  await expect(githubButton).toHaveAttribute("type", "button");

  await githubButton.click();
  await expect(page).toHaveURL(/\/login\?authError=account_link_required$/);
  await expect(page.getByRole("alert")).toContainText("An account already exists for this email");
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  let state = readGitHubState();
  expect(state.identityUserId).toBeNull();
  expect(state.sessions).toBe(0);
  expect((await page.context().cookies()).some((cookie) => cookie.name === "refreshToken")).toBe(false);

  runGitHubUserHelper("remove-local");

  await page.getByRole("button", { name: "Continue with GitHub" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await expect(page.getByText("CloudSight").first()).toBeVisible();

  const callbackUrl = browserRequests.find((url) => new URL(url).pathname === "/auth/oauth/github/callback");
  expect(browserRequests.some((url) => new URL(url).pathname === "/auth/oauth/github/start")).toBe(true);
  expect(callbackUrl).toBeTruthy();
  expect(browserRequests.every((url) => !["github.com", "api.github.com"].includes(new URL(url).hostname))).toBe(true);

  state = readGitHubState();
  expect(state).toMatchObject({
    providerKind: "GITHUB",
    issuer: "https://github.com",
    providerSubject: githubSubject,
    userEmail: githubEmail,
    users: 1,
    identities: 1,
    sessions: 1,
    activeSessions: 1,
  });
  expect(state.identityUserId).toBe(state.userId);
  expect(state.persistence).not.toMatch(/access_token|accessToken|cloudsight-e2e-controlled-code/i);

  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "refreshToken")?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("refreshToken");
  const storage = await readBrowserStorage(page);
  const browserVisibleState = JSON.stringify({
    url: page.url(),
    dom: await page.locator("body").innerText(),
    storage,
    cookies: await page.evaluate(() => document.cookie),
    responses: authResponseBodies,
  });
  expect(browserVisibleState).not.toMatch(/cloudsight-e2e-controlled-code|access_token|github provider token/i);
  const accessToken = storage.localStorage["cloudsight.accessToken"];
  expect(accessToken).toBeTruthy();
  const jwtPayload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"));
  expect(jwtPayload).not.toHaveProperty("providerKind");
  expect(jwtPayload).not.toHaveProperty("providerToken");
  expect(JSON.stringify(jwtPayload)).not.toMatch(/access_token|cloudsight-e2e-controlled-code/i);

  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
  const refreshed = page.waitForResponse((response) =>
    response.url() === `${apiOrigin}/auth/refresh` &&
    response.request().method() === "POST" &&
    response.status() === 200,
  );
  await page.reload({ waitUntil: "networkidle" });
  await refreshed;
  await expect(page.getByText("Reporting Center")).toBeVisible();
  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login$/);

  const callbackCountBeforeReturning = browserRequests.filter((url) => new URL(url).pathname === "/auth/oauth/github/callback").length;
  await page.getByRole("button", { name: "Continue with GitHub" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  const returningCallbacks = browserRequests.filter((url) => new URL(url).pathname === "/auth/oauth/github/callback");
  expect(returningCallbacks).toHaveLength(callbackCountBeforeReturning + 1);
  const replayUrl = returningCallbacks.at(-1)!;

  const returningState = readGitHubState();
  expect(returningState.userId).toBe(state.userId);
  expect(returningState.identityUserId).toBe(state.userId);
  expect(returningState.users).toBe(1);
  expect(returningState.identities).toBe(1);
  expect(returningState.sessions).toBe(2);
  expect(returningState.activeSessions).toBe(1);

  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.context().cookies()).some((cookie) => cookie.name === "refreshToken" && cookie.value)).toBe(false);

  const sessionsBeforeReplay = readGitHubState().sessions;
  await page.goto(replayUrl, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login\?authError=oauth_failed$/);
  await expect(page.getByRole("alert")).toHaveText("Federated sign-in could not be completed.");
  expect(page.url()).not.toContain("state=");
  expect(page.url()).not.toContain("code=");
  const replayState = readGitHubState();
  expect(replayState.users).toBe(1);
  expect(replayState.identities).toBe(1);
  expect(replayState.sessions).toBe(sessionsBeforeReplay);
  expect(replayState.activeSessions).toBe(0);
  expect(browserRequests.every((url) => !["github.com", "api.github.com"].includes(new URL(url).hostname))).toBe(true);
});
