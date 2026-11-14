// Builds the verbatim course-copy snapshot from a saved Notion `loadPageChunk` response.
// Usage: node scripts/snapshot-course-copy.mjs <notion-chunk.json>
// Writes content/offerings/winter-2027/course-copy.json (rendered by the site and checked by `npm run verify:copy`).
import { readFileSync, writeFileSync } from 'node:fs';

const PAGE_ID = 'ea1a66df-c9b4-4c90-b690-8de0d083d4e1';
const SOURCE_URL = 'https://stanfordbdhg.notion.site/CS342-MED253-Building-for-Digital-Health-ea1a66dfc9b44c90b6908de0d083d4e1';
const chunk = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const blocks = chunk.recordMap.block;
const val = (id) => { const b = blocks[id]; if (!b) return null; return b.value?.value ?? b.value; };

const flat = [];
const walk = (id) => { const v = val(id); if (!v) return; flat.push(v); if (v.type === 'collection_view') return; for (const c of v.content ?? []) walk(c); };
for (const c of val(PAGE_ID).content) walk(c);

// Notion rich text -> runs [{text, bold?, italic?, href?}]
const runs = (title) => (title ?? []).map(([text, ann = []]) => {
  const r = { text };
  for (const a of ann) { if (a[0] === 'b') r.bold = true; if (a[0] === 'i') r.italic = true; if (a[0] === 'a') r.href = a[1]; }
  return r;
});
const plain = (v) => (v.properties?.title ?? []).map((s) => s[0]).join('');
const isHeader = (v, text) => v.type === 'header' && plain(v).trim() === text;

const iIntro = flat.findIndex((v) => v.type === 'text' && plain(v).startsWith('As our world'));
const iGoals = flat.findIndex((v) => isHeader(v, 'Goals of the Course'));
const iTopics = flat.findIndex((v) => isHeader(v, 'Topics Covered'));
const iDb = flat.findIndex((v) => v.type === 'collection_view');
if ([iIntro, iGoals, iTopics, iDb].some((i) => i < 0)) throw new Error('Could not locate the preserved sections in the Notion data.');

const introduction = [];
for (let i = iIntro; i < iGoals; i++) { const v = flat[i]; if (v.type === 'text' && plain(v).trim()) introduction.push(runs(v.properties.title)); if (v.type === 'divider') break; }

const goalItems = [];
for (let i = iGoals + 1; i < flat.length; i++) { const v = flat[i]; if (v.type === 'divider' || v.type === 'header') break; if (v.type === 'bulleted_list') goalItems.push(runs(v.properties.title)); }

const topicBlocks = [];
for (let i = iTopics + 1; i < iDb; i++) {
  const v = flat[i]; if (v.type !== 'text' || !plain(v).trim()) continue;
  const r = runs(v.properties.title);
  // In the source, subheadings are paragraphs set entirely in bold.
  topicBlocks.push({ type: r.every((x) => x.bold) ? 'subheading' : 'paragraph', runs: r });
}

const out = {
  source: { url: SOURCE_URL, retrieved: new Date().toISOString().slice(0, 10), note: 'Verbatim rich text captured from the Notion syllabus. Wording changes need course-team approval; see README.' },
  introduction,
  goals: { heading: runs(flat[iGoals].properties.title), items: goalItems },
  topics: { heading: runs(flat[iTopics].properties.title), blocks: topicBlocks },
};
writeFileSync('content/offerings/winter-2027/course-copy.json', JSON.stringify(out, null, 2) + '\n');
console.log(`intro paragraphs: ${introduction.length}, goals: ${goalItems.length}, topic blocks: ${topicBlocks.length} (${topicBlocks.filter((b) => b.type === 'subheading').length} subheadings)`);
