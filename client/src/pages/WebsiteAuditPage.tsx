import { useEffect, useRef } from "react";
import { analytics } from "../lib/analytics";
import { WebsiteAuditHeader } from "../website-audit/WebsiteAuditHeader";
import { WebsiteAuditHero } from "../website-audit/WebsiteAuditHero";
import { WebsiteAuditForm } from "../website-audit/WebsiteAuditForm";
import { WebsiteAuditCredibility, WebsiteAuditOffer, WebsiteAuditProblems, WebsiteAuditProcess } from "../website-audit/WebsiteAuditSections";
import "../styles/website-audit.css";

export default function WebsiteAuditPage() {
  const tracked = useRef(false);
  useEffect(() => {
    const title = "B2B Technology Website Design | CloudSight";
    const description = "CloudSight designs and builds high-performance websites for SaaS, IT, cloud, cybersecurity, and B2B technology companies.";
    const canonicalUrl = new URL("/website-audit", window.location.origin).href;
    document.title = title;

    const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(selector);
      if (!meta) { meta = document.createElement("meta"); meta.setAttribute(attribute, key); document.head.append(meta); }
      meta.content = content;
    };
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
    canonical.href = canonicalUrl;

    if (!tracked.current) { tracked.current = true; analytics.track("website_audit_page_viewed", { page: "website_audit", path: window.location.pathname }); }
  }, []);
  const goToForm = (location = "header") => { analytics.track("website_audit_cta_clicked", { cta_location: location }); document.getElementById("audit-form")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); };
  return <main className="website-audit-page"><div className="wa-shell"><WebsiteAuditHeader onCtaClick={goToForm} /><WebsiteAuditHero onCtaClick={goToForm} /><WebsiteAuditProblems /><WebsiteAuditOffer onCtaClick={goToForm} /><WebsiteAuditCredibility /><WebsiteAuditProcess /><WebsiteAuditForm /><footer className="wa-footer"><a className="wa-brand" href="#top"><span className="wa-brand__mark">C</span><span>CloudSight</span></a><p>Websites. Software. Cloud.</p><span>© {new Date().getFullYear()} CloudSight</span><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer></div></main>;
}
