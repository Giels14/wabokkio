import type { APIRoute } from 'astro';
import { routes, type PageKey } from '../i18n';
import { getPosts, postUrl, findTranslation, isoDate } from '../lib/blog';

// Sitemap met hreflang-paren. Nieuwe blogposts komen er automatisch in.
const skip: PageKey[] = ['thanks', 'notFound'];
export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).toString();
  const entries: { loc: string; alts: Record<string, string>; lastmod?: string }[] = [];
  for (const [key, alt] of Object.entries(routes)) {
    if (skip.includes(key as PageKey)) continue;
    for (const l of ['nl', 'en'] as const) entries.push({ loc: alt[l], alts: { nl: alt.nl, en: alt.en } });
  }
  const posts = await getPosts();
  for (const p of posts) {
    const pair = findTranslation(p, posts);
    entries.push({ loc: postUrl(p), alts: pair ? { [p.data.lang]: postUrl(p), [pair.data.lang]: postUrl(pair) } : {}, lastmod: isoDate(p.data.updated ?? p.data.date) });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => `  <url><loc>${abs(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}${Object.entries(e.alts).map(([l, u]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(u)}"/>`).join('')}${e.alts.nl && e.alts.en ? `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(e.alts.nl)}"/>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
