import { defineConfig } from 'astro/config';

// Where the site is served from.
//   GitHub Pages organization site (default): https://cs342.github.io/
//   Custom domain (e.g. cs342.stanford.edu): set SITE_URL to the domain and BASE_PATH to "/".
// The deploy workflow fills both in from the repository's Pages settings.
const site = process.env.SITE_URL || 'https://cs342.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Short links shared in past years. The archived sites live in public/2019 … public/2022.
  redirects: {
    '/enroll': '/apply/',
    '/partner': '/sponsors/',
    '/rfp': '/sponsors/',
  },
  // Keep standard HTML whitespace handling so inline text is never run together.
  compressHTML: true,
});
