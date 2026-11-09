import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getWebsiteAuditBookingAnalyticsProperties,
  getWebsiteAuditBookingUrl,
} from "../src/website-audit/booking";

test("accepts configured HTTP(S) Website Audit booking URLs", () => {
  assert.equal(getWebsiteAuditBookingUrl(" https://book.example.com/cloudsight "), "https://book.example.com/cloudsight");
});

test("does not produce a booking CTA URL for absent or unsafe configuration", () => {
  assert.equal(getWebsiteAuditBookingUrl(undefined), null);
  assert.equal(getWebsiteAuditBookingUrl("javascript:alert(1)"), null);
  assert.equal(getWebsiteAuditBookingUrl("not a url"), null);
});

test("booking analytics properties contain only approved form context", () => {
  assert.deepEqual(
    getWebsiteAuditBookingAnalyticsProperties("$10K–$20K", "1–3 months"),
    { budget_range: "$10K–$20K", launch_timeline: "1–3 months", source: "website_audit_success" },
  );
});
