import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wabokkio.nl',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'never', format: 'directory' },
});
