export const SCORING_VERSION = "saas-scorecard-v1" as const;

export type ScorecardCategoryId = "messaging-clarity" | "conversion-experience" | "product-demonstration" | "buyer-trust" | "mobile-experience";
export type AnswerId = "strong" | "partial" | "weak";

export interface ScorecardOption { id: AnswerId; label: string; multiplier: 1 | 0.5 | 0; }
export interface ScorecardQuestion { id: string; categoryId: ScorecardCategoryId; categoryLabel: string; categoryMaximum: number; prompt: string; options: readonly ScorecardOption[]; }

const options = (strong: string, partial: string, weak: string): readonly ScorecardOption[] => [
  { id: "strong", label: strong, multiplier: 1 }, { id: "partial", label: partial, multiplier: 0.5 }, { id: "weak", label: weak, multiplier: 0 },
];

export const scorecardQuestions: readonly ScorecardQuestion[] = [
  { id: "q1", categoryId: "messaging-clarity", categoryLabel: "Messaging clarity", categoryMaximum: 25, prompt: "Can visitors understand what your SaaS does in five seconds?", options: options("Yes, immediately", "Somewhat, but it could be clearer", "No, it needs explaining") },
  { id: "q2", categoryId: "messaging-clarity", categoryLabel: "Messaging clarity", categoryMaximum: 25, prompt: "Does your homepage clearly explain who your product is for?", options: options("Yes, our ideal customer is obvious", "Somewhat, but our audience is broad", "No, it's unclear who we serve") },
  { id: "q3", categoryId: "conversion-experience", categoryLabel: "Conversion experience", categoryMaximum: 25, prompt: "Is the next step obvious when someone visits your website?", options: options("Yes, our primary action is clear", "Somewhat, but there are competing actions", "No, visitors have to figure it out") },
  { id: "q4", categoryId: "conversion-experience", categoryLabel: "Conversion experience", categoryMaximum: 25, prompt: "How easy is it for visitors to start a trial or request a demo?", options: options("Easy, with minimal steps", "Possible, but there is some friction", "Difficult or confusing") },
  { id: "q5", categoryId: "product-demonstration", categoryLabel: "Product demonstration", categoryMaximum: 20, prompt: "Can visitors see how your product actually works?", options: options("Yes, through clear visuals or demos", "Somewhat, but examples are limited", "No, we mostly describe features") },
  { id: "q6", categoryId: "product-demonstration", categoryLabel: "Product demonstration", categoryMaximum: 20, prompt: "Does your website show the results customers can achieve?", options: options("Yes, with clear examples", "Somewhat, but outcomes are vague", "No, we mainly list capabilities") },
  { id: "q7", categoryId: "buyer-trust", categoryLabel: "Buyer trust", categoryMaximum: 15, prompt: "Does your website provide credible evidence that customers trust your product?", options: options("Yes, with relevant customer proof", "Somewhat, but proof is limited", "No, we have little or no proof") },
  { id: "q8", categoryId: "buyer-trust", categoryLabel: "Buyer trust", categoryMaximum: 15, prompt: "Can buyers find the information they need to evaluate your product?", options: options("Yes, important details are easy to find", "Somewhat, but key details are missing", "No, buyers must contact us for basics") },
  { id: "q9", categoryId: "mobile-experience", categoryLabel: "Mobile experience", categoryMaximum: 15, prompt: "Is your website easy to navigate and understand on mobile?", options: options("Yes, it works well on mobile", "Somewhat, but some areas need work", "No, mobile is difficult to use") },
  { id: "q10", categoryId: "mobile-experience", categoryLabel: "Mobile experience", categoryMaximum: 15, prompt: "Can mobile visitors complete your main conversion action without difficulty?", options: options("Yes, the process works smoothly", "Somewhat, but there is friction", "No, the process is difficult or broken") },
];

export type ScorecardAnswers = Partial<Record<string, AnswerId>>;
