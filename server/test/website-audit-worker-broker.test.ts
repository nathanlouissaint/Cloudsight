import assert from "node:assert/strict";
import test from "node:test";
import { auditWorkerResultRequest } from "../src/contracts/website-audit-worker-broker.contract";
import { auditWorkerBrokerAuthorized } from "../src/services/website-audit-worker-broker-auth.service";
import { processNextBrokeredAuditJob } from "../src/services/website-audit-brokered-worker.service";
import type { AuditNetworkTransport } from "../src/services/website-audit-url-security.service";

test("worker broker authentication is constant-time and rejects absent or incorrect credentials", () => {
  const secret = "a".repeat(32);
  assert.equal(auditWorkerBrokerAuthorized(`Bearer ${secret}`, secret), true);
  assert.equal(auditWorkerBrokerAuthorized(`Bearer ${"b".repeat(32)}`, secret), false);
  assert.equal(auditWorkerBrokerAuthorized(undefined, secret), false);
  assert.equal(auditWorkerBrokerAuthorized(`Bearer ${secret}`, "short"), false);
});

test("worker result validation bounds untrusted crawler output", () => {
  const valid = auditWorkerResultRequest.safeParse({ auditedUrl: "https://fixture.example/", metadata: { title: "Fixture", metaDescription: null, canonicalUrl: null, robots: null, language: "en", h1: ["Secure SaaS audits"], h2: [], ctas: [{ text: "Book a demo", href: "/demo" }], internalNavigation: [], forms: [], mainText: "Fixture page" } });
  assert.equal(valid.success, true);
  const invalid = auditWorkerResultRequest.safeParse({ auditedUrl: "https://fixture.example/", metadata: { ...valid.success ? valid.data.metadata : {}, h1: Array.from({ length: 31 }, () => "too many") } });
  assert.equal(invalid.success, false);
});

test("brokered worker sends extracted evidence only and never requires a database credential", async () => {
  const previous = { broker: process.env.AUDIT_WORKER_BROKER_URL, token: process.env.AUDIT_WORKER_BROKER_TOKEN, isolation: process.env.AUDIT_CRAWLER_NETWORK_ISOLATION, database: process.env.DATABASE_URL };
  process.env.AUDIT_WORKER_BROKER_URL = "https://broker.example";
  process.env.AUDIT_WORKER_BROKER_TOKEN = "x".repeat(32);
  process.env.AUDIT_CRAWLER_NETWORK_ISOLATION = "enabled";
  delete process.env.DATABASE_URL;
  const calls: { url: string; body?: string }[] = [];
  const brokerTransport = async (url: string, init: { body: string }) => {
    calls.push({ url: String(url), body: typeof init?.body === "string" ? init.body : undefined });
    if (String(url).endsWith("/claim")) return { status: 200, body: JSON.stringify({ job: { id: "job-1", normalizedUrl: "https://fixture.example/" } }) };
    return { status: 204, body: "" };
  };
  const transport: AuditNetworkTransport = {
    resolve: async () => [{ address: "93.184.216.34", family: 4 }],
    request: async (url) => url.pathname === "/robots.txt" ? { status: 404, headers: {}, body: "" } : { status: 200, headers: { "content-type": "text/html" }, body: "<title>Fixture</title><meta name='description' content='Audit fixture'><h1>Secure SaaS audits</h1><a href='/demo'>Book a demo</a>" },
  };
  try {
    assert.equal(await processNextBrokeredAuditJob("audit-test", transport, brokerTransport), true);
    assert.equal(calls.length, 2);
    assert.match(calls[1].url, /jobs\/job-1\/complete$/);
    assert.match(calls[1].body ?? "", /Secure SaaS audits/);
    assert.doesNotMatch(calls[1].body ?? "", /OPENAI_API_KEY|DATABASE_URL/);
  } finally {
    process.env.AUDIT_WORKER_BROKER_URL = previous.broker;
    process.env.AUDIT_WORKER_BROKER_TOKEN = previous.token;
    process.env.AUDIT_CRAWLER_NETWORK_ISOLATION = previous.isolation;
    if (previous.database) process.env.DATABASE_URL = previous.database;
  }
});
