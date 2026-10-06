import { ArrowUpRight } from "lucide-react";

interface WebsiteAuditHeaderProps {
  onCtaClick: () => void;
}

export function WebsiteAuditHeader({ onCtaClick }: WebsiteAuditHeaderProps) {
  return (
    <header className="wa-header">
      <a className="wa-brand" href="#top" aria-label="CloudSight website audit home">
        <span className="wa-brand__mark">C</span>
        <span>CloudSight</span>
      </a>
      <button className="wa-header__cta" type="button" onClick={onCtaClick}>
        Get my free website audit <ArrowUpRight size={15} aria-hidden="true" />
      </button>
    </header>
  );
}
