import { useEffect, useRef } from "react";
import { analytics } from "../lib/analytics";
import { WebsiteAuditHeader } from "../website-audit/WebsiteAuditHeader";
import { WebsiteAuditHero } from "../website-audit/WebsiteAuditHero";
import { WebsiteAuditForm } from "../website-audit/WebsiteAuditForm";
import { WebsiteAuditCredibility, WebsiteAuditOffer, WebsiteAuditProblems, WebsiteAuditProcess } from "../website-audit/WebsiteAuditSections";
import { SelectedWork } from "../website-audit/SelectedWork";
import "../styles/website-audit.css";

/** Previous Website Audit composition retained for a focused, one-file rollback. */
export default function WebsiteAuditLegacyPage() {
  const tracked = useRef(false);
  useEffect(() => {
    if (!tracked.current) { tracked.current = true; analytics.track("website_audit_page_viewed", { page: "website_audit", variant: "legacy" }); }
  }, []);
  const goToForm = (location = "header") => { analytics.track("website_audit_cta_clicked", { cta_location: location }); document.getElementById("audit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return <main className="website-audit-page"><div className="wa-shell"><WebsiteAuditHeader onCtaClick={goToForm} /><WebsiteAuditHero onCtaClick={goToForm} /><WebsiteAuditProblems /><WebsiteAuditOffer onCtaClick={goToForm} /><WebsiteAuditCredibility /><WebsiteAuditProcess /><SelectedWork /><WebsiteAuditForm /><footer className="wa-footer"><a className="wa-brand" href="#top"><span className="wa-brand__mark">C</span><span>CloudSight</span></a><p>Websites. Software. Cloud.</p><span>© {new Date().getFullYear()} CloudSight</span><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer></div></main>;
}
