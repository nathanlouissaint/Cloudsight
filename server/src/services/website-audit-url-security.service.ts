import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";

export class AuditFetchError extends Error {
  constructor(public readonly code: string) { super(code); }
}
type Address = { address: string; family: number };
export interface AuditNetworkTransport { resolve(hostname: string): Promise<Address[]>; request(url: URL, addresses: Address[]): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>; }
const blockedHosts = new Set(["localhost", "metadata.google.internal", "metadata", "instance-data"]);
const timeoutMs = 8_000;
const maxBytes = 1_000_000;
const crawlerAgent = "CloudSight-Audit";
const robotsCache = new Map<string, { policy: string | null; expiresAt: number }>();
const robotsCacheTtlMs = Number(process.env.WEBSITE_AUDIT_ROBOTS_CACHE_TTL_MS ?? 300_000);
const robotsCacheMax = 500;

export function isPrivateAddress(address: string) {
  const family = net.isIP(address);
  if (family === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) || (a === 198 && (b === 18 || b === 19));
  }
  if (family === 6) {
    const value = address.toLowerCase();
    if (value.startsWith("::ffff:")) return isPrivateAddress(value.slice(7));
    return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") || value.startsWith("ff");
  }
  return true;
}

export async function validateAuditUrl(value: string, transport: AuditNetworkTransport = productionTransport) {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new AuditFetchError("INVALID_URL"); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || blockedHosts.has(url.hostname.toLowerCase()) || (url.port && !['80', '443'].includes(url.port))) throw new AuditFetchError("UNSAFE_URL");
  const addresses = await transport.resolve(url.hostname);
  if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) throw new AuditFetchError("PRIVATE_NETWORK");
  url.hash = "";
  return { url, addresses };
}

function getPinned(url: URL, addresses: Address[]) {
  const address = addresses[0];
  const transport = url.protocol === "https:" ? https : http;
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
    const request = transport.request(url, { method: "GET", headers: { "User-Agent": "CloudSight-Audit/1.0", Accept: "text/html,application/xhtml+xml" }, servername: url.hostname, lookup: (_host, _opts, callback) => callback(null, address.address, address.family) }, (response) => {
      const chunks: Buffer[] = []; let bytes = 0;
      response.on("data", (chunk: Buffer) => { bytes += chunk.length; if (bytes > maxBytes) request.destroy(new AuditFetchError("RESPONSE_TOO_LARGE")); else chunks.push(chunk); });
      response.on("end", () => resolve({ status: response.statusCode ?? 0, headers: response.headers, body: Buffer.concat(chunks).toString("utf8") }));
    });
    request.setTimeout(timeoutMs, () => request.destroy(new AuditFetchError("TIMEOUT")));
    request.once("error", reject); request.end();
  });
}
export const productionTransport: AuditNetworkTransport = { resolve: (hostname) => dns.lookup(hostname, { all: true, verbatim: true }), request: getPinned };

export async function fetchAuditHtml(initialUrl: string, transport: AuditNetworkTransport = productionTransport) {
  if (process.env.AUDIT_CRAWLER_NETWORK_ISOLATION !== "enabled") throw new AuditFetchError("CRAWLER_NETWORK_ISOLATION_REQUIRED");
  if (!(await robotsAllows(initialUrl, transport))) throw new AuditFetchError("ROBOTS_DISALLOWED");
  let current = initialUrl;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const { url, addresses } = await validateAuditUrl(current, transport);
    const response = await transport.request(url, addresses);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (!response.headers.location || redirects === 3) throw new AuditFetchError("TOO_MANY_REDIRECTS");
      current = new URL(response.headers.location, url).toString(); continue;
    }
    if (response.status < 200 || response.status >= 300 || !String(response.headers["content-type"] ?? "").toLowerCase().includes("text/html")) throw new AuditFetchError("NON_HTML_RESPONSE");
    return { finalUrl: url.toString(), html: response.body };
  }
  throw new AuditFetchError("FETCH_FAILED");
}

export async function robotsAllows(initialUrl: string, transport: AuditNetworkTransport = productionTransport) {
  try {
    const page = new URL(initialUrl); const robots = new URL("/robots.txt", page);
    const cacheKey = `${page.origin}|${crawlerAgent}`; const cached = robotsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.policy === null ? true : robotsPolicyAllows(cached.policy, page.pathname, crawlerAgent);
    const { url, addresses } = await validateAuditUrl(robots.toString(), transport); const response = await transport.request(url, addresses);
    if (response.status === 404) { cacheRobots(cacheKey, null); return true; }
    if (response.status < 200 || response.status >= 300 || response.body.length > 256_000) return false;
    cacheRobots(cacheKey, response.body); return robotsPolicyAllows(response.body, page.pathname, crawlerAgent);
  } catch { return false; }
}
function cacheRobots(key: string, policy: string | null) { if (robotsCache.size >= robotsCacheMax) robotsCache.delete(robotsCache.keys().next().value as string); robotsCache.set(key, { policy, expiresAt: Date.now() + robotsCacheTtlMs }); }
export function clearRobotsPolicyCache() { robotsCache.clear(); }

export function robotsPolicyAllows(body: string, pathname: string, agent = crawlerAgent) {
  const rules: { allow: boolean; pattern: string }[] = []; let applies = false;
  for (const raw of body.split(/\r?\n/)) { const line = raw.replace(/#.*/, "").trim(); const [key, ...rest] = line.split(":"); const value = rest.join(":").trim(); if (!key) continue; const field = key.toLowerCase(); if (field === "user-agent") { applies = value.toLowerCase() === "*" || agent.toLowerCase().startsWith(value.toLowerCase()); continue; } if (applies && (field === "allow" || field === "disallow") && value) rules.push({ allow: field === "allow", pattern: value }); }
  const matches = rules.filter((rule) => { const end = rule.pattern.endsWith("$"); const source = (end ? rule.pattern.slice(0, -1) : rule.pattern).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*"); return new RegExp(`^${source}${end ? "$" : ""}`).test(pathname); });
  if (!matches.length) return true; matches.sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow)); return matches[0].allow;
}
