import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Menu, MoveRight, Plus, X } from "lucide-react";
import "../styles/studio-demo.css";

const work = [
  { id: "01", title: "Aster House", type: "Hospitality / Identity", className: "aster" },
  { id: "02", title: "Morrow", type: "Culture / Digital", className: "morrow" },
  { id: "03", title: "Bend", type: "Architecture / Commerce", className: "bend" },
  { id: "04", title: "Pace", type: "Wellness / Editorial", className: "pace" },
];

const services = [
  ["01", "Brand worlds", "A recognisable point of view, from the first word to the smallest detail."],
  ["02", "Digital places", "Websites that carry a feeling and make the next step wonderfully obvious."],
  ["03", "Living systems", "Flexible design systems that give ambitious teams room to move."],
];

function approvedReturnUrl() {
  const candidate = import.meta.env.VITE_CLOUDSIGHT_RETURN_URL?.trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    const approved = ["cloudsight.ai", "cloudsight.com"].some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
    return url.protocol === "https:" && approved ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function StudioDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [returnUrl] = useState(approvedReturnUrl);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 150]);

  useEffect(() => {
    const move = (event: PointerEvent) => setCursor({ x: event.clientX, y: event.clientY, visible: true });
    const leave = () => setCursor((current) => ({ ...current, visible: false }));
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <main className="relay-page">
      <motion.div className="scroll-line" style={{ scaleX: progress }} />
      <div className={`cursor-orb ${cursor.visible ? "is-visible" : ""}`} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}><span>explore</span></div>
      <header className="relay-nav">
        <a href="#top" className="wordmark" aria-label="Relay Form home">RELAY<span>FORM</span></a>
        <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#approach">Approach</a><a href="#contact">Contact</a></nav>
        <div className="nav-actions">
          {returnUrl && <a className="return-link" href={returnUrl}>Return <ArrowUpRight size={14} /></a>}
          <button className="menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={23} /></button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && <motion.div className="full-menu" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}>
          <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={27} /></button>
          {[["01", "Work", "#work"], ["02", "Approach", "#approach"], ["03", "Start a project", "#contact"]].map(([number, label, href]) => <a onClick={() => setMenuOpen(false)} href={href} key={label}><sup>{number}</sup>{label}<ArrowDownRight /></a>)}
        </motion.div>}
      </AnimatePresence>

      <section className="hero" id="top">
        <motion.div className="hero-inner" style={{ y: heroY }}>
          <p className="eyebrow">Independent creative practice <span>◎</span> Everywhere</p>
          <h1>Make<br /><em>good</em> noise.</h1>
          <div className="hero-bottom"><p>We shape brands and digital experiences for people with something worth saying.</p><a href="#work" className="round-link" aria-label="Explore selected work"><ArrowDownRight /></a></div>
        </motion.div>
        <div className="hero-sun" aria-hidden="true"><i /><i /><i /><i /><b>RF</b></div>
      </section>

      <section className="manifesto section-shell">
        <p className="section-kicker">[ About the studio ]</p>
        <motion.h2 initial={{ opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.7 }}>The things people remember rarely arrive quietly.</motion.h2>
        <div className="manifesto-detail"><p>Relay Form is a small, sharp collective for organisations in motion. We put useful tension between strategy, identity and technology—so a brand can feel as alive as the people behind it.</p><a href="#approach">More about our approach <MoveRight size={18} /></a></div>
      </section>

      <section className="work-section" id="work">
        <div className="section-shell work-heading"><p className="section-kicker">[ Selected transmissions ]</p><h2>Work with a pulse.</h2><p>Four recent worlds, each made to be entered—not merely viewed.</p></div>
        <div className="work-grid">
          {work.map((project, index) => <motion.article className={`project-card ${project.className}`} key={project.id} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay: index % 2 * 0.1 }}>
            <div className="project-art"><span className="project-number">{project.id}</span><div className="art-mark" /><span className="project-word">{project.title}</span><button aria-label={`View ${project.title}`}><ArrowUpRight /></button></div>
            <div className="project-info"><h3>{project.title}</h3><p>{project.type}</p></div>
          </motion.article>)}
        </div>
        <div className="section-shell all-work"><a href="#contact">See all selected work <ArrowUpRight size={20} /></a></div>
      </section>

      <section className="services section-shell" id="approach">
        <div className="services-intro"><p className="section-kicker">[ What we tune ]</p><h2>A clear signal<br />in a noisy world.</h2><p>We bring enough rigour to make it work, and enough instinct to make it matter.</p></div>
        <div className="service-list">{services.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><Plus size={23} /></article>)}</div>
      </section>

      <section className="closing" id="contact"><div className="closing-grid" /><div className="closing-copy"><p className="section-kicker">[ Your turn ]</p><h2>Let’s make<br /><em>contact.</em></h2><a href="mailto:hello@relayform.studio">hello@relayform.studio <ArrowUpRight /></a></div><p className="closing-note">Available for select partnerships<br />in 2026 / 27</p></section>

      <footer className="relay-footer"><a className="wordmark" href="#top">RELAY<span>FORM</span></a><p>© 2026 Relay Form. Made with considered energy.</p><a href="https://cloudsight.ai" target="_blank" rel="noreferrer">A CloudSight Showcase Project <ArrowUpRight size={14} /></a></footer>
    </main>
  );
}
