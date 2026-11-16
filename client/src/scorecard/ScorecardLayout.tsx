import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function ScorecardLayout({ children }: { children: ReactNode }) {
  return <main className="scorecard-page"><div className="scorecard-shell"><header className="scorecard-header"><Link to="/" className="scorecard-wordmark">CloudSight</Link><span>SAAS WEBSITE SCORECARD</span></header>{children}</div></main>;
}
