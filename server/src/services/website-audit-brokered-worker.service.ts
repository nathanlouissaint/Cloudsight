import crypto from "node:crypto";
import { extractHomepageEvidence } from "./website-audit-extractor.service";
import { AuditFetchError, fetchAuditHtml, requestThroughAuditEgressProxy, type AuditNetworkTransport } from "./website-audit-url-security.service";

type ClaimedJob = { id: string; normalizedUrl: string };

function brokerConfig() {
  const url = process.env.AUDIT_WORKER_BROKER_URL;
  const token = process.env.AUDIT_WORKER_BROKER_TOKEN;
  if (!url || !token || token.length < 32) throw new Error("AUDIT_WORKER_BROKER_URL and AUDIT_WORKER_BROKER_TOKEN are required for brokered workers.");
  const base = new URL(url);
  if (base.protocol !== "https:" || base.hostname.length === 0 || base.port || base.username || base.password || base.pathname !== "/" || base.search || base.hash) throw new Error("AUDIT_WORKER_BROKER_URL must be a credential-free HTTPS origin.");
  return { base: base.toString().replace(/\/$/, ""), token };
}
type BrokerTransport = (url: string, options: { method: string; headers: Record<string, string>; body: string }) => Promise<{ status: number; body: string }>;
const proxyBrokerTransport: BrokerTransport = async (url, options) => requestThroughAuditEgressProxy(url, options);
async function request(path: string, options: { method: string; headers?: Record<string, string>; body: string }, transport: BrokerTransport = proxyBrokerTransport) {
  const { base, token } = brokerConfig();
  const response = await transport(`${base}${path}`, { method: options.method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(options.headers ?? {}) }, body: options.body });
  if (response.status < 200 || response.status >= 300) { if (response.status !== 409) throw new Error(`AUDIT_BROKER_HTTP_${response.status}`); }
  return response;
}

export async function processNextBrokeredAuditJob(workerId = `audit-${crypto.randomUUID()}`, transport?: AuditNetworkTransport, brokerTransport?: BrokerTransport) {
  const claim = await request("/internal/website-audit-worker/claim", { method: "POST", body: JSON.stringify({ workerId }) }, brokerTransport);
  const payload = JSON.parse(claim.body) as { job: ClaimedJob | null };
  if (!payload.job) return false;
  try {
    const fetched = await fetchAuditHtml(payload.job.normalizedUrl, transport);
    const evidence = extractHomepageEvidence(fetched.html, fetched.finalUrl);
    await request(`/internal/website-audit-worker/jobs/${payload.job.id}/complete`, { method: "POST", headers: { "x-audit-worker-id": workerId }, body: JSON.stringify({ auditedUrl: fetched.finalUrl, metadata: evidence.metadata }) }, brokerTransport);
  } catch (error) {
    const code = error instanceof AuditFetchError ? error.code : "PROCESSING_FAILED";
    await request(`/internal/website-audit-worker/jobs/${payload.job.id}/fail`, { method: "POST", headers: { "x-audit-worker-id": workerId }, body: JSON.stringify({ code }) }, brokerTransport);
  }
  return true;
}
