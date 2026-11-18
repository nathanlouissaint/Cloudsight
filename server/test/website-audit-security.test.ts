import assert from "node:assert/strict";
import test from "node:test";
import { isPrivateAddress } from "../src/services/website-audit-url-security.service";
import { extractHomepageEvidence } from "../src/services/website-audit-extractor.service";

test("blocks private, metadata, loopback, and IPv6 internal addresses", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.0.1", "169.254.169.254", "::1", "fc00::1", "fe80::1"]) assert.equal(isPrivateAddress(address), true);
  assert.equal(isPrivateAddress("93.184.216.34"), false);
});

test("reports missing homepage metadata from direct HTML evidence", () => {
  const result = extractHomepageEvidence("<html><body><h2>Product details</h2><a href='/demo'>Book a demo</a><form><input name='email'></form></body></html>", "https://example.com/");
  assert.equal(result.metadata.title, null);
  assert.equal(result.metadata.h1.length, 0);
  assert.equal(result.metadata.ctas[0]?.text, "Book a demo");
  assert.equal(result.findings.length, 4);
});
