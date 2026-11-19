import assert from "node:assert/strict";
import test from "node:test";
import { analyzeHomepageConversion, type HomepageAuditMetadata } from "../src/services/website-audit-conversion-analysis.service";

const source = "https://fixture.test/";
const clearMetadata: HomepageAuditMetadata = {
  title: "CloudSight | SaaS website design",
  metaDescription: "CloudSight helps B2B SaaS teams clarify their website and create stronger signup paths.",
  h1: ["Website design for B2B SaaS teams"],
  h2: ["Clarify your product story"],
  ctas: [{ text: "Book a demo", href: "/demo" }],
  internalNavigation: [{ text: "Pricing", href: "/pricing" }],
  forms: [],
};

test("does not flag a clear headline and descriptive CTA", () => {
  assert.deepEqual(analyzeHomepageConversion(clearMetadata, source), []);
});

test("reports missing primary headline and missing metadata from direct evidence", () => {
  const findings = analyzeHomepageConversion({ ...clearMetadata, metaDescription: null, h1: [] }, source);
  assert.deepEqual(findings.map((finding) => finding.id), ["missing-meta-description", "missing-primary-headline"]);
  assert.equal(findings[0]?.confidence, "high");
  assert.match(findings[1]?.observedEvidence ?? "", /No H1/);
});

test("reports a generic primary headline with observed text", () => {
  const findings = analyzeHomepageConversion({ ...clearMetadata, h1: ["Welcome"] }, source);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "unclear-primary-headline");
  assert.match(findings[0]?.observedEvidence ?? "", /Welcome/);
});

test("reports generic CTA labels without inferring conversion performance", () => {
  const findings = analyzeHomepageConversion({ ...clearMetadata, ctas: [{ text: "Learn more", href: "/product" }] }, source);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "generic-cta-label");
  assert.match(findings[0]?.recommendedAction ?? "", /CTA labels/);
});

test("returns no findings when the available signals are insufficient", () => {
  const findings = analyzeHomepageConversion({ ...clearMetadata, title: null, h1: ["A distinctive product name"], ctas: [{ text: "View product", href: "/product" }], internalNavigation: [], forms: [] }, source);
  assert.deepEqual(findings, []);
});

test("reports no detectable next step only when no CTA or form is present", () => {
  const findings = analyzeHomepageConversion({ ...clearMetadata, ctas: [], forms: [] }, source);
  assert.deepEqual(findings.map((finding) => finding.id), ["missing-obvious-next-step"]);
  assert.equal(findings[0]?.confidence, "medium");
});

test("produces deterministic findings for the same extracted evidence", () => {
  const metadata = { ...clearMetadata, metaDescription: null, h1: ["Welcome"], ctas: [{ text: "Learn more", href: "/product" }] };
  assert.deepEqual(analyzeHomepageConversion(metadata, source), analyzeHomepageConversion(metadata, source));
});
