import type { BrowserContext, Page } from "@playwright/test";

export async function readCookieNames(context: BrowserContext): Promise<string[]> {
  const cookies = await context.cookies();
  return cookies.map((cookie) => cookie.name);
}

export async function readBrowserStorage(page: Page): Promise<{
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
}> {
  return page.evaluate(() => ({
    localStorage: Object.fromEntries(Object.entries(localStorage)),
    sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
  }));
}
