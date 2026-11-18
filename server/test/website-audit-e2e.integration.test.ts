import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { prisma } from "../src/config/prisma";
import { createAuditJob, getAuditByToken, processNextAuditJob } from "../src/services/website-audit-job.service";
import type { AuditNetworkTransport } from "../src/services/website-audit-url-security.service";

const domain = "fixture-audit.test";
const html = "<html lang='en'><head><title>Fixture SaaS</title><meta name='description' content='A fixture product.'><link rel='canonical' href='https://fixture-audit.test/'></head><body><h1>Make audits clear</h1><h2>For SaaS teams</h2><a href='/demo'>Book a demo</a></body></html>";
const transport: AuditNetworkTransport = { resolve: async () => [{ address: "93.184.216.34", family: 4 }], request: async (url) => url.pathname === "/robots.txt" ? { status: 404, headers: {}, body: "" } : { status: 200, headers: { "content-type": "text/html" }, body: html } };
let jobId = "";
before(() => { if (!process.env.DATABASE_URL?.includes("cloudsight_test")) throw new Error("Requires cloudsight_test"); process.env.AUDIT_CRAWLER_NETWORK_ISOLATION = "enabled"; });
afterEach(async () => { if (jobId) { await prisma.websiteAuditReport.deleteMany({ where: { auditJobId: jobId } }); await prisma.websiteAuditJob.delete({ where: { id: jobId } }).catch(() => undefined); jobId = ""; } });
after(async () => { delete process.env.AUDIT_CRAWLER_NETWORK_ISOLATION; await prisma.$disconnect(); });
test("processes fixture HTML and authorizes only valid unexpired report tokens", async () => { const created = await createAuditJob(`https://${domain}/`, undefined, transport); jobId = created.job.id; assert.ok(created.token); await processNextAuditJob("fixture-worker", transport); const report = await getAuditByToken(created.token!); assert.equal(report?.status, "COMPLETED"); const metadata = report?.report?.metadata as { title: string; metaDescription: string; h1: string[]; h2: string[]; ctas: { text: string }[] }; assert.equal(metadata.title, "Fixture SaaS"); assert.equal(metadata.metaDescription, "A fixture product."); assert.deepEqual(metadata.h1, ["Make audits clear"]); assert.deepEqual(metadata.h2, ["For SaaS teams"]); assert.equal(metadata.ctas[0]?.text, "Book a demo"); assert.equal(await getAuditByToken("invalid-token"), null); await prisma.websiteAuditJob.update({ where: { id: jobId }, data: { expiresAt: new Date(Date.now() - 1) } }); assert.equal(await getAuditByToken(created.token!), null); });
