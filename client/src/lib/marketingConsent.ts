export type MarketingConsent = "granted" | "denied";
const key = "cloudsight-marketing-consent-v1";
let memory: MarketingConsent | null = null;
export function getMarketingConsent(): MarketingConsent | null { try { const value = localStorage.getItem(key); return value === "granted" || value === "denied" ? value : null; } catch { return memory; } }
export function hasMarketingConsent() { return getMarketingConsent() === "granted"; }
export function setMarketingConsent(value: MarketingConsent) { memory = value; try { localStorage.setItem(key, value); } catch { /* session-only fallback */ } }
