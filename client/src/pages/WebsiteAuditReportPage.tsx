import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, ExternalLink, FileWarning, LoaderCircle } from "lucide-react";
import { getWebsiteAudit, type WebsiteAuditJob } from "../website-audit/auditLead.service";
import { getWebsiteAuditBookingUrl } from "../website-audit/booking";
import { getDisplayableAiRecommendations } from "../website-audit/report-data";
import "../styles/website-audit-report.css";

type ReportState = "loading" | "ready" | "unavailable";

function displayDomain(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function displayDate(value: string | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function StatusPanel({ job }: { job: WebsiteAuditJob | null }) {
  const processing = job?.status === "PENDING" || job?.status === "PROCESSING";
  return <main className="audit-report-page"><section className="audit-report-shell audit-report-status" aria-live="polite">
    {processing ? <LoaderCircle className="audit-report-spinner" size={38} aria-hidden="true" /> : <FileWarning size={38} aria-hidden="true" />}
    <p className="audit-report-eyebrow">CloudSight website audit</p>
    <h1>{processing ? "Your homepage audit is processing." : "This report is unavailable."}</h1>
    <p>{processing ? "We’re reviewing the permitted public homepage. This page will update automatically when the report is ready." : "This report link is invalid, expired, or the automated review could not be completed."}</p>
    <Link className="audit-report-link" to="/website-audit">Return to website audit</Link>
  </section></main>;
}

export default function WebsiteAuditReportPage() {
  const { token } = useParams();
  const [state, setState] = useState<ReportState>("loading");
  const [job, setJob] = useState<WebsiteAuditJob | null>(null);
  const bookingUrl = getWebsiteAuditBookingUrl(import.meta.env.VITE_WEBSITE_AUDIT_BOOKING_URL);

  useEffect(() => {
    document.title = "Website Audit Report | CloudSight";
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = "noindex, nofollow";
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    let retryTimer: number | undefined;
    const load = async () => {
      try {
        const result = await getWebsiteAudit(token);
        if (cancelled) return;
        setJob(result);
        setState(result.status === "COMPLETED" && result.report ? "ready" : "unavailable");
        if (result.status === "PENDING" || result.status === "PROCESSING") retryTimer = window.setTimeout(load, 1500);
      } catch {
        if (!cancelled) setState("unavailable");
      }
    };
    void load();
    return () => { cancelled = true; if (retryTimer) window.clearTimeout(retryTimer); };
  }, [token]);

  const report = job?.report;
  const domain = useMemo(() => report ? displayDomain(report.auditedUrl) : "", [report]);

  if (!token) return <StatusPanel job={null} />;
  if (state === "loading") return <main className="audit-report-page"><section className="audit-report-shell audit-report-status" aria-live="polite"><LoaderCircle className="audit-report-spinner" size={38} aria-hidden="true" /><p className="audit-report-eyebrow">CloudSight website audit</p><h1>Loading your report.</h1><p>Checking your secure report link.</p></section></main>;
  if (state !== "ready" || !report) return <StatusPanel job={job} />;

  const metadata = report.metadata ?? { title: null, metaDescription: null, h1: [], h2: [], ctas: [], forms: [] };
  const h1 = Array.isArray(metadata.h1) ? metadata.h1 : [];
  const h2 = Array.isArray(metadata.h2) ? metadata.h2 : [];
  const ctas = Array.isArray(metadata.ctas) ? metadata.ctas : [];
  const findings = Array.isArray(report.findings) ? report.findings : [];
  const aiRecommendations = getDisplayableAiRecommendations(report.aiRecommendations);
  return <main className="audit-report-page">
    <header className="audit-report-header"><div className="audit-report-shell"><Link className="audit-report-brand" to="/website-audit"><span>CS</span> CloudSight</Link><p>Homepage audit report</p></div></header>
    <section className="audit-report-hero"><div className="audit-report-shell"><p className="audit-report-eyebrow">Evidence-based homepage review</p><h1>{domain}</h1><p>These observations are based on the public homepage captured during this audit. They are not traffic, conversion, or revenue measurements.</p></div></section>
    <div className="audit-report-shell audit-report-content">
      <section className="audit-report-section" aria-labelledby="overview-heading"><div className="audit-report-section-heading"><p>01</p><h2 id="overview-heading">Website overview</h2></div><dl className="audit-report-overview"><div><dt>Audited domain</dt><dd>{domain}</dd></div><div><dt>Audit date</dt><dd>{displayDate(report.createdAt)}</dd></div><div><dt>Page title</dt><dd>{metadata.title ?? "No page title detected"}</dd></div><div><dt>Meta description</dt><dd>{metadata.metaDescription ?? "No meta description detected"}</dd></div></dl></section>
      <section className="audit-report-section" aria-labelledby="messaging-heading"><div className="audit-report-section-heading"><p>02</p><h2 id="messaging-heading">Messaging review</h2></div><div className="audit-report-grid"><article><h3>Main headline</h3>{h1.length ? <ul>{h1.map((heading) => <li key={heading}>{heading}</li>)}</ul> : <p>No H1 heading was detected on the audited homepage.</p>}</article><article><h3>Supporting headings</h3>{h2.length ? <ul>{h2.map((heading) => <li key={heading}>{heading}</li>)}</ul> : <p>No H2 headings were detected on the audited homepage.</p>}</article><article><h3>What the homepage communicates</h3><p>This report records the title and headings observed on the homepage. Interpretation of audience, positioning, and conversion impact is not yet available in this audit.</p></article></div></section>
      <section className="audit-report-section" aria-labelledby="cta-heading"><div className="audit-report-section-heading"><p>03</p><h2 id="cta-heading">CTA review</h2></div>{ctas.length ? <div className="audit-report-cta-list">{ctas.map((cta, index) => <article key={`${cta.text}-${cta.href}-${index}`}><span>Detected CTA</span><h3>{cta.text || "Untitled link"}</h3><p>{cta.href || "No destination detected"}</p></article>)}</div> : <p className="audit-report-empty">No common call-to-action links were detected in the public homepage HTML.</p>}<p className="audit-report-note">Potential CTA clarity issues require human review; this audit does not infer conversion performance from page elements alone.</p></section>
      <section className="audit-report-section" aria-labelledby="opportunities-heading"><div className="audit-report-section-heading"><p>04</p><h2 id="opportunities-heading">Improvement opportunities</h2></div>{findings.length ? <div className="audit-report-findings">{findings.slice(0, 3).map((finding, index) => <article key={finding.id ?? `${finding.category}-${finding.observedEvidence ?? finding.evidence}-${index}`}><span>{finding.severity ? `${finding.severity} priority · ` : ""}{finding.category}</span><h3>{finding.observedEvidence ?? finding.evidence ?? "Observed homepage evidence"}</h3>{finding.explanation && <p>{finding.explanation}</p>}{finding.recommendedAction && <p className="audit-report-recommendation"><b>Recommended action:</b> {finding.recommendedAction}</p>}<small>Confidence: {finding.confidence ?? "not recorded"}</small></article>)}</div> : <div className="audit-report-unavailable"><Clock3 size={22} aria-hidden="true" /><p>No evidence-backed improvement opportunities were generated from this homepage-only audit.</p></div>}<p className="audit-report-note">These are deterministic checks of captured homepage markup, not measured conversion performance or customer behavior.</p></section>
      {aiRecommendations.length > 0 && <section className="audit-report-section" aria-labelledby="ai-opportunities-heading"><div className="audit-report-section-heading"><p>05</p><h2 id="ai-opportunities-heading">AI recommendations</h2></div><p className="audit-report-note">AI-generated suggestions grounded in the captured homepage evidence. They are not measured conversion results or customer behavior.</p><div className="audit-report-findings audit-report-findings--ai">{aiRecommendations.slice(0, 3).map((recommendation, index) => <article key={`${recommendation.category}-${recommendation.observedEvidence}-${index}`}><span>AI suggestion · {recommendation.category}</span><h3>{recommendation.observedEvidence}</h3><p>{recommendation.explanation}</p><p className="audit-report-recommendation"><b>Recommended action:</b> {recommendation.recommendedAction}</p><small>Confidence: {recommendation.confidence}</small></article>)}</div></section>}
      <section className="audit-report-next" aria-labelledby="next-steps-heading"><div><p className="audit-report-eyebrow">Next steps</p><h2 id="next-steps-heading">Turn the observed evidence into a practical review.</h2><ol><li>Confirm that the captured title, description, headings, and CTAs reflect the intended homepage.</li><li>Prioritize any missing metadata or unclear paths your team identifies.</li><li>Validate proposed changes with your customers and product data before publishing.</li></ol></div><div className="audit-report-next-action"><CheckCircle2 size={27} aria-hidden="true" /><p>Want an expert review of the evidence?</p>{bookingUrl ? <a href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a CloudSight consultation <ExternalLink size={16} aria-hidden="true" /></a> : <p>Consultation scheduling is currently unavailable.</p>}</div></section>
    </div>
  </main>;
}
