import type { HomepageAuditMetadata } from "./website-audit-conversion-analysis.service";

const text = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? null;
const meta = (html: string, key: string) => { const tag = [...html.matchAll(/<meta\b[^>]*>/gi)].map((x) => x[0]).find((x) => attr(x, "name")?.toLowerCase() === key || attr(x, "property")?.toLowerCase() === key); return tag ? attr(tag, "content") : null; };

export function extractHomepageEvidence(html: string, auditedUrl: string) {
  const headings = [...html.matchAll(/<h([12])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: Number(m[1]), text: text(m[2]) })).filter((x) => x.text).slice(0, 30);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({ href: m[1], text: text(m[2]) })).filter((x) => x.text).slice(0, 60);
  const ctas = links.filter((x) => /(?:start|get|try|book|demo|sign up|request|contact|talk|learn more|read more|click here|submit|explore)/i.test(x.text)).slice(0, 12);
  const forms = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)].map((m) => ({ action: attr(m[0], "action"), method: attr(m[0], "method") ?? "get", fields: [...m[1].matchAll(/<(?:input|textarea|select)\b[^>]*>/gi)].map((x) => attr(x[0], "name") ?? attr(x[0], "type") ?? "unnamed").slice(0, 20) })).slice(0, 10);
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((x) => attr(x, "rel")?.toLowerCase() === "canonical");
  const mainText = text(html.replace(/<(?:script|style|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript)>/gi, " ")).slice(0, 6_000);
  const metadata: HomepageAuditMetadata & { canonicalUrl: string | null; robots: string | null; language: string | null } = { title: text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") || null, metaDescription: meta(html, "description"), canonicalUrl: canonicalTag ? attr(canonicalTag, "href") : null, robots: meta(html, "robots"), language: attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang"), h1: headings.filter((x) => x.level === 1).map((x) => x.text), h2: headings.filter((x) => x.level === 2).map((x) => x.text), ctas, internalNavigation: links.filter((x) => { try { return new URL(x.href, auditedUrl).origin === new URL(auditedUrl).origin; } catch { return false; } }).slice(0, 30), forms, mainText };
  return { metadata };
}
