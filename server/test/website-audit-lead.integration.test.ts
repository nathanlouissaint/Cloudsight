import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { WebsiteAuditLead } from "@prisma/client";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import {
  resetWebsiteAuditLeadNotifierForTesting,
  setWebsiteAuditLeadNotifierForTesting,
} from "../src/services/website-audit-notification.service";

const runId = randomUUID();
const emailPrefix = `website-audit-${runId}`;
let server: Server;
let baseUrl: string;
let notifiedLeads: WebsiteAuditLead[] = [];
let notificationShouldFail = false;

function payload(suffix = "valid") {
  return {
    firstName: "Ada", lastName: "Lovelace",
    workEmail: `${emailPrefix}-${suffix}@example.test`,
    company: "CloudSight Test Technology",
    websiteUrl: "https://example.test/platform",
    companyDescription: "B2B technology services for operations teams.",
    websiteProblem: "Our value proposition is difficult to understand.",
    launchTimeline: "1–3 months",
    budgetRange: "$10K–$20K",
    honeypot: "",
  };
}

async function submit(body: Record<string, string>) {
  const response = await fetch(`${baseUrl}/website-audit/leads`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return { response, body: await response.json() as Record<string, unknown> };
}

before(async () => {
  if (!process.env.DATABASE_URL?.includes("cloudsight_test")) throw new Error("Website audit integration tests require cloudsight_test.");
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  setWebsiteAuditLeadNotifierForTesting({
    async notifyNewWebsiteAuditLead(lead) {
      if (notificationShouldFail) {
        throw new Error("Test notification failure");
      }
      notifiedLeads.push(lead);
      return "sent";
    },
  });
});

afterEach(async () => {
  await prisma.websiteAuditLead.deleteMany({ where: { workEmail: { startsWith: emailPrefix } } });
  notifiedLeads = [];
  notificationShouldFail = false;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  resetWebsiteAuditLeadNotifierForTesting();
  await prisma.$disconnect();
});

test("persists a valid website audit request with normalized fields", async () => {
  const input = { ...payload(), workEmail: `  ${emailPrefix}-normalized@EXAMPLE.TEST `, websiteUrl: "https://example.test/platform" };
  const result = await submit(input);
  assert.equal(result.response.status, 201);
  assert.equal(result.body.success, true);
  assert.equal(typeof result.body.leadId, "string");
  const lead = await prisma.websiteAuditLead.findUnique({ where: { id: result.body.leadId as string } });
  assert.equal(lead?.workEmail, `${emailPrefix}-normalized@example.test`);
  assert.equal(lead?.websiteUrl, "https://example.test/platform");
  assert.equal(lead?.status, "NEW");
  assert.equal(lead?.companyDescription, input.companyDescription);
  assert.equal(notifiedLeads.length, 1);
  assert.equal(notifiedLeads[0]?.id, result.body.leadId);
  assert.equal(notifiedLeads[0]?.company, input.company);
  assert.equal(notifiedLeads[0]?.workEmail, `${emailPrefix}-normalized@example.test`);
});

test("accepts the minimal audit request and defaults optional qualification fields", async () => {
  const input = {
    firstName: "Ada",
    workEmail: `${emailPrefix}-minimal@example.test`,
    company: "CloudSight Test Technology",
    websiteUrl: "https://example.test/minimal",
    websiteProblem: "",
    honeypot: "",
  };
  const result = await submit(input);
  assert.equal(result.response.status, 201);
  assert.equal(result.body.success, true);
  const lead = await prisma.websiteAuditLead.findUnique({ where: { id: result.body.leadId as string } });
  assert.equal(lead?.firstName, input.firstName);
  assert.equal(lead?.lastName, "");
  assert.equal(lead?.companyDescription, "");
  assert.equal(lead?.websiteProblem, "");
  assert.equal(lead?.launchTimeline, "Exploring options");
  assert.equal(lead?.budgetRange, "Not sure yet");
  assert.equal(notifiedLeads.length, 1);
});

test("persists a lead and returns success when notification delivery fails", async () => {
  notificationShouldFail = true;
  const input = payload("notification-failure");
  const result = await submit(input);
  assert.equal(result.response.status, 201);
  assert.equal(result.body.success, true);
  const lead = await prisma.websiteAuditLead.findUnique({ where: { id: result.body.leadId as string } });
  assert.equal(lead?.workEmail, input.workEmail);
  assert.equal(notifiedLeads.length, 0);
});

test("rejects an invalid email", async () => {
  const result = await submit({ ...payload("bad-email"), workEmail: "invalid" });
  assert.equal(result.response.status, 400);
  assert.equal(notifiedLeads.length, 0);
});

test("rejects an invalid website URL", async () => {
  const result = await submit({ ...payload("bad-url"), websiteUrl: "example.test" });
  assert.equal(result.response.status, 400);
  assert.equal(notifiedLeads.length, 0);
});

test("rejects an invalid budget range", async () => {
  const result = await submit({ ...payload("bad-budget"), budgetRange: "$1" });
  assert.equal(result.response.status, 400);
  assert.equal(notifiedLeads.length, 0);
});

test("rejects a missing required field", async () => {
  const result = await submit({ ...payload("missing"), company: " " });
  assert.equal(result.response.status, 400);
  assert.equal(notifiedLeads.length, 0);
});

test("rejects a honeypot submission", async () => {
  const result = await submit({ ...payload("honeypot"), honeypot: "bot content" });
  assert.equal(result.response.status, 400);
  const lead = await prisma.websiteAuditLead.findFirst({ where: { workEmail: `${emailPrefix}-honeypot@example.test` } });
  assert.equal(lead, null);
  assert.equal(notifiedLeads.length, 0);
});
