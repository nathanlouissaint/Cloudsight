import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { analytics } from "../lib/analytics";
import { websiteAuditGoals } from "../website-audit/goals";
import "../styles/homepage-redesign.css";

const problems = [["01", "Visitors don't understand your product.", "If people can't quickly understand what your software does and why they need it, they'll leave."], ["02", "People leave before signing up.", "Confusing pages, weak calls to action, and unnecessary steps make it harder to start a trial or book a demo."], ["03", "You don't know what's stopping them.", "Without understanding where visitors lose interest, it's difficult to know what to improve."]];
const services = [["01", "Make your product easy to understand.", "We explain what your software does, who it's for, and why someone should choose it.", "Clear product messaging / Customer-focused website copy / Content structure"], ["02", "Build a website that drives action.", "We design clear, easy-to-use pages that guide visitors toward a signup, trial, or demo.", "Website design / Clear page hierarchy / Responsive pages"], ["03", "Find and fix what's losing you users.", "We identify confusing steps, improve signup paths, and help you understand what's working.", "Improving the customer journey / Finding website friction / Tracking what works"]];
const insights = [["Messaging", "4 min read", "Your headline is not a product description.", "Start with the change your customer wants. Then explain the product that makes it possible."], ["Design", "5 min read", "Good hierarchy is a conversion decision.", "What you make prominent tells visitors what matters. Make sure the page is saying the right thing."], ["Optimization", "6 min read", "Before you ask for more traffic, look here.", "A practical way to review the journey from first impression to the next meaningful action."]];
function TalkLink({ location, to = "/website-audit", className = "homepage-cta" }: { location: string; to?: string; className?: string }) { return <Link to={to} className={className} onClick={() => analytics.track("hero_cta_clicked", { cta_location: location, page: "homepage", path: window.location.pathname })}><span>[</span> Let’s talk ↗ <span>]</span></Link>; }
function Eyebrow({ number, children }: { number: string; children: string }) { return <p className="homepage-eyebrow"><span>{number}</span><b>/</b> {children}</p>; }

function ScorecardSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = websiteAuditGoals.findIndex((option) => option.value === value);
    optionRefs.current[selectedIndex >= 0 ? selectedIndex : 0]?.focus();
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  const select = (nextValue: string) => { onChange(nextValue); setOpen(false); };
  const selected = websiteAuditGoals.find((option) => option.value === value);

  return <div className="scorecard-select" ref={rootRef}>
    <input type="hidden" name="improvement" value={value} />
    <button type="button" className="scorecard-select__trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls="scorecard-improvement-options" onClick={() => setOpen((isOpen) => !isOpen)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); } }}>
      <span className={selected ? undefined : "scorecard-select__placeholder"}>{selected?.label ?? "Select your primary goal"}</span><i aria-hidden="true" />
    </button>
    {open && <div className="scorecard-select__menu" id="scorecard-improvement-options" role="listbox" aria-label="What would you like to improve?" onKeyDown={(event) => { const currentIndex = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement); const nextIndex = event.key === "ArrowDown" ? Math.min(currentIndex + 1, websiteAuditGoals.length - 1) : event.key === "ArrowUp" ? Math.max(currentIndex - 1, 0) : event.key === "Home" ? 0 : event.key === "End" ? websiteAuditGoals.length - 1 : -1; if (event.key === "Escape") { event.preventDefault(); setOpen(false); rootRef.current?.querySelector<HTMLButtonElement>(".scorecard-select__trigger")?.focus(); } else if (nextIndex >= 0) { event.preventDefault(); optionRefs.current[nextIndex]?.focus(); } }}>
      {websiteAuditGoals.map((option, index) => <button key={option.value} ref={(element) => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={option.value === value} className="scorecard-select__option" onClick={() => select(option.value)}>{option.value === value && <b aria-hidden="true">✓</b>}{option.label}</button>)}
    </div>}
  </div>;
}

export default function HomepageRedesign() {
  const [menuOpen, setMenuOpen] = useState(false); const [scorecardGoal, setScorecardGoal] = useState(""); const tracked = useRef(false);
  useEffect(() => { if (!tracked.current) { tracked.current = true; analytics.track("landing_viewed", { page: "homepage", path: window.location.pathname }); } }, []);
  return <main className="homepage" id="top">
    <style>{`
      .homepage-hero-frame {
        --hero-grid-inset: clamp(32px, 3vw, 48px);
      }
      .homepage-hero-frame::before {
        left: 63%;
        width: 72px;
      }
      .homepage-nav {
        padding-inline: var(--hero-grid-inset);
      }
      .homepage-hero {
        min-height: 698px;
        padding: 58px var(--hero-grid-inset) 24px;
      }
      .homepage-hero h1 {
        max-width: min(100%, 1120px);
        margin-top: 46px;
        font-size: clamp(4rem, 7.3vw, 6.9rem);
        letter-spacing: -.082em;
        line-height: .91;
      }
      .homepage-hero h1 span {
        white-space: normal;
      }
      .homepage-hero h1 em {
        color: inherit;
      }
      .homepage-hero__details {
        margin-top: 42px;
        padding-right: var(--hero-grid-inset);
      }
      .homepage-hero__lede {
        line-height: 1.18;
      }
      .homepage-hero__copy {
        margin-top: 16px;
        line-height: 1.5;
      }
      .homepage-hero .homepage-cta {
        margin-right: 0;
      }
      .homepage-services {
        left: var(--hero-grid-inset);
        bottom: 24px;
      }
      @media (max-width: 800px) {
        .homepage-hero-frame { --hero-grid-inset: 24px; }
        .homepage-hero-frame::before { right: 11%; left: auto; width: 46px; }
        .homepage-hero { padding: 44px var(--hero-grid-inset) 24px; }
        .homepage-hero h1 { margin-top: 36px; font-size: clamp(3.35rem, 12.7vw, 6rem); }
        .homepage-hero__details { margin-top: 34px; padding-right: 0; }
        .homepage-services { bottom: 24px; }
      }
      @media (max-width: 520px) {
        .homepage-hero-frame { --hero-grid-inset: 20px; }
        .homepage-hero { padding-top: 36px; }
        .homepage-hero h1 { font-size: clamp(3rem, 14.4vw, 4rem); line-height: .94; }
        .homepage-hero__details { margin-top: 28px; }
      }
      .homepage-hero__details > div { display:flex; flex-direction:column; align-items:flex-start; }
      .homepage-hero__lede { margin-bottom:0; }
      .homepage-hero__copy { margin-top:10px; }
      .homepage-cta-group { display:flex; align-items:center; gap:22px; margin-top:36px; }
      .homepage a.homepage-scorecard-cta, .homepage a.homepage-scorecard-cta:visited { display:inline-flex; align-items:center; gap:10px; min-height:52px; padding:0 24px; border:1px solid #2563EB; border-radius:0; color:#fff; background:#2563EB; font-size:14px; font-weight:600; letter-spacing:-.025em; line-height:1; text-decoration:none; }
      .homepage a.homepage-scorecard-cta *, .homepage a.homepage-scorecard-cta { color:#fff; }
      .homepage a.homepage-scorecard-cta:hover { border-color:#1D4ED8; background:#1D4ED8; }
      .homepage-scorecard-cta:focus-visible { outline:3px solid var(--home-ink); outline-offset:4px; }
      .homepage-scorecard-note { margin:0; color:#777; font-size:12px; line-height:1.35; }
      .home-work__disclosure { display:block; margin:-24px 0 34px; color:var(--muted,#777); font-size:11px; line-height:1.4; }
      .homepage {
        --home-display-tracking: -.02em;
        --home-display-leading: 1.06;
        --home-heading-tracking: -.015em;
        --home-heading-leading: 1.1;
        --home-label-tracking: -.01em;
        --home-body-leading: 1.55;
        font-stretch: normal;
        font-kerning: normal;
        font-synthesis: none;
      }
      .homepage-hero h1, .home-section h2, .home-contact h2 { font-weight:800; letter-spacing:var(--home-display-tracking); line-height:var(--home-display-leading); }
      .problem-list h3, .method-list h3, .relay-copy h3, .project--index h3, .audit-card h3, .audit-example h3, .insight-list h3 { letter-spacing:var(--home-heading-tracking); line-height:var(--home-heading-leading); }
      .project-caption strong, .project__bar b, .home-footer strong, .homepage-nav__brand { letter-spacing:var(--home-label-tracking); line-height:1.15; }
      .homepage-hero__lede, .homepage-hero__copy, .problem-grid>div>p, .problem-list p, .method-list p, .section-intro, .insight-list p, .home-contact p { letter-spacing:normal; line-height:var(--home-body-leading); }
      .homepage-cta { letter-spacing:var(--home-label-tracking); line-height:1.2; }
      .home-problem > h2 { max-width: 1040px; font-size:clamp(2.5rem, 4.85vw, 4.6rem); }
      .home-method h2 { max-width: 1050px; font-size:clamp(2.5rem, 4.6vw, 4.5rem); }
      .home-work h2 { max-width: 1120px; font-size:clamp(2.5rem, 4.4vw, 4.4rem); }
      .home-audit h2 { max-width: 700px; font-size:clamp(2.5rem, 4.35vw, 4.25rem); }
      .method-list h3 { font-size:clamp(1.75rem, 3.15vw, 2.85rem); }
      .method-list article { min-height:0; padding:34px 0; }
      .home-audit .section-intro { margin-top:42px; }
      .home-scorecard-cta-group { display:flex; align-items:center; flex-wrap:wrap; gap:16px 20px; margin-top:30px; }
      .home-scorecard-cta-group .homepage-scorecard-cta { flex:none; }
      .home-scorecard-cta-group p { margin:0; color:var(--muted); font-size:12px; line-height:1.4; }
      @media (max-width: 520px) {
        .homepage { --home-display-tracking: -.01em; --home-heading-tracking: -.01em; }
        .home-problem > h2, .home-method h2, .home-work h2, .home-audit h2 { font-size:clamp(2.25rem, 10.8vw, 2.85rem); }
        .method-list h3 { font-size:clamp(1.7rem, 7.8vw, 2rem); }
        .method-list article { padding:24px 0; }
      }
      @media (min-width: 521px) and (max-width: 800px) {
        .method-list article { padding:30px 0; }
        .method-list article > div { padding-top:14px; }
      }
      @media (max-width: 520px) { .homepage-cta-group { align-items:flex-start; flex-direction:column; gap:12px; margin-top:32px; } }

      .home-audit ol {
        max-width: 610px;
        margin-top: 28px;
      }
      .home-audit li {
        padding: 10px 0 14px;
        border-top: 0;
        border-bottom: 1px solid var(--line);
        line-height: 1.35;
      }
      .home-audit li + li {
        padding-top: 12px;
      }
      .audit-card {
        padding: 24px 27px;
      }
      .audit-card label {
        margin-top: 12px;
      }
      .audit-card input,
      .audit-card select {
        height: 46px;
        margin-top: 8px;
      }
      .audit-card .homepage-cta {
        margin-top: 22px;
        margin-bottom: 14px;
      }
      @media (max-width: 800px) {
        .home-audit ol { max-width: 100%; }
      }
      .scorecard-select { position: relative; margin-top: 8px; }
      .audit-card__select-label {
        display: block;
        margin-top: 12px;
        color: #555;
        font: 9px ui-monospace, monospace;
        text-transform: uppercase;
      }
      .scorecard-select__trigger,
      .scorecard-select__option {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 0;
        color: var(--ink);
        background: var(--paper);
        font: 15px inherit;
        text-align: left;
      }
      .scorecard-select__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 46px;
        padding: 0 14px;
      }
      .scorecard-select__trigger i {
        width: 7px;
        height: 7px;
        margin-left: 16px;
        border-right: 1px solid currentColor;
        border-bottom: 1px solid currentColor;
        transform: rotate(45deg) translateY(-2px);
      }
      .scorecard-select__trigger[aria-expanded="true"] {
        border-color: var(--blue);
      }
      .scorecard-select__menu {
        position: absolute;
        z-index: 5;
        top: calc(100% + 4px);
        right: 0;
        left: 0;
        padding: 4px;
        border: 1px solid var(--line);
        background: var(--paper);
        max-height: min(356px, 60vh);
        overflow-y: auto;
      }
      .scorecard-select__placeholder { color: var(--muted); }
      .scorecard-select__option {
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 0 10px;
        border: 0;
      }
      .scorecard-select__option:hover,
      .scorecard-select__option:focus-visible {
        background: rgba(45, 98, 231, .08);
        outline: none;
      }
      .scorecard-select__option b {
        width: 18px;
        color: var(--blue);
        font-size: 13px;
      }
    `}</style>
    <section className="homepage__canvas homepage-hero-frame">
      <header className="homepage-nav"><a className="homepage-nav__brand" href="#top" aria-label="CloudSight home">CloudSight</a><button className="homepage-nav__menu" type="button" aria-expanded={menuOpen} aria-controls="homepage-navigation" onClick={() => setMenuOpen(!menuOpen)}><span>Menu</span><span className="homepage-nav__grid" aria-hidden="true"><i /><i /><i /><i /></span></button><nav className={menuOpen ? "homepage-menu homepage-menu--open" : "homepage-menu"} id="homepage-navigation" aria-label="Primary navigation"><a href="#top" onClick={() => setMenuOpen(false)}>Home</a><Link to="/website-audit" onClick={() => setMenuOpen(false)}>Website audit</Link><Link to="/spend-guard" onClick={() => setMenuOpen(false)}>Spend Guard</Link></nav></header>
      <section className="homepage-hero" aria-labelledby="homepage-heading"><Eyebrow number="01">Conversion studio</Eyebrow><h1 id="homepage-heading"><span>More than traffic.</span><span>More <em>users.</em></span></h1><div className="homepage-hero__details"><div><p className="homepage-hero__lede">Conversion-focused websites for growing B2B SaaS companies.</p><p className="homepage-hero__copy">We improve product messaging, website design, and conversion paths to turn more visitors into users.</p><div className="homepage-cta-group"><Link to="/saas-scorecard" className="homepage-scorecard-cta">Take the Quiz ↗</Link><p className="homepage-scorecard-note">10 questions · About 2 minutes</p></div></div><TalkLink location="homepage_hero" /></div><p className="homepage-services"><i /> Strategy <b>/</b> Design <b>/</b> Optimization</p></section>
    </section>
    <section className="home-section home-problem" id="problem"><Eyebrow number="02">The problem</Eyebrow><h2>People visit your SaaS website.<br />But they don't sign up.</h2><div className="problem-grid"><div><i className="blue-rule" /><p>You've built the product. You're getting visitors. But too many leave without starting a trial or booking a demo. We help you find out why — and improve the website experience.</p></div><div className="problem-list">{problems.map(([n, t, p]) => <article key={n}><span>{n}</span><div><h3>{t}</h3><p>{p}</p></div></article>)}</div></div></section>
    <section className="home-section home-method" id="approach"><Eyebrow number="03">What we do</Eyebrow><h2>Turn more website visitors into SaaS users.</h2><div className="method-list">{services.map(([n, t, p, tags]) => <article key={n}><span>{n}</span><h3>{t}</h3><div><p>{p}</p><small>{tags}</small></div></article>)}</div></section>
    <section className="home-section home-work" id="work"><Eyebrow number="04">Our work</Eyebrow><h2>Websites that make SaaS products easier to understand — and easier to sign up for.</h2><p className="section-intro">Explore how we design SaaS websites that explain the product, build confidence, and guide visitors toward taking action.</p><small className="home-work__disclosure">Featured concept designs — not commissioned client projects or verified performance results.</small><div className="project project--relay"><div className="project__bar"><b>relay<sup>®</sup></b><small>Product　 How it works　 Start a workspace ↗</small></div><div className="relay-copy"><h3>Less chasing.<br />More doing.</h3><p>One shared place for the decisions, documents and next steps that move your team forward.</p><b>■　Make room for good work ↗</b></div><div className="relay-panel"><small>Launch workspace</small><h4>Good work starts<br />with a clear next step.</h4><ul><li>Brand story approved</li><li>Website direction in review</li><li>Launch plan up next</li></ul></div></div><ProjectCaption name="Relay" caption="Product storytelling / Website direction" /><div className="project project--index"><div className="project__bar"><b>index_</b><small>Built for builders</small></div><h3>Complex data.<br />Simple by design.</h3><div className="index-tabs"><span><i>01</i>Connect</span><span><i>02</i>Structure</span><span><i>03</i>Build</span></div></div><ProjectCaption name="Index" caption="Positioning / Visual system / Conversion path" /></section>
    <section className="home-section home-audit" id="website-audit"><Eyebrow number="05">Website scorecard</Eyebrow><div className="audit-grid"><div><h2>Getting visitors, but not enough signups?</h2><p className="section-intro">Take our free 2-minute scorecard to find out what might be holding your website back — from unclear messaging to signup friction.</p><div className="home-scorecard-cta-group"><Link to="/saas-scorecard" className="homepage-scorecard-cta">Check your website ↗</Link><p>10 questions · Free self-assessment</p></div><ol><li>Is your value clear in the first few seconds?</li><li>Does the design guide attention to what matters?</li><li>Is the next step obvious, relevant and easy?</li></ol></div><div className="audit-card"><h3>Your website. A fresh view.</h3><p>Share your site and tell us what you want it to do better. This is where our conversation starts.</p><label>Website<input placeholder="Your website address" readOnly /></label><label>Work email<input placeholder="You@company.com" readOnly /></label><div className="audit-card__select-label">What would you like to improve?<ScorecardSelect value={scorecardGoal} onChange={setScorecardGoal} /></div><TalkLink location="homepage_scorecard" to={scorecardGoal ? `/website-audit?goal=${encodeURIComponent(scorecardGoal)}` : "/website-audit"} /><small>An audit conversation, not a sales deck. We’ll agree the scope with you before starting.</small></div></div><div className="audit-example"><div><small>Inside the scorecard / illustrative</small><h3>Not just a score.<br />A way forward.</h3></div><div><small>Message clarity → Priority to review</small><h3>Lead with the customer’s outcome.</h3><p>If a headline describes the platform but not its value, test a specific customer benefit first.</p></div></div></section>
    <section className="home-section home-insights" id="insights"><Eyebrow number="06">Insights</Eyebrow><h2>Better thinking. Better<br />growth.</h2><div className="insight-list">{insights.map(([category, time, title, copy]) => <article key={title}><div><small><i /> {category}</small><small>{time}</small></div><div><h3>{title}</h3><p>{copy}</p></div><b aria-hidden="true">↗</b></article>)}</div></section>
    <section className="home-section home-contact" id="contact"><Eyebrow number="07">Contact</Eyebrow><h2>Let’s turn more<br />visitors into <em>users.</em></h2><div><p>A clearer message. A more purposeful website. Start with the website scorecard and a conversation about what comes next.</p><TalkLink location="homepage_contact" /></div></section>
    <footer className="home-footer"><div><strong>CloudSight</strong><small>Strategy　/　Design　/　Optimization</small></div><span>© {new Date().getFullYear()} CloudSight</span><i aria-hidden="true">▪▪</i></footer>
  </main>;
}
function ProjectCaption({ name, caption }: { name: string; caption: string }) { return <div className="project-caption"><strong>{name} ↗</strong><span>{caption}</span><small>Concept work</small></div>; }
