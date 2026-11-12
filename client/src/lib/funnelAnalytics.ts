type FunnelProperties = Record<string, string | number | boolean>;

declare global {
  interface Window { dataLayer?: Array<Record<string, unknown>>; }
}

export function trackFunnelEvent(event: string, properties: FunnelProperties = {}) {
  window.dataLayer?.push({ event, ...properties });
}
