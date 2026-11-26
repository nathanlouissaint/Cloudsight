import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import pages from "./pages.json";

const origin = "https://cloudsightmail.com";
const publicPages: Record<string, { title: string; description: string; noindex?: boolean }> = pages;

export function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const page = publicPages[path];
    const setMeta = (attribute: "name" | "property", key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.append(element); }
      element.content = value;
    };
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (page) {
      const url = origin + path;
      document.title = page.title;
      setMeta("name", "description", page.description);
      setMeta("name", "robots", page.noindex ? "noindex, nofollow" : "index, follow");
      setMeta("property", "og:title", page.title);
      setMeta("property", "og:description", page.description);
      setMeta("property", "og:url", url);
      setMeta("property", "og:type", "website");
      setMeta("property", "og:site_name", "CloudSight");
      setMeta("name", "twitter:card", "summary");
      setMeta("name", "twitter:title", page.title);
      setMeta("name", "twitter:description", page.description);
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
      canonical.href = url;
    } else {
      document.title = "CloudSight";
      setMeta("name", "robots", "noindex, nofollow");
      canonical?.remove();
      for (const selector of ['meta[name="description"]', 'meta[property^="og:"]', 'meta[name^="twitter:"]']) {
        document.head.querySelectorAll(selector).forEach(element => element.remove());
      }
    }
    let structured = document.head.querySelector<HTMLScriptElement>('script[data-cloudsight-schema]');
    if (path === "/" && !structured) { structured = document.createElement("script"); structured.type = "application/ld+json"; structured.dataset.cloudsightSchema = ""; document.head.append(structured); }
    if (structured) structured.text = path === "/" ? JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", "@id": `${origin}/#organization`, name: "CloudSight", url: `${origin}/`, logo: `${origin}/cloudsight-logo.png` }, { "@type": "WebSite", "@id": `${origin}/#website`, url: `${origin}/`, name: "CloudSight", publisher: { "@id": `${origin}/#organization` } }] }) : "";
  }, [pathname]);
  return null;
}
