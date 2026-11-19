export type HomepageAuditMetadata = {
  title: string | null;
  metaDescription: string | null;
  h1: string[];
  h2: string[];
  ctas: { text: string; href: string }[];
  internalNavigation: { text: string; href: string }[];
  forms: { action: string | null; method: string; fields: string[] }[];
  mainText?: string;
};

export type ConversionFinding = {
  id: string;
  category: "messaging" | "metadata" | "calls_to_action";
  severity: "high" | "medium";
  observedEvidence: string;
  explanation: string;
  recommendedAction: string;
  confidence: "high" | "medium";
  source: string;
};

const genericHeadlines = new Set(["home", "welcome", "welcome to our website", "coming soon", "hello world"]);
const genericCtas = new Set(["click here", "learn more", "read more", "submit", "explore", "more"]);

function normalized(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function missingHeadline(source: string): ConversionFinding {
  return {
    id: "missing-primary-headline",
    category: "messaging",
    severity: "high",
    observedEvidence: "No H1 heading was detected in the captured homepage HTML.",
    explanation: "The audit could not identify a primary homepage headline from the public page structure.",
    recommendedAction: "Add one descriptive H1 that states what the product or service is and who it is for.",
    confidence: "high",
    source,
  };
}

export function analyzeHomepageConversion(metadata: HomepageAuditMetadata, source: string): ConversionFinding[] {
  const findings: ConversionFinding[] = [];
  const h1 = Array.isArray(metadata.h1) ? metadata.h1.filter(Boolean) : [];
  const ctas = Array.isArray(metadata.ctas) ? metadata.ctas : [];
  const forms = Array.isArray(metadata.forms) ? metadata.forms : [];

  if (!metadata.metaDescription?.trim()) {
    findings.push({
      id: "missing-meta-description",
      category: "metadata",
      severity: "medium",
      observedEvidence: "No meta description was detected in the captured homepage HTML.",
      explanation: "Search and social previews may have to infer a description from page content instead of using an author-provided summary.",
      recommendedAction: "Add a concise meta description that describes the offering and intended audience.",
      confidence: "high",
      source,
    });
  }

  if (h1.length === 0) {
    findings.push(missingHeadline(source));
  } else if (genericHeadlines.has(normalized(h1[0]))) {
    findings.push({
      id: "unclear-primary-headline",
      category: "messaging",
      severity: "medium",
      observedEvidence: `The first H1 is “${h1[0]}”.`,
      explanation: "This heading is a generic site label and does not describe an offering, audience, or outcome on its own.",
      recommendedAction: "Replace the generic H1 with a specific statement of the offering and its intended audience or outcome.",
      confidence: "high",
      source,
    });
  }

  const genericLabels = [...new Set(ctas.map((cta) => cta.text?.trim()).filter((label): label is string => Boolean(label) && genericCtas.has(normalized(label))))];
  if (genericLabels.length) {
    findings.push({
      id: "generic-cta-label",
      category: "calls_to_action",
      severity: "medium",
      observedEvidence: `Detected CTA label${genericLabels.length > 1 ? "s" : ""}: ${genericLabels.map((label) => `“${label}”`).join(", ")}.`,
      explanation: "These labels do not communicate what a visitor will receive or do after selecting the link.",
      recommendedAction: "Use CTA labels that name the next step or outcome, such as requesting a demo, viewing pricing, or starting a trial.",
      confidence: "high",
      source,
    });
  }

  if (ctas.length === 0 && forms.length === 0) {
    findings.push({
      id: "missing-obvious-next-step",
      category: "calls_to_action",
      severity: "medium",
      observedEvidence: "No CTA candidates or forms were detected in the captured homepage HTML.",
      explanation: "The audit could not identify an obvious action path from the public homepage markup.",
      recommendedAction: "Add a clearly labeled next step that matches the visitor’s likely intent, such as a demo request, trial, contact path, or product exploration path.",
      confidence: "medium",
      source,
    });
  }

  return findings;
}
