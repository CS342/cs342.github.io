// Link check for the built site (run `npm run build` first).
//   - every internal link and asset must resolve to a file in dist/
//   - every in-page anchor (#id) must exist on its target page
//   - external links are requested once each and reported (pass --offline to skip)
//
// Usage: npm run check:links [-- --offline]

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const offline = process.argv.includes('--offline');

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) pages.push(path);
  }
})(DIST);

// The base path is whatever prefix the built pages use for the home link.
const home = readFileSync(join(DIST, 'index.html'), 'utf8');
const base = (/<a class="lockup" href="([^"]*)"/.exec(home)?.[1] ?? '/').replace(/\/$/, '');
// The site's own address (canonical links); not checked, since it may not be deployed yet.
const self = /<link rel="canonical" href="([^"]*)"/.exec(home)?.[1] ?? null;

const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) idsCache.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsCache.get(file);
};
const resolveInternal = (path) => {
  const rel = path.slice(base.length) || '/';
  const candidates = rel.endsWith('/') ? [join(DIST, rel, 'index.html')] : [join(DIST, rel), join(DIST, rel, 'index.html'), join(DIST, `${rel}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
};

const problems = [];
const external = new Map();
let internalCount = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const raw = m[1].replace(/&amp;/g, '&');
    if (raw.startsWith('mailto:') || raw.startsWith('data:')) continue;
    if (/^https?:\/\//.test(raw)) {
      if (self && raw.startsWith(self)) continue;
      if (!external.has(raw)) external.set(raw, new Set());
      external.get(raw).add(page);
      continue;
    }
    internalCount++;
    const [path, hash] = raw.split('#');
    if (path && !path.startsWith(`${base}/`) && path !== base) {
      problems.push(`${page}: internal link does not start with the base path "${base}/": ${raw}`);
      continue;
    }
    const target = path ? resolveInternal(path.split('?')[0]) : page;
    if (!target) {
      problems.push(`${page}: broken internal link ${raw}`);
      continue;
    }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) problems.push(`${page}: anchor #${hash} not found in ${target}`);
  }
}

console.log(`Internal: ${internalCount} links across ${pages.length} pages (base "${base || '/'}") — ${problems.length ? `${problems.length} problem(s)` : 'all resolve'}`);
problems.forEach((p) => console.error(`  ✗ ${p}`));

let externalFailures = 0;
if (!offline) {
  console.log(`External: checking ${external.size} distinct URLs…`);
  const check = async (link) => {
    const attempt = async (method) => {
      const res = await fetch(link, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0 (link check)' } });
      return res.status;
    };
    let failure;
    for (let tries = 0; tries < 3; tries++) {
      try {
        let status = await attempt('HEAD');
        if (status >= 400) status = await attempt('GET');
        return status;
      } catch (error) {
        failure = `error: ${error.cause?.code ?? error.name}`;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    return failure;
  };
  const results = await Promise.all([...external.keys()].map(async (link) => [link, await check(link)]));
  for (const [link, status] of results.sort()) {
    const ok = typeof status === 'number' && status < 400;
    // Some sites refuse automated requests (403/429/999) although the page exists; flag those for a manual look.
    const manual = [401, 403, 429, 999].includes(status);
    if (!ok && !manual) externalFailures++;
    console.log(`  ${ok ? '✓' : manual ? '?' : '✗'} ${status}  ${link}${manual ? '  (refuses automated checks — open it by hand)' : ''}`);
  }
}

if (problems.length || externalFailures) {
  console.error(`\nLink check FAILED: ${problems.length} internal, ${externalFailures} external.`);
  process.exit(1);
}
console.log('\nLink check passed.');
