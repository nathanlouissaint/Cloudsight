
import { type CSSProperties, type ReactNode } from "react";
import "../styles/growth-lab-homepage.css";

type ButtonProps = {
  children: string;
  variant?: "primary" | "secondary";
  href: string;
  ctaLocation?: string;
};

const navItems = [
  { label: "Services", href: "#services" },
  { label: "Our Work", href: "#our-work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const auditUrl = "/website-audit";

function track(
  eventName: "website_audit_cta_clicked" | "calendly_booking_clicked",
  ctaLocation: string,
  ctaType: "website_audit" | "calendly"
) {
  window.dispatchEvent(
    new CustomEvent("cloudsight:cta", {
      detail: {
        eventName,
        page: "homepage",
        cta_location: ctaLocation,
        cta_type: ctaType,
        landing_page_variant: "conversion-gap",
      },
    })
  );
}

function Button({
  children,
  variant = "primary",
  href,
  ctaLocation,
}: ButtonProps) {
  return (
    <a
      className={`button button--${variant}`}
      href={href}
      onClick={
        ctaLocation
          ? () =>
              track(
                "website_audit_cta_clicked",
                ctaLocation,
                "website_audit"
              )
          : undefined
      }
    >
      <span>{children}</span>
      <span aria-hidden="true" className="button__arrow">
        ↗
      </span>
    </a>
  );
}

function Navigation() {
  return (
    <header className="site-header">
      <nav className="navigation shell" aria-label="Main navigation">
        <a className="wordmark" href="/" aria-label="CloudSight home">
          CloudSight
        </a>

        <div className="nav-links">
          {navItems.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </div>

        <a
          className="nav-scorecard"
          href={auditUrl}
          onClick={() =>
            track("website_audit_cta_clicked", "navigation", "website_audit")
          }
        >
          Request an Audit <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}

function AnnouncementBar() {
  return (
    <aside className="announcement" aria-label="Website audit announcement">
      <a
        href={auditUrl}
        onClick={() =>
          track("website_audit_cta_clicked", "announcement", "website_audit")
        }
      >
        <span className="announcement__dot" aria-hidden="true" />
        Not sure why visitors aren't signing up? Request a free website audit.
        <span className="announcement__arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </aside>
  );
}

function Marker({ className }: { className: string }) {
  return (
    <span className={`grid-marker ${className}`} aria-hidden="true" />
  );
}

const blocks = [
  { className: "block block--a", label: "conversion path / 01" },
  { className: "block block--b", label: "signal" },
  { className: "block block--c", label: "clarity layer" },
  { className: "block block--d", label: "intent" },
  { className: "block block--e", label: "action" },
];

function GradientBlocks() {
  return (
    <div className="blocks" aria-hidden="true">
      {blocks.map(({ className, label }) => (
        <div className={className} key={className}>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function TechnicalGrid() {
  const gridStyle = { "--columns": 10 } as CSSProperties;

  return (
    <div className="technical-grid" style={gridStyle} aria-hidden="true">
      <div className="technical-grid__vertical" />
      <div className="technical-grid__horizontal" />

      <Marker className="grid-marker--tl" />
      <Marker className="grid-marker--tr" />
      <Marker className="grid-marker--bl" />
      <Marker className="grid-marker--br" />
      <Marker className="grid-marker--mid-top" />
      <Marker className="grid-marker--mid-bottom" />

      <GradientBlocks />
    </div>
  );
}

function Hero() {
  return (
    <main className="hero" id="top">
      <div className="shell hero__shell">
        <TechnicalGrid />

        <div className="hero__content">
          <p className="eyebrow">
            <span /> Conversion intelligence for SaaS
          </p>

          <h1>Getting people to your website is only half the job.</h1>

          <p className="hero__copy">
            You've put in the work to get people interested in your SaaS.
            But once they land on your website, are you giving them a good
            enough reason to sign up?
          </p>

          <div className="hero__actions">
            <Button href={auditUrl} ctaLocation="hero">
              Request a Website Audit
            </Button>

            <Button variant="secondary" href="#services">
              See How We Help
            </Button>
          </div>

          <p className="hero__microcopy">
            Free initial review · No obligation
          </p>
        </div>

        <p className="hero__index" aria-hidden="true">
          01 — 01
        </p>
      </div>
    </main>
  );
}

function SectionGrid({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`section shell ${className}`} id={id}>
      <div className="section__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <i />
        <i />
      </div>
      {children}
    </section>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <p className="section-number">{number}</p>
      <div>
        <p className="eyebrow">
          <span /> {eyebrow}
        </p>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

const problemBlocks = [
  [
    "01",
    "They don't get it.",
    "You know your product inside out. Someone visiting for the first time doesn't. If they can't quickly understand what it does and who it's for, they may move on.",
  ],
  [
    "02",
    "They don't see why it's worth trying.",
    "A list of features doesn't always tell someone how your software will make their work easier. Buyers need a reason to care.",
  ],
  [
    "03",
    "They're not ready to take the next step.",
    "Maybe they need to see the product, understand the pricing, or feel more confident before signing up. Your website should help them get there.",
  ],
];

function Problem() {
  return (
    <SectionGrid className="barriers" id="services">
      <SectionHeading
        number="01 — 06"
        eyebrow="The part most founders overlook"
        title="People are finding your SaaS. That doesn't mean they understand it."
      >
        <p className="section-intro">
          Someone can land on your website, look around, and leave without
          ever figuring out why your product is worth trying.
          <br />
          <br />
          And unless you're paying attention to what happens after the
          click, it's easy to miss.
        </p>
      </SectionHeading>

      <div className="barrier-list">
        {problemBlocks.map(([number, name, description]) => (
          <article className="barrier" key={number}>
            <span>{number}</span>
            <h3>{name}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </SectionGrid>
  );
}

function Perspective() {
  return (
    <SectionGrid className="perspective">
      <SectionHeading
        number="02 — 06"
        eyebrow="More traffic isn't always the answer"
        title="More visitors won't fix what happens after they click."
      >
        <p className="section-intro">
          You can spend more on ads, publish more content, and work harder
          to bring people in.
          <br />
          <br />
          But if your website isn't explaining your product clearly or
          helping interested visitors take the next step, more traffic
          may just mean more missed opportunities.
        </p>
      </SectionHeading>

      <p className="perspective__statement">
        Before you focus on getting more visitors, take a closer look
        at the ones you're already getting.
      </p>
    </SectionGrid>
  );
}

function Teardown() {
  return (
    <SectionGrid className="teardown" id="our-work">
      <SectionHeading
        number="03 — 06"
        eyebrow="See the difference"
        title="The same product. A clearer reason to try it."
      >
        <p className="section-intro">
          An illustrative example, not a client case study.
        </p>
      </SectionHeading>

      <div className="teardown-panels">
        <article className="site-panel site-panel--before">
          <header>
            <span>Before</span>
            <i>Illustrative example</i>
          </header>

          <div className="mock-site">
            <p className="mock-brand">PROJECTFLOW</p>
            <h3>
              An all-in-one AI-powered platform that streamlines
              workflows and boosts productivity.
            </h3>
          </div>

          <p className="annotation">
            Sounds impressive. But what does it actually help someone do?
          </p>
        </article>

        <article className="site-panel site-panel--after">
          <header>
            <span>After</span>
            <i>Illustrative example</i>
          </header>

          <div className="mock-site">
            <p className="mock-brand">PROJECTFLOW</p>
            <h3>
              Stop chasing project updates. See who's working on what,
              what's behind schedule, and what needs your attention.
            </h3>
          </div>

          <p className="annotation">
            Now the buyer can picture the problem it solves.
          </p>
        </article>
      </div>

      <p className="teardown-insight">
        Good website messaging helps people recognize their problem
        and understand how your product fits into their work.
      </p>
    </SectionGrid>
  );
}

const services = [
  [
    "01",
    "Make your product easier to understand",
    "Website messaging, positioning, and landing pages that explain what your SaaS does and why it matters.",
  ],
  [
    "02",
    "Give people a reason to take action",
    "Conversion-focused website design, product storytelling, trust-building content, and clearer signup paths.",
  ],
  [
    "03",
    "Make the experience easier",
    "Better navigation, landing page experiences, signup flows, and onboarding journeys.",
  ],
  [
    "04",
    "Understand what's working",
    "Analytics, conversion tracking, and funnel measurement so you can see where visitors are taking action and where they stop.",
  ],
];

function Services() {
  return (
    <SectionGrid className="process">
      <span id="about" className="section-anchor" aria-hidden="true" />

      <SectionHeading
        number="04 — 06"
        eyebrow="What we do"
        title="We help turn website visits into opportunities."
      >
        <p className="section-intro">
          CloudSight works with B2B SaaS companies to make their
          websites easier to understand, easier to use, and better
          at guiding interested visitors toward signing up or
          booking a demo.
        </p>
      </SectionHeading>

      <ol className="process-list">
        {services.map(([number, name, description]) => (
          <li key={name}>
            <span className="stage-number">{number}</span>
            <h3>{name}</h3>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    </SectionGrid>
  );
}

function WebsiteAudit() {
  return (
    <SectionGrid className="scorecard" id="scorecard">
      <div className="scorecard__copy">
        <p className="eyebrow">
          <span /> Start here
        </p>

        <h2>How much of this have you checked on your own website?</h2>

        <p>
          It's easy to overlook things when you're busy building
          and growing your SaaS.
          <br />
          <br />
          Our website audit starts with a conversation about your
          goals, messaging, buyer confidence, and the steps visitors
          take before signing up.
        </p>

        <ul className="scorecard__list">
          <li>Messaging clarity</li>
          <li>Buyer confidence</li>
          <li>Website experience</li>
          <li>Signup and demo paths</li>
          <li>Analytics and growth readiness</li>
        </ul>

        <Button href={auditUrl} ctaLocation="scorecard_section">
          Request a Website Audit
        </Button>

        <p className="scorecard__microcopy">
          Free initial review · No obligation
        </p>
      </div>

      <aside className="scorecard__note">
        <span>WEBSITE AUDIT</span>
        <p>
          Tell us about your website and goals. We will review
          your request and agree on the scope before any work begins.
        </p>
      </aside>
    </SectionGrid>
  );
}

function FinalCta() {
  return (
    <>
      <SectionGrid className="final-cta">
        <p className="section-number">06 — 06</p>

        <div>
          <p className="eyebrow">
            <span /> Start with clarity
          </p>

          <h2>
            You've worked hard to get people to your website.
            Make sure it's doing its part.
          </h2>

          <p className="final-cta__copy">
            Start with a quick check of your messaging, website
            experience, and signup process. See what might be worth
            improving before you spend more time or money bringing
            people in.
          </p>

          <div className="final-cta__actions">
            <Button href={auditUrl} ctaLocation="final_cta">
              Request a Website Audit
            </Button>

            <a
              className="final-cta__booking"
              href="https://calendly.com/nathan-louissaint-work/30min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track(
                  "calendly_booking_clicked",
                  "final_cta",
                  "calendly"
                )
              }
            >
              Book a Call <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="final-cta__microcopy">
            Free initial review · No obligation
          </p>
        </div>
      </SectionGrid>

      <footer className="footer shell" id="contact">
        <a className="wordmark" href="#top">
          CloudSight
        </a>

        <p>
          For B2B SaaS teams ready to make the next step clearer.
        </p>

        <a href="mailto:hello@cloudsight.co">
          hello@cloudsight.co <span>↗</span>
        </a>
      </footer>
    </>
  );
}

export default function GrowthLabHomepage() {
  return (
    <>
      <Navigation />
      <AnnouncementBar />
      <Hero />
      <Problem />
      <Perspective />
      <Teardown />
      <Services />
      <WebsiteAudit />
      <FinalCta />
    </>
  );
}
