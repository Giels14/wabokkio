import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blogposts: één markdownbestand per taal in src/content/blog/nl/ en src/content/blog/en/.
// De id wordt "nl/<bestandsnaam>" zodat dezelfde bestandsnaam in beide talen kan bestaan.
const id = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog', generateId: id }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      slug: z.string().regex(/^[a-z0-9-]+$/, 'slug: alleen kleine letters, cijfers en streepjes'),
      lang: z.enum(['nl', 'en']),
      // Zelfde waarde in de NL- en EN-versie = vertaalpaar (hreflang + taalwisselaar)
      translationKey: z.string().optional(),
      // Alternatief: expliciete paden per taal (zoals in de aangeleverde bestanden)
      hreflang: z.object({ nl: z.string().optional(), en: z.string().optional() }).optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
    .passthrough(),
});

// Printversies (optioneel): zelfde bestandsnaam als de post, in src/content/blog-print/<taal>/
const blogPrint = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-print', generateId: id }),
  schema: z.object({ title: z.string(), lang: z.enum(['nl', 'en']) }).passthrough(),
});

export const collections = { blog, blogPrint };
