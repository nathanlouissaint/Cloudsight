export type AnalyticsEventName =
  | "landing_viewed"
  | "hero_cta_clicked"
  | "signup_started"
  | "signup_completed"
  | "aws_connection_started"
  | "mock_aws_account_verified"
  | "sample_data_selected"
  | "aws_access_requested"
  | "budget_created"
  | "analysis_viewed"
  | "demo_requested"
  | "website_audit_page_viewed"
  | "website_audit_cta_clicked"
  | "website_audit_form_started"
  | "website_audit_form_submitted"
  | "website_audit_qualified_lead"
  | "website_audit_booking_clicked"
  | "website_audit_selected_work_clicked"
  | "portfolio_project_viewed"
  | "portfolio_case_study_clicked"
  | "portfolio_live_demo_clicked"
  | "portfolio_return_to_cloudsight"
  | "portfolio_booking_clicked"
  | "homepage_viewed"
  | "website_review_cta_clicked"
  | "calendly_outbound_clicked"
  | "homepage_faq_opened"
  | "homepage_scroll_75";

type AnalyticsPropertyValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

export type ConsentPreferences = { analytics: boolean; marketing: boolean };
const consentStorageKey = "cloudsight-consent-v1";
const consentEventName = "cloudsight:consent-changed";
let gaLoaded = false;
let metaLoaded = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

function getPreferences(): ConsentPreferences | null {
  try {
    const raw = window.localStorage.getItem(consentStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") return null;
    return { analytics: parsed.analytics, marketing: parsed.marketing };
  } catch { return null; }
}

function loadGa4() {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim();
  if (gaLoaded || !measurementId) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args) => { window.dataLayer?.push(args); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true, send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}

function loadMetaPixel() {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID?.trim();
  if (metaLoaded || !pixelId) return;
  metaLoaded = true;
  const queue = (...args: unknown[]) => { (queue as unknown as { queue: unknown[][] }).queue.push(args); };
  (queue as unknown as { queue: unknown[][]; loaded: boolean; version: string }).queue = [];
  (queue as unknown as { queue: unknown[][]; loaded: boolean; version: string }).loaded = true;
  (queue as unknown as { queue: unknown[][]; loaded: boolean; version: string }).version = "2.0";
  window.fbq = queue; window._fbq = queue;
  window.fbq("init", pixelId); window.fbq("track", "PageView");
  const script = document.createElement("script");
  script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.append(script);
}

function applyConsent(preferences: ConsentPreferences) {
  if (preferences.analytics) loadGa4();
  if (preferences.marketing) { loadMetaPixel(); if (metaLoaded) window.fbq?.("consent", "grant"); }
  if (!preferences.marketing && metaLoaded) window.fbq?.("consent", "revoke");
}

function safeProperties(properties?: AnalyticsProperties) {
  return Object.fromEntries(Object.entries(properties ?? {}).filter(([key, value]) => {
    const sensitiveKey = /(^|_)(email|name|phone|address|user_?id|token|password|secret)(_|$)/i.test(key);
    const looksLikePersonalValue = typeof value === "string" && (value.includes("@") || value.length > 200);
    return !sensitiveKey && !looksLikePersonalValue;
  }));
}

export const consent = {
  get: getPreferences,
  set(preferences: ConsentPreferences) {
    window.localStorage.setItem(consentStorageKey, JSON.stringify(preferences));
    applyConsent(preferences);
    window.dispatchEvent(new CustomEvent<ConsentPreferences>(consentEventName, { detail: preferences }));
  },
  subscribe(listener: (preferences: ConsentPreferences) => void) {
    const handler = (event: Event) => listener((event as CustomEvent<ConsentPreferences>).detail);
    window.addEventListener(consentEventName, handler);
    return () => window.removeEventListener(consentEventName, handler);
  },
};

export const analytics = {
  init() { const preferences = consent.get(); if (preferences) applyConsent(preferences); },
  track(eventName: AnalyticsEventName, properties?: AnalyticsProperties) {
    if (!consent.get()?.analytics) return;
    loadGa4();
    window.gtag?.("event", eventName, { environment: import.meta.env.PROD ? "production" : "development", ...safeProperties(properties) });
    if (consent.get()?.marketing && (eventName === "website_review_cta_clicked" || eventName === "calendly_outbound_clicked")) {
      window.fbq?.("trackCustom", eventName);
    }
  },
  identify(userId: string, properties?: AnalyticsProperties) {
    // GA4 and Meta Pixel intentionally not identified with application user data
    void userId; void properties;
  },
  reset() { /* no identity */ },
};
