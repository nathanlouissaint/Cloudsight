import { Link } from "react-router-dom";
import { analytics } from "../lib/analytics";

export type PortfolioProjectData = {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  features: readonly string[];
  disclosure: string;
  demoUrl: string;
  ctaLabel: string;
  external?: boolean;
};

export function PortfolioProject({ project }: { project: PortfolioProjectData }) {
  const track = (location: "preview" | "card") => analytics.track("portfolio_live_demo_clicked", { project: project.id, location });
  const preview = <img className="work-preview-image" src={project.image} width="2880" height="1604" loading="lazy" decoding="async" alt={project.imageAlt} />;
  const action = <>{project.ctaLabel} <span aria-hidden="true">↗</span>{project.external && <span className="sr-only"> (opens in a new tab)</span>}</>;
  return <article className="work-project">
    {project.external
      ? <a className="work-preview" href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Explore the ${project.name} live demo (opens in a new tab)`} onClick={() => track("preview")}>{preview}</a>
      : <Link className="work-preview" to={project.demoUrl} aria-label={`Explore the ${project.name} live demo`} onClick={() => track("preview")}>{preview}</Link>}
    <div className="work-project-copy"><p className="work-meta">{project.category}</p><h3>{project.name}</h3><p className="work-type">{project.subtitle}</p><p>{project.description}</p><ul aria-label="Project capabilities">{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><p className="work-disclosure">{project.disclosure}</p><div className="work-actions">
      {project.external
        ? <a className="hs-button" href={project.demoUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("card")}>{action}</a>
        : <Link className="hs-button" to={project.demoUrl} onClick={() => track("card")}>{action}</Link>}
    </div></div>
  </article>;
}
