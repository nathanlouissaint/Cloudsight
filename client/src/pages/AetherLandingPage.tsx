import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, ChevronRight, Menu, Sparkles, X } from "lucide-react";
import ProductShowcase from "../components/aether/ProductShowcase";
import DemoRequestForm from "../components/aether/DemoRequestForm";
import "../styles/aether.css";

const trend = [
  { month: "Jan", value: 42 }, { month: "Feb", value: 49 }, { month: "Mar", value: 46 },
  { month: "Apr", value: 58 }, { month: "May", value: 63 }, { month: "Jun", value: 61 },
  { month: "Jul", value: 74 }, { month: "Aug", value: 82 }, { month: "Sep", value: 91 },
];

function AetherMark() { return <span className="aether-mark" aria-hidden="true"><i /><i /><i /></span>; }

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(8px)" }} whileInView={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

function Dashboard() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  return <div className="dash-shell" aria-label="AETHER intelligence dashboard preview">
    <aside className="dash-rail"><AetherMark /><span className="rail-dot active" /><span className="rail-dot" /><span className="rail-dot" /><span className="rail-dot" /><span className="rail-avatar">AN</span></aside>
    <div className="dash-main">
      <div className="dash-head"><div><span className="dash-kicker">OVERVIEW / Q3</span><strong>Business overview</strong></div><div className="dash-live"><i /> Updated now</div></div>
      <div className="dash-grid">
        <section className="chart-card"><div className="card-head"><div><span>NET REVENUE</span><b>$8.42m</b><em>↑ 18.4%</em></div><button aria-label="Chart options">•••</button></div><div className="chart" ref={chartRef}><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="aetherFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity=".4"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#697080", fontSize: 10 }}/><YAxis hide domain={[0, 100]} /><Tooltip contentStyle={{ background: "#14151b", border: "1px solid #353543", borderRadius: 8 }} /><Area type="monotone" dataKey="value" stroke="#b4a5ff" strokeWidth={2} fill="url(#aetherFill)" isAnimationActive={!reduced && chartInView} animationBegin={120} animationDuration={1100} /></AreaChart></ResponsiveContainer></div></section>
        <section className="brief-card"><div className="brief-icon"><Sparkles size={15} /></div><span className="brief-label">AETHER BRIEF</span><h4>Enterprise revenue is ahead of plan.</h4><p>Three accounts are expanding earlier than expected, putting the quarter 14% ahead of forecast.</p><a href="#capabilities">See the detail <ArrowRight size={13}/></a></section>
      </div>
      <div className="dash-bottom"><div><span>BUSINESS HEALTH</span><b>Strong</b><small><i /> 8 of 9 areas on track</small></div><div><span>FORECAST CONFIDENCE</span><b>91.2%</b><div className="confidence"><i /></div></div><div><span>ITEMS TO REVIEW</span><b>12</b><small>4 need a decision</small></div></div>
    </div>
  </div>;
}

export default function AetherLandingPage() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("platform");
  const reduced = useReducedMotion();
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".aether-page");
    if (!page) return;
    const anchors = page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const scrollToAnchor = (event: MouseEvent) => { const anchor = event.currentTarget as HTMLAnchorElement; const target = document.querySelector(anchor.hash); if (!target) return; event.preventDefault(); target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); history.replaceState(null, "", anchor.hash); };
    anchors.forEach(anchor => anchor.addEventListener("click", scrollToAnchor));
    const sections = ["platform", "product-experience", "outcomes", "demo-request"].map(id => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }), { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(section => observer.observe(section));
    return () => { anchors.forEach(anchor => anchor.removeEventListener("click", scrollToAnchor)); observer.disconnect(); };
  }, [reduced]);
  return <main className="aether-page">
    <nav className="aether-nav" aria-label="Primary navigation"><a className="brand" href="#top"><AetherMark /> AETHER</a><div className="nav-links"><a className={activeSection === "platform" ? "active" : ""} href="#platform">Platform</a><a className={activeSection === "product-experience" ? "active" : ""} href="#product-experience">Product</a><a className={activeSection === "outcomes" ? "active" : ""} href="#outcomes">Outcomes</a></div><div className="nav-actions"><span className="concept-label">Concept site</span><a className="nav-cta" href="#demo-request">Request demo <ArrowRight size={14}/></a><button onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open} aria-controls="aether-mobile-menu">{open ? <X /> : <Menu />}</button></div>{open && <div className="mobile-menu" id="aether-mobile-menu"><a href="#platform" onClick={() => setOpen(false)}>Platform</a><a href="#product-experience" onClick={() => setOpen(false)}>Product</a><a href="#outcomes" onClick={() => setOpen(false)}>Outcomes</a><a href="#demo-request" onClick={() => setOpen(false)}>Request demo</a></div>}</nav>

    <section className="hero" id="top"><div className="grid-orbit" /><div className="hero-copy"><Reveal><div className="eyebrow"><span /> YOUR DATA. ONE CLEAR VIEW.</div></Reveal><h1><motion.span initial={reduced ? false : { opacity: 0, y: 18 }} animate={reduced ? {} : { opacity: 1, y: 0 }} transition={{ duration: .7, delay: .12, ease: [0.16, 1, .3, 1] }}>Your business moves fast.</motion.span><motion.i initial={reduced ? false : { opacity: 0, y: 18 }} animate={reduced ? {} : { opacity: 1, y: 0 }} transition={{ duration: .7, delay: .24, ease: [0.16, 1, .3, 1] }}>Your insights should too.</motion.i></h1><Reveal delay={.34}><p>Stop jumping between spreadsheets, dashboards, and reports. AETHER brings everything together so you can see what's happening, spot opportunities, and make better decisions.</p><div className="hero-actions"><a className="button-light" href="#demo-request">Request a demo <ArrowRight size={16}/></a><a className="text-link" href="#product-experience">See it in action <ChevronRight size={15}/></a></div></Reveal></div><motion.div className="dashboard-wrap" initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={reduced ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: .8, delay: .35, ease: [0.16, 1, .3, 1] }}><Dashboard /></motion.div><div className="hero-note"><span>BUILT FOR TEAMS THAT WANT A CLEARER VIEW</span><div>ARC / <b>northstar</b> / VANTAGE / <i>FOUNDER'S</i></div></div></section>

    <section className="intro" id="platform"><Reveal><span className="section-number">01 — A clearer view of the business</span><div className="intro-grid"><h2>When the numbers line up, your team can move with confidence.</h2><p>AETHER gives everyone the same current picture of the business. See what is changing, understand why, and focus the conversation on what comes next.</p></div></Reveal></section>

    <section className="capabilities" id="capabilities"><div className="section-label">HOW AETHER HELPS</div><div className="capability-grid"><Reveal><article><span className="cap-num">01</span><h3>Bring your data together</h3><p>Connect the systems your team uses today and view the numbers side by side.</p><a href="#product-experience">Explore the product <ArrowRight size={14}/></a></article></Reveal><Reveal delay={.1}><article><span className="cap-num">02</span><h3>Get the full story</h3><p>Move from a top-line number to the people, products, and changes behind it.</p><a href="#product-experience">Explore the product <ArrowRight size={14}/></a></article></Reveal><Reveal delay={.2}><article><span className="cap-num">03</span><h3>Focus on what matters</h3><p>Keep everyday noise out of the way and bring important changes to the surface.</p><a href="#demo-request">Request a demo <ArrowRight size={14}/></a></article></Reveal></div></section>

    <ProductShowcase />

    <section className="outcomes" id="outcomes"><Reveal><div className="outcome-head"><span className="section-number">03 — More time for the work that matters</span><h2>Less hunting for answers. More time making good calls.</h2></div></Reveal><div className="metrics"><Reveal><div><b>41<span>%</span></b><p>less time spent finding and checking information</p></div></Reveal><Reveal delay={.1}><div><b>3.2<span>×</span></b><p>faster from question to a clear next step</p></div></Reveal><Reveal delay={.2}><div><b>11<span> hrs</span></b><p>given back to leaders each week</p></div></Reveal></div><p className="concept-note">Illustrative outcomes for this AETHER concept—not client case-study results.</p></section>

    <DemoRequestForm />
    <section className="final-cta" id="contact"><div className="cta-noise"/><Reveal><div className="eyebrow"><span/> A clearer way forward</div><h2>Get a better read on<br/>your business.</h2><p>See how a shared view of the numbers can make your next decision easier.</p><a className="button-light" href="#demo-request">Request a demo <ArrowRight size={16}/></a></Reveal></section>
    <footer id="resources"><div className="footer-brand"><a className="brand" href="#top"><AetherMark/> AETHER</a><p>A clearer view for growing businesses.</p></div><div className="footer-links"><div><span>PRODUCT</span><a href="#platform">Platform</a><a href="#product-experience">Product experience</a><a href="#outcomes">Outcomes</a></div><div><span>CONCEPT</span><a href="#demo-request">Request a demo</a><a href="#contact">Overview</a><span className="footer-concept">No live product or account access</span></div></div><div className="footer-bottom"><span>© 2026 AETHER — Concept experience</span><span>Privacy&nbsp;&nbsp; Terms</span></div></footer>
  </main>;
}
