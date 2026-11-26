# Technical SEO and Render release notes

The page metadata inventory is `client/src/seo/pages.json`. The client build generates static HTML heads from it and includes only entries without `noindex` in the sitemap. The indexing priority and complete sitemap are `https://cloudsightmail.com/` and `https://cloudsightmail.com/work/saas-growth-system`. Spend Guard and all its descendants are excluded from indexing while remaining navigable; its landing page has a static and client-side `noindex, nofollow` meta tag. Descendants use the SPA's client-side noindex and require the response headers below for initial responses. Review the inventory whenever routes or indexing policy change. The HTML bodies remain client-rendered; crawlers must execute JavaScript. Static prerendering should be evaluated separately with hydration and analytics regression coverage. Aether is an external demonstration, not a dedicated CloudSight case-study URL. Forma is a fictional concept; no product or performance claims are asserted as structured data.

## Render Static Site configuration

Render serves existing files before evaluating rewrite rules. Publish `client/dist` (or `dist` if the service root is `client`), including `robots.txt` and `sitemap.xml`. Configure and test these rules on staging; existing resources can take precedence over rules, including directory index behavior. Do not assume a trailing-slash redirect will override an existing resource. See [Render redirects and rewrites](https://render.com/docs/redirects-rewrites) and [static site headers](https://render.com/docs/static-site-headers).

| Order | Source | Destination | Action | Response header | Trailing slash |
| --- | --- | --- | --- | --- | --- |
| Static | `/robots.txt` | `/robots.txt` | Serve file | `Content-Type: text/plain` | No slash |
| Static | `/sitemap.xml` | `/sitemap.xml` | Serve file | XML content type | No slash |
| Static | `/` | `/index.html` | Serve file | None required | Canonical root |
| 1 | `/work/saas-growth-system` | `/work/saas-growth-system/index.html` | Rewrite | None required | Canonical without slash |
| 2 | `/spend-guard` | `/spend-guard/index.html` | Rewrite | None required | Canonical without slash |
| 3 | `/work/saas-growth-system/` | `/work/saas-growth-system` | 301 redirect | None required | Remove trailing slash if rule is applied |
| 4 | `/spend-guard/` | `/spend-guard` | 301 redirect | None required | Remove trailing slash if rule is applied |
| Last | `/*` | `/index.html` | Rewrite | See header rules below | SPA fallback |

If Render treats a directory or its index as an existing resource before evaluating a rule, the matching rewrite or redirect may be bypassed. Confirm both canonical and slash variants, including initial HTML, on the actual staging service. The canonical link still identifies the preferred URL if a slash variant serves the generated file.

In Render's Headers tab, configure both `/spend-guard` and `/spend-guard/*` with `X-Robots-Tag: noindex, nofollow`. The wildcard must cover the trailing slash and every descendant, including unknown future paths. Retain the existing private-route exclusions: configure each of `/website-audit`, `/website-audit/report`, `/work/saas-growth-system/demo`, `/spend-guard/signup`, `/spend-guard/login`, `/spend-guard/setup`, `/spend-guard/results`, `/dashboard`, `/costs`, `/forecasting`, `/alerts`, and `/reports`, and their separate `/*` variants, with the same header. Header rules are separate from rewrite ordering. Verify headers on original request paths after rewrites, including the Spend Guard root, slash variant, a nested path, and a synthetic report URL; confirm wildcard matching on the actual service. Do not block these paths in robots.txt: crawlers need access to see noindex. These headers are indexing controls, not access controls; authentication remains necessary. The disabled report route currently redirects in the client and is not a public report implementation.

The SPA fallback may return HTTP 200 for unknown paths (soft 404). A true HTTP 404 needs host routing that distinguishes known SPA paths from unknown paths; do not replace the fallback without verifying all app routes. Where that is not supported, treat soft 404s as a release limitation. Test headers on direct requests, including tokenized report URLs, and verify that no proxy or redirect strips them. Avoid exposing real report tokens during tests.

## Release and rollback

Build the exact reviewed commit, deploy to staging, verify response status, content types, canonical heads, noindex headers, SPA navigation, consent, analytics, Calendly, Forma, Aether, and audit security. Confirm the production branch and live commit against the owner before merging. Apply and verify Render rules before enabling indexing. After explicit owner approval, deploy through the normal Render release process and inspect the same checks on production; submit the sitemap in Search Console if authorized. Roll back to the previously verified deployment and restore prior Render rules if regressions occur; recheck the production routes and integrations.
