import { Link } from "react-router-dom";
import { analytics } from "../../lib/analytics";

export function PortfolioReturn({ className = "" }: { className?: string }) {
  return <Link className={className} to="/" onClick={() => analytics.track("portfolio_return_to_cloudsight", { project: "forma" })}>← Back to CloudSight</Link>;
}
