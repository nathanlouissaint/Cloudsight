import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, ExternalLink } from "lucide-react";
import { analytics } from "../lib/analytics";
import { submitWebsiteAuditLead, type WebsiteAuditLead } from "./auditLead.service";
import {
  getWebsiteAuditBookingAnalyticsProperties,
  getWebsiteAuditBookingUrl,
} from "./booking";

const initialLead: WebsiteAuditLead = { firstName: "", lastName: "", workEmail: "", company: "", websiteUrl: "", offering: "", websiteProblem: "", timeline: "", budget: "", honeypot: "" };
const required = ["firstName", "workEmail", "company", "websiteUrl"] as const;
const isHttpUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; } };

export function WebsiteAuditForm() {
  const [lead, setLead] = useState(initialLead);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const bookingUrl = getWebsiteAuditBookingUrl(import.meta.env.VITE_WEBSITE_AUDIT_BOOKING_URL);
  useEffect(() => {
    if (status === "success") successHeadingRef.current?.focus();
  }, [status]);
  const update = (key: keyof WebsiteAuditLead, value: string) => {
    if (!started) { setStarted(true); analytics.track("website_audit_form_started", { page: "website_audit", form_source: "website_audit" }); }
    if (error) { setError(""); setStatus("idle"); }
    setLead((current) => ({ ...current, [key]: value }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    if (required.some((key) => !lead[key].trim())) { setError("Please complete every field so we can review your request."); setStatus("error"); return; }
    if (!/^\S+@\S+\.\S+$/.test(lead.workEmail)) { setError("Enter a valid work email address."); setStatus("error"); return; }
    if (!isHttpUrl(lead.websiteUrl)) { setError("Enter a valid website URL starting with http:// or https://."); setStatus("error"); return; }
    setError(""); setStatus("submitting");
    try {
      await submitWebsiteAuditLead(lead);
      const properties = { form_source: "website_audit" };
      analytics.track("website_audit_form_submitted", properties);
      analytics.track("website_audit_qualified_lead", properties);
      setStatus("success");
    } catch {
      setError("We couldn't submit your request. Please try again."); setStatus("error");
    }
  };
  if (status === "success") return <section className="wa-form-section" id="audit-form" aria-labelledby="website-audit-success-heading"><div className="wa-form-success" aria-live="polite"><CheckCircle2 size={40} /><p className="wa-eyebrow">Audit request received</p><h2 id="website-audit-success-heading" ref={successHeadingRef} tabIndex={-1}>Your audit request is in.</h2><p>We've got your website. If you'd like to discuss it directly, you can book a strategy call now.</p><div className="wa-form-success__actions">{bookingUrl && <a className="wa-button" href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => analytics.track("website_audit_booking_clicked", getWebsiteAuditBookingAnalyticsProperties(lead.budget || "Not sure yet", lead.timeline || "Exploring options"))}>Book a strategy call <ExternalLink size={17} aria-hidden="true" /><span className="wa-sr-only">(opens in a new tab)</span></a>}<p className="wa-form-success__reassurance">Prefer to wait? We'll still review your submission.</p><a className="wa-form-success__return" href="#top">Return to CloudSight</a></div></div></section>;
  return <section className="wa-form-section" id="audit-form"><div className="wa-form-section__intro"><p className="wa-eyebrow">Get your free website audit</p><h2>Get your free website audit.</h2><p>Send us your site and we'll show you the highest-impact opportunities to improve credibility, clarity, and conversion.</p></div><form className="wa-form" onSubmit={submit} noValidate><Field label="First Name" autoComplete="given-name" value={lead.firstName} onChange={(v) => update("firstName", v)} /><Field label="Work Email" type="email" autoComplete="email" value={lead.workEmail} onChange={(v) => update("workEmail", v)} /><Field label="Company" autoComplete="organization" value={lead.company} onChange={(v) => update("company", v)} /><Field label="Website URL" type="url" autoComplete="url" value={lead.websiteUrl} onChange={(v) => update("websiteUrl", v)} placeholder="https://yourcompany.com" /><Field label="What's the biggest problem with your current website? (Optional)" value={lead.websiteProblem} onChange={(v) => update("websiteProblem", v)} textarea /><label className="wa-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={lead.honeypot} onChange={(e) => update("honeypot", e.target.value)} /></label>{error && <p className="wa-form__error" role="alert">{error}</p>}<button className="wa-button wa-form__submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Reviewing your website…" : <>Review my website <ArrowUpRight size={18} /></>}</button><small className="wa-form__reassurance">Free audit. No obligation.</small></form></section>;
}
function Field({ label, value, onChange, type = "text", placeholder, textarea = false, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; textarea?: boolean; autoComplete?: string }) { const id = label.toLowerCase().replaceAll(/[^a-z]+/g, "-"); return <label className="wa-field" htmlFor={id}><span>{label}</span>{textarea ? <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} /> : <input id={id} required type={type} autoComplete={autoComplete} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}</label>; }
