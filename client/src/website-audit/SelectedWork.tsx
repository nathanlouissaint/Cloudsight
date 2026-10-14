import { ArrowUpRight } from "lucide-react";
import { analytics } from "../lib/analytics";
import aetherScreenshot from "../assets/selected-work/aether.webp";
import vertexScreenshot from "../assets/selected-work/vertex-it.webp";

const projects = [
  { name: "Vertex IT", category: "Managed IT Services", type: "Concept Website", url: "https://vertex.cloudsightmail.com", image: vertexScreenshot, imageAlt: "Vertex IT website homepage featuring a managed IT services headline", description: "A clear, conversion-led concept for a managed IT partner, built to make its services and assessment path easy to understand." },
  { name: "AETHER", category: "Enterprise Intelligence Platform", type: "Concept Website", url: "https://aether-b1on.onrender.com", image: aetherScreenshot, imageAlt: "AETHER website homepage featuring an enterprise intelligence platform headline", description: "A focused concept for bringing business data, reporting, and decision-making into one clearer enterprise experience." },
];

function getReturnUrl() {
  const fallback = new URL("/website-audit", window.location.origin);
  const configured = import.meta.env.VITE_WEBSITE_AUDIT_RETURN_URL?.trim();
  if (!configured) return fallback.href;
  try {
    const url = new URL(configured, window.location.origin);
    const isLocalDevelopmentUrl = import.meta.env.DEV && url.origin === "http://localhost:5174";
    if (url.pathname !== "/website-audit" || (url.protocol !== "https:" && !isLocalDevelopmentUrl)) return fallback.href;
    return url.href;
  } catch {
    return fallback.href;
  }
}

function getProjectUrl(projectUrl: string) {
  const url = new URL(projectUrl);
  url.searchParams.set("returnTo", getReturnUrl());
  return url.href;
}

export function SelectedWork() {
  const trackClick = (project: typeof projects[number]) => analytics.track("website_audit_selected_work_clicked", { project_name: project.name, destination_url: project.url });
  return <section className="wa-selected-work" aria-labelledby="selected-work-heading"><div className="wa-selected-work__intro"><p className="wa-eyebrow">Selected Work / CloudSight</p><h2 id="selected-work-heading">See what we can build for you.</h2><p>Explore websites designed to make complex businesses easier to understand, trust, and choose.</p></div><div className="wa-selected-work__grid">{projects.map((project, index) => { const projectUrl = getProjectUrl(project.url); return <article className="wa-work-card" key={project.name}><a className="wa-work-card__preview" href={projectUrl} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${project.name} website (opens in a new tab)`} onClick={() => trackClick(project)}><span className="wa-work-card__browser" aria-hidden="true"><i /><i /><i /><b>{project.url.replace("https://", "")}</b></span><span className="wa-work-card__screen"><img src={project.image} alt={project.imageAlt} /></span><span className="wa-work-card__visit" aria-hidden="true"><ArrowUpRight size={18} /></span></a><div className="wa-work-card__content"><div className="wa-work-card__index"><span>0{index + 1}</span><span>{project.type}</span></div><h3>{project.name}</h3><p className="wa-work-card__category">{project.category}</p><p className="wa-work-card__description">{project.description}</p><a className="wa-work-card__link" href={projectUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(project)}>Explore Website <ArrowUpRight size={16} aria-hidden="true" /><span className="wa-sr-only">(opens in a new tab)</span></a></div></article>; })}</div></section>;
}
