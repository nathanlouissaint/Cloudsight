import { ArrowDown, ArrowUpRight, Check } from "lucide-react";

interface CtaProps { onCtaClick: (location: string) => void; }

export function AuditButton({ onCtaClick, location, children }: CtaProps & { location: string; children: React.ReactNode }) {
  return <button className="wa-button" type="button" onClick={() => onCtaClick(location)}>{children}<ArrowUpRight size={18} aria-hidden="true" /></button>;
}

export function WebsiteAuditHero({ onCtaClick }: CtaProps) {
  return <section className="wa-hero" id="top">
    <div className="wa-hero__copy">
      <p className="wa-eyebrow">Free website audit for B2B tech companies</p>
      <h1>Your website should be<br /><em>winning you clients.</em></h1>
      <p className="wa-hero__lede">We'll show you what's hurting your website's credibility, conversions, and ability to generate demand — and exactly what we'd fix.</p>
      <AuditButton onCtaClick={onCtaClick} location="hero">Get my free website audit</AuditButton>
      <p className="wa-microcopy"><Check size={15} aria-hidden="true" /> No obligation. Actionable recommendations you can use immediately.</p>
    </div>
    <div className="wa-browser" role="img" aria-label="Illustration of a refined technology company website">
      <div className="wa-browser__bar"><i /><i /><i /><span>yourcompany.com</span></div>
      <div className="wa-browser__canvas">
        <p>INFRASTRUCTURE, MADE CLEAR.</p><strong>Complex systems.<br />Confident decisions.</strong>
        <div className="wa-browser__line" /><div className="wa-browser__line wa-browser__line--short" />
        <span className="wa-browser__cta">Explore the platform <ArrowUpRight size={13} /></span>
        <div className="wa-browser__panel"><span>OPERATING SIGNAL</span><b>+42.8%</b><div><i /><i /><i /><i /><i /><i /></div></div>
      </div>
      <div className="wa-browser__tag">Designed for clarity <ArrowDown size={14} /></div>
    </div>
  </section>;
}
