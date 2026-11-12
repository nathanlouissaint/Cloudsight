import { type CSSProperties, type ReactNode } from "react";
import "../styles/growth-lab-homepage.css";

const bookingUrl = "https://calendly.com/nathan-louissaint-work/30min";

function track(location: string) {
  window.dispatchEvent(new CustomEvent("cloudsight:cta", { detail: {
    eventName: "calendly_booking_clicked", page: "homepage",
    cta_location: location, cta_type: "calendly", landing_page_variant: "conversion-gap",
  }}));
}

function BookingButton({ location, children = "Book a Free Website Audit", variant = "primary" }: {
  location: string; children?: string; variant?: "primary" | "secondary";
}) {
  return <a className={`button button--${variant}`} href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => track(location)}>
    <span>{children}</span><span aria-hidden="true" className="button__arrow">↗</span>
  </a>;
}

function Shell({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section className={`section shell ${className}`} id={id}>{children}</section>;
}

function Heading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="section-heading"><p className="section-number">{number}</p><div>
    <p className="eyebrow"><span /> {eyebrow}</p><h2>{title}</h2>{children}
  </div></div>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 3H3.55A.55.55 0 0 0 3 3.55v16.9c0 .3.25.55.55.55h16.9c.3 0 .55-.25.55-.55V3.55A.55.55 0 0 0 20.45 3ZM8.34 18.34H5.65V9.68h2.69v8.66ZM7 8.5a1.56 1.56 0 1 1 0-3.12A1.56 1.56 0 0 1 7 8.5Zm11.35 9.84h-2.68v-4.21c0-1.01-.02-2.31-1.41-2.31-1.41 0-1.63 1.1-1.63 2.24v4.28H9.95V9.68h2.57v1.18h.04c.36-.68 1.23-1.4 2.53-1.4 2.71 0 3.21 1.78 3.21 4.1v4.78Z" /></svg>;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm-.19 2A3.57 3.57 0 0 0 4 7.56v8.88A3.57 3.57 0 0 0 7.56 20h8.88A3.57 3.57 0 0 0 20 16.44V7.56A3.57 3.57 0 0 0 16.44 4H7.56Zm9.94 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
}

const problemBlocks = [
  ["01", "They don't get it.", "You know your product inside out. Someone visiting for the first time doesn't. If they can't quickly understand what it does and who it's for, they may move on."],
  ["02", "They don't see why it's worth trying.", "A list of features doesn't always tell someone how your software will make their work easier. Buyers need a reason to care."],
  ["03", "They're not ready to take the next step.", "Maybe they need to see the product, understand the pricing, or feel more confident before signing up. Your website should help them get there."],
];

const services = [
  ["01", "Make your product easier to understand", "Website messaging, positioning, and landing pages that explain what your SaaS does and why it matters."],
  ["02", "Give people a reason to take action", "Conversion-focused website design, product storytelling, trust-building content, and clearer signup paths."],
  ["03", "Make the experience easier", "Better navigation, landing page experiences, signup flows, and onboarding journeys."],
  ["04", "Understand what's working", "Analytics, conversion tracking, and funnel measurement so you can see where visitors are taking action and where they stop."],
];

export default function GrowthLabHomepage() {
  const gridStyle = { "--columns": 10 } as CSSProperties;
  return <>
    <header className="site-header"><nav className="navigation shell" aria-label="Main navigation">
      <a className="wordmark" href="/" aria-label="CloudSight home">CloudSight</a>
      <div className="nav-links"><a href="#services">Services</a><a href="#our-work">Our Work</a><a href="#about">About</a><a href="#contact">Contact</a></div>
      <a className="nav-scorecard" href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("navigation")}>Book a Free Website Audit <span aria-hidden="true">↗</span></a>
    </nav></header>
    <aside className="announcement" aria-label="Website audit booking"><a href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("announcement")}><span className="announcement__dot" aria-hidden="true" />Not sure why visitors aren't signing up? Book a free website audit.<span className="announcement__arrow" aria-hidden="true">↗</span></a></aside>
    <main className="hero" id="top"><div className="shell hero__shell">
      <div className="technical-grid" style={gridStyle} aria-hidden="true"><div className="technical-grid__vertical"/><div className="technical-grid__horizontal"/><div className="blocks"><div className="block block--a"/><div className="block block--c"/><div className="block block--d"/></div></div>
      <div className="hero__content"><p className="eyebrow"><span/> Conversion intelligence for SaaS</p><h1>Getting people to your website is only half the job.</h1>
        <p className="hero__copy">You've put in the work to get people interested in your SaaS. But once they land on your website, are you giving them a good enough reason to sign up?</p>
        <div className="hero__actions"><BookingButton location="hero"/><a className="button button--secondary" href="#services"><span>See How We Help</span><span className="button__arrow" aria-hidden="true">↗</span></a></div>
        <p className="hero__microcopy">Free initial review · No obligation</p></div>
    </div></main>
    <Shell className="barriers" id="services"><Heading number="01 — 06" eyebrow="The part most founders overlook" title="People are finding your SaaS. That doesn't mean they understand it."><p className="section-intro">Someone can land on your website, look around, and leave without ever figuring out why your product is worth trying.<br/><br/>And unless you're paying attention to what happens after the click, it's easy to miss.</p></Heading>
      <div className="barrier-list">{problemBlocks.map(([number, title, description]) => <article className="barrier" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
    </Shell>
    <Shell className="perspective"><Heading number="02 — 06" eyebrow="More traffic isn't always the answer" title="More visitors won't fix what happens after they click."><p className="section-intro">You can spend more on ads, publish more content, and work harder to bring people in.<br/><br/>But if your website isn't explaining your product clearly or helping interested visitors take the next step, more traffic may just mean more missed opportunities.</p></Heading><p className="perspective__statement">Before you focus on getting more visitors, take a closer look at the ones you're already getting.</p></Shell>
    <Shell className="teardown" id="our-work"><Heading number="03 — 06" eyebrow="See the difference" title="The same product. A clearer reason to try it."><p className="section-intro">An illustrative example, not a client case study.</p></Heading>
      <div className="teardown-panels"><article className="site-panel site-panel--before"><header><span>Before</span><i>Illustrative example</i></header><div className="mock-site"><p className="mock-brand">PROJECTFLOW</p><h3>An all-in-one AI-powered platform that streamlines workflows and boosts productivity.</h3></div><p className="annotation">Sounds impressive. But what does it actually help someone do?</p></article>
        <article className="site-panel site-panel--after"><header><span>After</span><i>Illustrative example</i></header><div className="mock-site"><p className="mock-brand">PROJECTFLOW</p><h3>Stop chasing project updates. See who's working on what, what's behind schedule, and what needs your attention.</h3></div><p className="annotation">Now the buyer can picture the problem it solves.</p></article></div>
      <p className="teardown-insight">Good website messaging helps people recognize their problem and understand how your product fits into their work.</p>
    </Shell>
    <Shell className="process"><span id="about" className="section-anchor" aria-hidden="true"/><Heading number="04 — 06" eyebrow="What we do" title="We help turn website visits into opportunities."><p className="section-intro">CloudSight works with B2B SaaS companies to make their websites easier to understand, easier to use, and better at guiding interested visitors toward signing up or booking a demo.</p></Heading>
      <ol className="process-list">{services.map(([number, name, description]) => <li key={name}><span className="stage-number">{number}</span><h3>{name}</h3><p>{description}</p></li>)}</ol>
    </Shell>
    <Shell className="scorecard" id="website-audit"><div className="scorecard__copy"><p className="eyebrow"><span/> Start here</p><h2>How much of this have you checked on your own website?</h2>
      <p>It's easy to overlook things when you're busy building and growing your SaaS.<br/><br/>Our website audit starts with a conversation about your goals, messaging, buyer confidence, and the steps visitors take before signing up.</p>
      <ul className="scorecard__list"><li>Messaging clarity</li><li>Buyer confidence</li><li>Website experience</li><li>Signup and demo paths</li><li>Analytics and growth readiness</li></ul><BookingButton location="website_audit_section"/><p className="scorecard__microcopy">Free initial review · No obligation</p></div>
      <aside className="scorecard__note"><span>WEBSITE AUDIT</span><p>Tell us about your website and goals. We will review your request and agree on the scope before any work begins.</p></aside>
    </Shell>
    <><Shell className="final-cta"><p className="section-number">06 — 06</p><div><p className="eyebrow"><span/> Start with clarity</p><h2>You've worked hard to get people to your website. Make sure it's doing its part.</h2>
      <p className="final-cta__copy">Start with a quick check of your messaging, website experience, and signup process. See what might be worth improving before you spend more time or money bringing people in.</p>
      <div className="final-cta__actions"><BookingButton location="final_cta"/><BookingButton location="final_cta_secondary" variant="secondary">Book a Call</BookingButton></div><p className="final-cta__microcopy">Free initial review · No obligation</p></div></Shell>
      <footer className="footer shell" id="contact"><a className="wordmark" href="#top">CloudSight</a><p>For B2B SaaS teams ready to make the next step clearer.</p><div className="footer__links"><a href="mailto:Nathanlouissaint@cloudsightmail.com">Nathanlouissaint@cloudsightmail.com ↗</a><div className="footer__social" aria-label="CloudSight social profiles"><a href="https://www.linkedin.com/company/cloudsight-co/" target="_blank" rel="noopener noreferrer" aria-label="CloudSight on LinkedIn"><LinkedInIcon/></a><a href="https://www.instagram.com/cloudsightco/" target="_blank" rel="noopener noreferrer" aria-label="CloudSight on Instagram"><InstagramIcon/></a></div></div></footer></>
  </>;
}
