import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { trackFunnelEvent } from "../lib/funnelAnalytics";
import "../styles/growth-lab-website-audit.css";

const scorecardPath = "/saas-scorecard";
const calendlyUrl = "https://calendly.com/nathan-louissaint-work/30min";

function withAttribution(destination: string) {
  const destinationUrl = new URL(destination, window.location.origin);
  const search = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    const value = search.get(key);
    if (value) destinationUrl.searchParams.set(key, value);
  });
  return destinationUrl.href;
}

function trackCta(location: string, type: "scorecard" | "calendly") {
  trackFunnelEvent("website_audit_cta_clicked", {
    page: "website_audit",
    cta_location: location,
    cta_type: type,
    landing_page_variant: "growth_lab",
  });
}

function ScorecardButton({ location, children }: { location: string; children: string }) {
  return <Link className="glwa-button glwa-button--primary" to={`${scorecardPath}${window.location.search}`} onClick={() => trackCta(location, "scorecard")}><span>{children}</span><b aria-hidden="true">↗</b></Link>;
}

function GridSection({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section className={`glwa-section ${className}`} id={id}><div className="glwa-grid" aria-hidden="true"><i /><i /><i /><i /><b /><b /></div>{children}</section>;
}

function SectionHeading({ index, eyebrow, title, children }: { index: string; eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="glwa-heading"><p>{index}</p><div><span className="glwa-eyebrow"><i />{eyebrow}</span><h2>{title}</h2>{children}</div></div>;
}

const problems = [
  ["01", "They don't get it.", "You know your product inside out. Someone visiting for the first time doesn't. If they can't quickly understand what it does and who it's for, they may move on."],
  ["02", "They don't see why it's worth trying.", "A list of features doesn't always tell someone how your software will make their work easier. Buyers need a reason to care."],
  ["03", "They're not ready to take the next step.", "Maybe they need to see the product, understand the pricing, or feel more confident before signing up. Your website should help them get there."],
] as const;

const services = [
  ["01", "Make your product easier to understand", "Website messaging, positioning, and landing pages that explain what your SaaS does and why it matters."],
  ["02", "Give people a reason to take action", "Conversion-focused website design, product storytelling, trust-building content, and clearer signup paths."],
  ["03", "Make the experience easier", "Better navigation, landing page experiences, signup flows, and onboarding journeys."],
  ["04", "Understand what's working", "Analytics, conversion tracking, and funnel measurement so you can see where visitors are taking action and where they stop."],
] as const;

function LinkedInIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 3H3.55A.55.55 0 0 0 3 3.55v16.9c0 .3.25.55.55.55h16.9c.3 0 .55-.25.55-.55V3.55a.55.55 0 0 0-.55-.55ZM8.34 18.34H5.65V9.68h2.69v8.66ZM7 8.5a1.56 1.56 0 1 1 0-3.12A1.56 1.56 0 0 1 7 8.5Zm11.35 9.84h-2.68v-4.21c0-1.01-.02-2.31-1.41-2.31-1.41 0-1.63 1.1-1.63 2.24v4.28H9.95V9.68h2.57v1.18h.04c.36-.68 1.23-1.4 2.53-1.4 2.71 0 3.21 1.78 3.21 4.1v4.78Z" /></svg>; }
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm-.19 2A3.57 3.57 0 0 0 4 7.56v8.88A3.57 3.57 0 0 0 7.56 20h8.88A3.57 3.57 0 0 0 20 16.44V7.56A3.57 3.57 0 0 0 16.44 4H7.56Zm9.94 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>; }

export default function GrowthLabWebsiteAuditPage() {
  const tracked = useRef(false);
  useEffect(() => {
    document.title = "CloudSight — Make Every Website Visit Count";
    const description = "CloudSight helps B2B SaaS teams make their websites easier to understand, easier to use, and clearer about the next step.";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.append(meta); }
    meta.content = description;
    if (!tracked.current) { tracked.current = true; trackFunnelEvent("website_audit_page_viewed", { page: "website_audit", landing_page_variant: "growth_lab" }); }
  }, []);

  return <main className="glwa-page">
    <header className="glwa-header"><nav className="glwa-shell" aria-label="Main navigation"><a className="glwa-wordmark" href="/website-audit">CloudSight</a><div className="glwa-nav-links"><a href="#services">Services</a><a href="#comparison">Our Work</a><a href="#about">About</a><a href="#contact">Contact</a></div><Link className="glwa-nav-scorecard" to={`${scorecardPath}${window.location.search}`} onClick={() => trackCta("navigation", "scorecard")}>Take the Scorecard <span aria-hidden="true">↗</span></Link></nav></header>
    <aside className="glwa-announcement"><Link to={`${scorecardPath}${window.location.search}`} onClick={() => trackCta("announcement", "scorecard")}><i aria-hidden="true" />Not sure why visitors aren't signing up? Take the free SaaS Website Scorecard. <b aria-hidden="true">↗</b></Link></aside>
    <section className="glwa-hero" id="top"><div className="glwa-shell glwa-hero__shell"><div className="glwa-hero-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="glwa-hero__blocks" aria-hidden="true"><span /><span /><span /><span /><span /></div><div className="glwa-hero__content"><span className="glwa-eyebrow"><i />Conversion intelligence for SaaS</span><h1>Getting people to your website is only half the job.</h1><p>You've put in the work to get people interested in your SaaS. But once they land on your website, are you giving them a good enough reason to sign up?</p><div><ScorecardButton location="hero">Take the Free Scorecard</ScorecardButton><a className="glwa-button glwa-button--secondary" href="#services">See How We Help <b aria-hidden="true">↗</b></a></div><small>10 questions · About 2 minutes · Free</small></div><em>01 — 01</em></div></section>
    <GridSection className="glwa-problems" id="services"><SectionHeading index="01 — 06" eyebrow="The part most founders overlook" title="People are finding your SaaS. That doesn't mean they understand it."><p className="glwa-intro">Someone can land on your website, look around, and leave without ever figuring out why your product is worth trying.<br /><br />And unless you're paying attention to what happens after the click, it's easy to miss.</p></SectionHeading><div className="glwa-problem-list">{problems.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></GridSection>
    <GridSection className="glwa-perspective"><SectionHeading index="02 — 06" eyebrow="More traffic isn't always the answer" title="More visitors won't fix what happens after they click."><p className="glwa-intro">You can spend more on ads, publish more content, and work harder to bring people in.<br /><br />But if your website isn't explaining your product clearly or helping interested visitors take the next step, more traffic may just mean more missed opportunities.</p></SectionHeading><p className="glwa-perspective__statement">Before you focus on getting more visitors, take a closer look at the ones you're already getting.</p></GridSection>
    <GridSection className="glwa-comparison" id="comparison"><SectionHeading index="03 — 06" eyebrow="See the difference" title="The same product. A clearer reason to try it."><p className="glwa-intro">An illustrative example, not a client case study.</p></SectionHeading><div className="glwa-comparison__panels"><article><header><span>Before</span><i>Illustrative example</i></header><div><small>PROJECTFLOW</small><h3>An all-in-one AI-powered platform that streamlines workflows and boosts productivity.</h3></div><p>Sounds impressive. But what does it actually help someone do?</p></article><article className="glwa-comparison__after"><header><span>After</span><i>Illustrative example</i></header><div><small>PROJECTFLOW</small><h3>Stop chasing project updates. See who's working on what, what's behind schedule, and what needs your attention.</h3></div><p>Now the buyer can picture the problem it solves.</p></article></div><p className="glwa-comparison__insight">Good website messaging helps people recognize their problem and understand how your product fits into their work.</p></GridSection>
    <GridSection className="glwa-services" id="about"><SectionHeading index="04 — 06" eyebrow="What we do" title="We help turn website visits into opportunities."><p className="glwa-intro">CloudSight works with B2B SaaS companies to make their websites easier to understand, easier to use, and better at guiding interested visitors toward signing up or booking a demo.</p></SectionHeading><ol>{services.map(([number, title, body]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></GridSection>
    <GridSection className="glwa-scorecard"><div><span className="glwa-eyebrow"><i />Start here</span><h2>How much of this have you checked on your own website?</h2><p>It's easy to overlook things when you're busy building and growing your SaaS.<br /><br />Our free Website Scorecard helps you take a closer look at how clearly your website explains your product, builds buyer confidence, and guides visitors toward signing up.</p><ul><li>Messaging clarity</li><li>Buyer confidence</li><li>Website experience</li><li>Signup and demo paths</li><li>Analytics and growth readiness</li></ul><ScorecardButton location="scorecard_section">Take the Free Scorecard</ScorecardButton><small>10 questions · About 2 minutes · Free</small></div><aside><span>SELF-ASSESSMENT</span><p>This is based on your responses. It is not an automated website scan or a professional audit.</p></aside></GridSection>
    <GridSection className="glwa-final"><p>06 — 06</p><div><span className="glwa-eyebrow"><i />Start with clarity</span><h2>You've worked hard to get people to your website. Make sure it's doing its part.</h2><p>Start with a quick check of your messaging, website experience, and signup process. See what might be worth improving before you spend more time or money bringing people in.</p><section><ScorecardButton location="final_cta">Take the Free Scorecard</ScorecardButton><a href={withAttribution(calendlyUrl)} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("final_cta", "calendly")}>Book a Free Strategy Call <span aria-hidden="true">↗</span></a></section><small>10 questions · About 2 minutes · Free</small></div></GridSection>
    <footer className="glwa-footer glwa-shell" id="contact"><a className="glwa-wordmark" href="#top">CloudSight</a><p>For B2B SaaS teams ready to make the next step clearer.</p><div className="glwa-footer-links"><a href="mailto:Nathanlouissaint@cloudsightmail.com">Nathanlouissaint@cloudsightmail.com <span>↗</span></a><div className="glwa-social" aria-label="CloudSight social profiles"><a href="https://www.linkedin.com/company/cloudsight-co/" target="_blank" rel="noopener noreferrer" aria-label="CloudSight on LinkedIn"><LinkedInIcon /></a><a href="https://www.instagram.com/cloudsightco/" target="_blank" rel="noopener noreferrer" aria-label="CloudSight on Instagram"><InstagramIcon /></a></div></div></footer>
  </main>;
}
