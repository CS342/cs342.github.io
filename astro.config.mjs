import { defineConfig } from 'astro/config';

// Where the site is served from.
//   GitHub Pages project site (default): https://stanfordbdhg.github.io/CS342/
//   Custom domain (e.g. cs342.stanford.edu): set SITE_URL to the domain and BASE_PATH to "/".
// The deploy workflow fills both in from the repository's Pages settings.
const site = process.env.SITE_URL || 'https://stanfordbdhg.github.io';
const base = process.env.BASE_PATH === undefined ? '/CS342' : process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Keep standard HTML whitespace handling so inline text is never run together.
  compressHTML: true,
});
