import { type ReactNode } from "react";
import "../styles/growth-lab-homepage.css";

const bookingUrl = "https://calendly.com/nathan-louissaint-work/30min";

function track(eventName: "calendly_booking_clicked", ctaLocation: string) {
  window.dispatchEvent(
    new CustomEvent("cloudsight:cta", {
      detail: {
        eventName,
        page: "homepage",
        cta_location: ctaLocation,
        cta_type: "calendly",
        landing_page_variant: "conversion-gap",
      },
    })
  );
}

function BookingButton({ location }: { location: string }) {
  return (
    <a
      className="button button--primary"
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("calendly_booking_clicked", location)}
    >
      <span>Book a Free Website Audit</span>
      <span aria-hidden="true" className="button__arrow">↗</span>
    </a>
  );
}

const Shell = ({ children, id, cls = "" }: { children: ReactNode; id?: string; cls?: string }) => (
  <section id={id} className={`section shell ${cls}`}>{children}</section>
);

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 3H3.55A.55.55 0 0 0 3 3.55v16.9c0 .3.25.55.55.55h16.9c.3 0 .55-.25.55-.55V3.55A.55.55 0 0 0 20.45 3ZM8.34 18.34H5.65V9.68h2.69v8.66ZM7 8.5a1.56 1.56 0 1 1 0-3.12A1.56 1.56 0 0 1 7 8.5Zm11.35 9.84h-2.68v-4.21c0-1.01-.02-2.31-1.41-2.31-1.41 0-1.63 1.1-1.63 2.24v4.28H9.95V9.68h2.57v1.18h.04c.36-.68 1.23-1.4 2.53-1.4 2.71 0 3.21 1.78 3.21 4.1v4.78Z" /></svg>;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm-.19 2A3.57 3.57 0 0 0 4 7.56v8.88A3.57 3.57 0 0 0 7.56 20h8.88A3.57 3.57 0 0 0 20 16.44V7.56A3.57 3.57 0 0 0 16.44 4H7.56Zm9.94 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
}

export default function GrowthLabHomepage() {
  return <>
    <header className="site-header">
      <nav className="navigation shell" aria-label="Main navigation">
        <a className="wordmark" href="/">CloudSight</a>
        <div className="nav-links"><a href="#services">Services</a><a href="#our-work">Our Work</a><a href="#about">About</a><a href="#contact">Contact</a></div>
        <a className="nav-scorecard" href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("calendly_booking_clicked", "navigation")}>Book a Free Website Audit <span>↗</span></a>
      </nav>
    </header>
    <aside className="announcement"><a href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("calendly_booking_clicked", "announcement")}><span className="announcement__dot" />Not sure why visitors aren't signing up? Book a free website audit. <span>↗</span></a></aside>
    <main className="hero" id="top"><div className="shell hero__shell"><div className="technical-grid"><div className="technical-grid__vertical" /><div className="technical-grid__horizontal" /><div className="blocks"><div className="block block--a" /><div className="block block--c" /><div className="block block--d" /></div></div><div className="hero__content"><p className="eyebrow"><span /> Conversion intelligence for SaaS</p><h1>Getting people to your website is only half the job.</h1><p className="hero__copy">You've put in the work to get people interested in your SaaS. But once they land on your website, are you giving them a good enough reason to sign up?</p><div className="hero__actions"><BookingButton location="hero" /><a className="button button--secondary" href="#services"><span>See How We Help</span><span className="button__arrow">↗</span></a></div><p className="hero__microcopy">Free initial review · No obligation</p></div></div></main>
    <Shell id="services" cls="barriers"><div className="section-heading"><p className="section-number">01 — 06</p><div><p className="eyebrow"><span /> The part most founders overlook</p><h2>People are finding your SaaS. That doesn't mean they understand it.</h2><p className="section-intro">Someone can land on your website, look around, and leave without ever figuring out why your product is worth trying.</p></div></div><div className="barrier-list">{[["01", "They don't get it."], ["02", "They don't see why it's worth trying."], ["03", "They're not ready to take the next step."]].map(([number, title]) => <article className="barrier" key={number}><span>{number}</span><h3>{title}</h3><p>Your website should help interested visitors understand the product and take the next step.</p></article>)}</div></Shell>
    <Shell cls="perspective"><div className="section-heading"><p className="section-number">02 — 06</p><div><p className="eyebrow"><span /> More traffic isn't always the answer</p><h2>More visitors won't fix what happens after they click.</h2></div></div><p className="perspective__statement">Before you focus on getting more visitors, take a closer look at the ones you're already getting.</p></Shell>
    <Shell id="our-work" cls="teardown"><div className="section-heading"><p className="section-number">03 — 06</p><div><p className="eyebrow"><span /> See the difference</p><h2>The same product. A clearer reason to try it.</h2></div></div></Shell>
    <Shell cls="process"><span id="about" /><div className="section-heading"><p className="section-number">04 — 06</p><div><p className="eyebrow"><span /> What we do</p><h2>We help turn website visits into opportunities.</h2></div></div></Shell>
    <Shell cls="scorecard"><div className="scorecard__copy"><p className="eyebrow"><span /> Start here</p><h2>How much of this have you checked on your own website?</h2><p>Book a free website audit to discuss your messaging, buyer confidence, and the steps visitors take before signing up.</p><BookingButton location="website_audit" /><p className="scorecard__microcopy">Free initial review · No obligation</p></div></Shell>
    <Shell cls="final-cta"><p className="section-number">06 — 06</p><div><p className="eyebrow"><span /> Start with clarity</p><h2>You've worked hard to get people to your website. Make sure it's doing its part.</h2><BookingButton location="final_cta" /></div></Shell>
    <footer className="footer shell" id="contact"><a className="wordmark" href="#top">CloudSight</a><p>For B2B SaaS teams ready to make the next step clearer.</p><div className="footer__links"><a href="mailto:Nathanlouissaint@cloudsightmail.com">Nathanlouissaint@cloudsightmail.com ↗</a><div className="footer__social" aria-label="CloudSight social profiles"><a href="https://www.linkedin.com/company/cloudsight-co/" target="_blank" rel="noopener noreferrer" aria-label="CloudSight on LinkedIn"><LinkedInIcon /></a><a href="https://www.instagram.com/cloudsightco/" target="_blank" rel="noopener noreferrer" aria-label="CloudSight on Instagram"><InstagramIcon /></a></div></div></footer>
  </>;
}
