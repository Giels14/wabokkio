import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Post = CollectionEntry<'blog'>;
const today = new Date();

export const postUrl = (p: { data: { lang: Lang; slug: string } }) =>
  p.data.lang === 'nl' ? `/blog/${p.data.slug}/` : `/en/blog/${p.data.slug}/`;
export const printUrl = (p: Post) => `${postUrl(p)}print/`;

/** Gepubliceerde posts (geen draft, datum niet in de toekomst), nieuwste eerst. */
export async function getPosts(lang?: Lang): Promise<Post[]> {
  const all = await getCollection('blog', (p) => !p.data.draft && p.data.date <= today);
  return all.filter((p) => !lang || p.data.lang === lang).sort((a, b) => +b.data.date - +a.data.date);
}

const norm = (u: string) => (u.endsWith('/') ? u : `${u}/`);

/** Zoekt de vertaling: eerst via translationKey, anders via het hreflang-pad. */
export function findTranslation(post: Post, all: Post[]): Post | undefined {
  const other: Lang = post.data.lang === 'nl' ? 'en' : 'nl';
  const cands = all.filter((p) => p.data.lang === other);
  if (post.data.translationKey) {
    const m = cands.find((p) => p.data.translationKey === post.data.translationKey);
    if (m) return m;
  }
  const href = post.data.hreflang?.[other];
  if (href) return cands.find((p) => postUrl(p) === norm(href));
  return cands.find((p) => p.data.hreflang?.[post.data.lang] && norm(p.data.hreflang[post.data.lang]!) === postUrl(post));
}

export const formatDate = (d: Date, lang: Lang) =>
  d.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
