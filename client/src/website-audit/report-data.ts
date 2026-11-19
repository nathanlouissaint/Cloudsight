import type { WebsiteAuditAiRecommendation } from "./auditLead.service";

export function getDisplayableAiRecommendations(value: unknown): WebsiteAuditAiRecommendation[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { opportunities?: unknown }).opportunities)) return [];
  return (value as { opportunities: unknown[] }).opportunities.filter((item): item is WebsiteAuditAiRecommendation => {
    if (!item || typeof item !== "object") return false;
    const recommendation = item as Partial<WebsiteAuditAiRecommendation>;
    return ["messaging", "calls_to_action", "navigation"].includes(recommendation.category ?? "")
      && typeof recommendation.observedEvidence === "string"
      && typeof recommendation.explanation === "string"
      && typeof recommendation.recommendedAction === "string"
      && ["high", "medium"].includes(recommendation.confidence ?? "");
  }).slice(0, 3);
}
