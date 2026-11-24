import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { PortfolioReturn } from "../src/features/forma/PortfolioReturn";
import { analytics } from "../src/lib/analytics";

test("Forma return link targets the CloudSight homepage without nested controls", () => {
  const html = renderToStaticMarkup(<MemoryRouter><PortfolioReturn /></MemoryRouter>);
  assert.match(html, /href="\/"/);
  assert.match(html, /Back to CloudSight/);
  assert.equal((html.match(/<a\b/g) ?? []).length, 1);
});
test("portfolio events do not send when analytics consent is absent or rejected", () => {
  let calls = 0;
  const savedWindow = globalThis.window;
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: () => null }, gtag: () => calls++, fbq: () => calls++ } });
    analytics.track("portfolio_live_demo_clicked", { project: "forma" });
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: () => JSON.stringify({ analytics: false, marketing: true }) }, gtag: () => calls++, fbq: () => calls++ } });
    analytics.track("portfolio_booking_clicked", { project: "forma" });
    assert.equal(calls, 0);
  } finally { Object.defineProperty(globalThis, "window", { configurable: true, value: savedWindow }); }
});
