// Source-to-site copy check.
// Confirms that the three preserved sections on the built Home page — the
// introduction ("As our world…"), Goals of the Course, and Topics Covered — match
// content/offerings/<offering>/course-copy.json exactly: same blocks, same order,
// same words and punctuation, same emphasis and links. Only whitespace at the
// edges of a block is ignored.
//
// Usage: npm run build && npm run verify:copy

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const site = parse(readFileSync('content/site.yaml', 'utf8'));
const copy = JSON.parse(readFileSync(`content/offerings/${site.currentOffering}/course-copy.json`, 'utf8'));
const html = readFileSync('dist/index.html', 'utf8');

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

// Inline HTML -> runs [{text, bold, italic, href}], merging neighbours with the same formatting.
function htmlToRuns(inner) {
  const runs = [];
  const state = { bold: 0, italic: 0, href: [] };
  for (const part of inner.split(/(<[^>]+>)/)) {
    if (!part) continue;
    if (part.startsWith('<')) {
      const tag = /^<\/?([a-z0-9]+)/i.exec(part)?.[1]?.toLowerCase();
      const closing = part.startsWith('</');
      if (tag === 'strong' || tag === 'b') state.bold += closing ? -1 : 1;
      else if (tag === 'em' || tag === 'i') state.italic += closing ? -1 : 1;
      else if (tag === 'a') closing ? state.href.pop() : state.href.push(decode(/href="([^"]*)"/.exec(part)?.[1] ?? ''));
      else throw new Error(`Unexpected tag inside preserved copy: ${part}`);
      continue;
    }
    push(runs, { text: decode(part), bold: state.bold > 0, italic: state.italic > 0, href: state.href.at(-1) ?? null });
  }
  return trim(runs);
}
function push(runs, run) {
  const last = runs.at(-1);
  if (last && last.bold === run.bold && last.italic === run.italic && last.href === run.href) last.text += run.text;
  else runs.push(run);
}
function trim(runs) {
  const out = runs.filter((r) => r.text.length);
  if (out.length) {
    out[0].text = out[0].text.trimStart();
    out[out.length - 1].text = out.at(-1).text.trimEnd();
  }
  return out.filter((r) => r.text.length);
}
const normalise = (source) => {
  const runs = [];
  for (const r of source) push(runs, { text: r.text, bold: !!r.bold, italic: !!r.italic, href: r.href ?? null });
  return trim(runs);
};

// Blocks on the page, in document order, keyed by their data-copy-block value.
const found = [];
for (const m of html.matchAll(/<(p|li|h2|h3)\b[^>]*\bdata-copy-block="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) found.push({ key: m[2], runs: htmlToRuns(m[3]) });

const expected = [
  ...copy.introduction.map((runs) => ({ key: 'introduction', runs })),
  { key: 'goals-heading', runs: copy.goals.heading },
  ...copy.goals.items.map((runs) => ({ key: 'goals', runs })),
  { key: 'topics-heading', runs: copy.topics.heading },
  ...copy.topics.blocks.map((b) => ({ key: b.type === 'subheading' ? 'topics-subheading' : 'topics-paragraph', runs: b.runs })),
].map((b) => ({ key: b.key, runs: normalise(b.runs) }));

let failures = 0;
const fail = (message) => { failures++; console.error(`  ✗ ${message}`); };

if (found.length !== expected.length) fail(`Expected ${expected.length} preserved blocks on the Home page, found ${found.length}.`);
expected.forEach((want, i) => {
  const got = found[i];
  const label = `block ${i + 1} (${want.key}) “${want.runs.map((r) => r.text).join('').slice(0, 48)}…”`;
  if (!got) return fail(`${label}: missing from the page.`);
  if (got.key !== want.key) return fail(`${label}: found a “${got.key}” block in this position (order changed).`);
  if (JSON.stringify(got.runs) !== JSON.stringify(want.runs)) {
    fail(`${label}: wording, punctuation, emphasis or links differ.`);
    console.error(`      source: ${JSON.stringify(want.runs)}`);
    console.error(`      page:   ${JSON.stringify(got.runs)}`);
  }
});

const words = expected.reduce((n, b) => n + b.runs.map((r) => r.text).join('').split(/\s+/).filter(Boolean).length, 0);
if (failures) {
  console.error(`\nCopy check FAILED: ${failures} problem(s). Source: ${copy.source.url}`);
  process.exit(1);
}
console.log(`Copy check passed: ${expected.length} blocks (${words} words) match the source exactly.`);
console.log(`  introduction: ${copy.introduction.length} paragraphs · goals: heading + ${copy.goals.items.length} items · topics: heading + ${copy.topics.blocks.filter((b) => b.type === 'subheading').length} sub-headings + ${copy.topics.blocks.filter((b) => b.type === 'paragraph').length} paragraphs`);
console.log(`  source: ${copy.source.url} (retrieved ${copy.source.retrieved})`);
