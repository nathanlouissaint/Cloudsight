import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const apiOrigin = "http://127.0.0.1:4100";
const password = "BrowserAuthPassword!123";
const captureFile = process.env.E2E_EMAIL_CAPTURE_FILE ?? "/tmp/cloudsight-e2e-email.jsonl";

async function waitForResetToken(email: string): Promise<string> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const messages = readFileSync(captureFile, "utf8")
        .trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
      const message = messages.find((entry) => entry.to === email && /reset/i.test(entry.subject ?? ""));
      const token = message?.text?.match(/token:\s*([^\s]+)/i)?.[1];
      if (token) return token;
    } catch { /* file may not exist until the backend writes it */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for password reset email");
}

async function createUser(page: import("@playwright/test").Page, suffix: string) {
  const email = `browser-${Date.now()}-${suffix}@example.test`;
  const response = await page.request.post(`${apiOrigin}/auth/register`, {
    data: { email, password },
  });
  expect(response.status()).toBe(201);
  return email;
}

test("logs in, navigates to protected UI, and restores the session after reload", async ({ page }) => {
  const email = await createUser(page, "login");
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await expect(page.getByText("CloudSight").first()).toBeVisible();

  const cookies = await page.context().cookies();
  const refreshCookie = cookies.find((cookie) => cookie.name === "refreshToken");
  expect(refreshCookie).toBeDefined();
  expect(refreshCookie?.httpOnly).toBe(true);
  expect(refreshCookie?.path).toBe("/auth");
  expect(await page.evaluate(() => document.cookie)).not.toContain("refreshToken");
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);

  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByText("Reporting Center")).toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
  expect(pageErrors, pageErrors.join("\n")).toEqual([]);
});

test("shows safe login failure and forgot/reset browser boundaries", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill("missing-browser-user@example.test");
  await page.getByPlaceholder("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/forgot-password", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill("unknown-browser-user@example.test");
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  await page.goto("/reset-password", { waitUntil: "networkidle" });
  await page.getByPlaceholder("New Password").fill("AnotherBrowserPassword!456");
  await page.getByPlaceholder("Confirm Password").fill("AnotherBrowserPassword!456");
  await page.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("This password reset link is invalid.")).toBeVisible();
});

test("logs out and does not restore protected access after reload", async ({ page }) => {
  const email = await createUser(page, "logout");
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();

  await page.getByRole("button", { name: "Log Out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login$/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.context().cookies()).some((cookie) => cookie.name === "refreshToken" && cookie.value.length > 0)).toBe(false);
});

test("registers through the browser", async ({ page }) => {
  const email = "browser-reset-journey@example.test";
  await page.goto("/register", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Full Name").fill("Browser Registration");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByPlaceholder("Confirm Password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("resends verification from the invalid-link recovery UI", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill("browser-reset-journey@example.test");
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await page.goto("/verify-email?token=invalid-resend-browser-token", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Resend verification email" }).click();
  await expect(page.getByText("Email verification request processed successfully.")).toBeVisible();
});

test("drops a browser session after its backing PostgreSQL session is revoked", async ({ page }) => {
  const email = await createUser(page, "revoked");
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();

  const accessToken = await page.evaluate(() => localStorage.getItem("cloudsight.accessToken"));
  const sessions = await page.request.get(`${apiOrigin}/auth/sessions`, { headers: { Authorization: `Bearer ${accessToken}` } });
  expect(sessions.ok()).toBe(true);
  const sessionId = (await sessions.json())[0].id as string;
  execFileSync("npx", ["tsx", "server/scripts/revoke-test-session.ts", sessionId], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "test", TEST_DATABASE_URL: "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public", DATABASE_URL: "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public" },
    stdio: "pipe",
  });

  await page.reload({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

test("verifies email through the browser using the isolated email capture bridge", async ({ page }) => {
  const email = await createUser(page, "verification");
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await page.goto("/verify-email?token=invalid-browser-token", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Resend verification email" })).toBeVisible();
  await page.getByRole("button", { name: "Resend verification email" }).click();
  await expect(page.getByText("Email verification request processed successfully.")).toBeVisible();
  const capture = readFileSync(process.env.E2E_EMAIL_CAPTURE_FILE!, "utf8");
  const token = capture.trim().split("\n").map((line) => JSON.parse(line)).filter((message) => message.subject.includes("Verify")).at(-1).text.match(/token: (\S+)/)[1];
  await page.goto(`/verify-email?token=${encodeURIComponent(token)}`, { waitUntil: "networkidle" });
  await expect(page.getByText("Email verified")).toBeVisible();
});

test("completes controlled federated login through the real browser callback", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await expect(page.getByText("CloudSight").first()).toBeVisible();
  const state = JSON.parse(execFileSync("npx", ["tsx", "server/scripts/assert-e2e-federated-state.ts", "cloudsight-e2e-federated@example.test"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "test", TEST_DATABASE_URL: "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public" },
    encoding: "utf8",
  }));
  expect(state.userId).toBeTruthy();
  expect(state.identityUserId).toBe(state.userId);
  expect(state.sessions).toBeGreaterThan(0);
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "refreshToken")?.httpOnly).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("cloudsight.accessToken"))).toBeTruthy();
  expect(await page.evaluate(() => document.cookie)).not.toContain("refreshToken");
  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
});

test("completes controlled Microsoft login through the real browser callback", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Continue with Microsoft" })).toBeVisible();
  await page.getByRole("button", { name: "Continue with Microsoft" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  const state = JSON.parse(execFileSync("npx", ["tsx", "server/scripts/assert-e2e-federated-state.ts", "cloudsight-e2e-controlled-microsoft@example.test", "MICROSOFT"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "test", TEST_DATABASE_URL: "postgresql://cloudsight_test_user:cloudsight_test_password@127.0.0.1:5434/cloudsight_test?schema=public" },
    encoding: "utf8",
  }));
  expect(state.userId).toBeTruthy();
  expect(state.identityUserId).toBe(state.userId);
  expect(state.sessions).toBeGreaterThan(0);
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "refreshToken")?.httpOnly).toBe(true);
  expect(await page.evaluate(() => Object.values(localStorage).join(" "))).not.toContain("microsoft");
  expect(await page.evaluate(() => Object.values(sessionStorage).join(" "))).not.toContain("microsoft");
  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
});

test("completes password reset through the real browser journey", async ({ page }) => {
  const email = "browser-reset-journey@example.test";
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await page.getByRole("button", { name: "Log Out" }).click();

  await page.goto("/forgot-password", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByRole("button", { name: "Send Reset Link" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  const token = await waitForResetToken(email);
  const resetUrl = `/reset-password?token=${encodeURIComponent(token)}`;
  await page.goto(resetUrl, { waitUntil: "networkidle" });
  const newPassword = "BrowserResetPassword!456";
  await page.getByPlaceholder("New Password").fill(newPassword);
  await page.getByPlaceholder("Confirm Password").fill(newPassword);
  await page.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("Your password has been updated.")).toBeVisible();
  expect(await page.evaluate(() => Object.values(localStorage).join(" "))).not.toContain(token);
  expect(await page.evaluate(() => Object.values(sessionStorage).join(" "))).not.toContain(token);
  expect(await page.evaluate(() => Object.values(localStorage).join(" "))).not.toContain(password);
  expect(await page.evaluate(() => Object.values(sessionStorage).join(" "))).not.toContain(password);

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(newPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  await page.goto("/reports", { waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("Reporting Center")).toBeVisible();

  await page.goto(resetUrl, { waitUntil: "networkidle" });
  await page.getByPlaceholder("New Password").fill("ReplayPassword!789");
  await page.getByPlaceholder("Confirm Password").fill("ReplayPassword!789");
  await page.getByRole("button", { name: "Reset Password" }).click();
  await expect(page.getByText("Invalid reset token.")).toBeVisible();
});
