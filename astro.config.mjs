import { defineConfig } from 'astro/config';
import remarkBlog from './scripts/remark-blog.mjs';

export default defineConfig({
  site: 'https://wabokkio.nl',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: { defaultLocale: 'nl', locales: ['nl', 'en'], routing: { prefixDefaultLocale: false } },
  build: { inlineStylesheets: 'never', format: 'directory' },
  markdown: { remarkPlugins: [remarkBlog] },
});
