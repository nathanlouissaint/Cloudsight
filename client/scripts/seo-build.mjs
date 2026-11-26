import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = 'https://cloudsightmail.com';
const pages = JSON.parse(await readFile(new URL('../src/seo/pages.json', import.meta.url), 'utf8'));
const dist = resolve('dist');
const template = await readFile(resolve(dist, 'index.html'), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const [path, page] of Object.entries(pages)) {
  const url = origin + path;
  const title = escape(page.title);
  const description = escape(page.description);
  const structured = path === '/' ? `<script type="application/ld+json" data-cloudsight-schema>${JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', '@id': `${origin}/#organization`, name: 'CloudSight', url: `${origin}/`, logo: `${origin}/cloudsight-logo.png` }, { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'CloudSight', publisher: { '@id': `${origin}/#organization` } }] }).replaceAll('<', '\\u003c')}</script>` : '';
  const tags = `<title>${title}</title>\n    <meta name="description" content="${description}" />\n    <link rel="canonical" href="${url}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="CloudSight" />\n    <meta property="og:title" content="${title}" />\n    <meta property="og:description" content="${description}" />\n    <meta property="og:url" content="${url}" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:title" content="${title}" />\n    <meta name="twitter:description" content="${description}" />\n    ${structured}`;
  const html = template.replace(/<title>.*?<\/title>/s, tags);
  const folder = resolve(dist, `.${path}`);
  await mkdir(folder, { recursive: true });
  await writeFile(resolve(folder, 'index.html'), html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages).map(path => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
