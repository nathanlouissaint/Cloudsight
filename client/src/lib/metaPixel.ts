import { hasMarketingConsent } from "./marketingConsent";

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq; } }
const pixelId = import.meta.env.VITE_META_PIXEL_ID;
const enabled = import.meta.env.VITE_META_PIXEL_ENABLED === "true";
let initialized = false;
let granted = false;
let lastPath: string | undefined;
function canTrack() { return enabled && hasMarketingConsent() && Boolean(pixelId); }
export function initMetaPixel() { if (!canTrack()) return false; if (initialized) { if (!granted) window.fbq?.("consent", "grant"); granted = true; return true; } const fbq = ((...args: unknown[]) => fbq.queue?.push(args)) as Fbq; fbq.queue = []; fbq.loaded = true; fbq.version = "2.0"; window.fbq = fbq; window._fbq = fbq; const script = document.createElement("script"); script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js"; script.dataset.cloudsightMetaPixel = pixelId; document.head.appendChild(script); fbq("init", pixelId); fbq("consent", "grant"); initialized = true; granted = true; return true; }
export function trackMetaPageView(path: string) { if (!initMetaPixel() || lastPath === path) return; lastPath = path; window.fbq?.("track", "PageView"); }
export function revokeMetaPixelConsent() { lastPath = undefined; granted = false; if (initialized) window.fbq?.("consent", "revoke"); }
