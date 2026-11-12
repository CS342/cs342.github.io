// Minimal inline formatting for content files: **bold**, [label](url) and
// {placeholders}. Nothing else is interpreted, and no typographic substitution is
// applied, so wording and punctuation reach the page exactly as written.

import { url, isExternal } from './paths';

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export type Tokens = Record<string, string>;

/** Replace {name} placeholders. Unknown placeholders fail the build rather than leak onto a page. */
export function fillTokens(text: string, tokens: Tokens): string {
  return text.replace(/\{([a-zA-Z]+(?::[a-z0-9-]+)?)\}/g, (_, key: string) => {
    if (!(key in tokens)) throw new Error(`Unknown placeholder {${key}} in content. Known: ${Object.keys(tokens).join(', ')}`);
    return tokens[key];
  });
}

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function linkHtml(label: string, href: string): string {
  const target = href.startsWith('/') ? url(href) : href;
  const rel = isExternal(target) ? ' rel="noopener"' : '';
  return `<a href="${escapeHtml(target)}"${rel}>${inline(label)}</a>`;
}

function inline(text: string): string {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    out += escapeHtml(text.slice(last, m.index));
    out += m[1] !== undefined ? `<strong>${inline(m[1])}</strong>` : linkHtml(m[2], m[3]);
    last = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(last));
}

/** Render one line of content-file text to safe inline HTML. */
export function renderInline(text: string, tokens: Tokens = {}): string {
  return inline(fillTokens(text, tokens));
}

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

/** Render verbatim rich-text runs (preserved course copy) to inline HTML. */
export function renderRuns(runs: Run[], options: { plainBold?: boolean } = {}): string {
  return runs
    .map((run) => {
      let html = escapeHtml(run.text);
      if (run.italic) html = `<em>${html}</em>`;
      if (run.bold && !options.plainBold) html = `<strong>${html}</strong>`;
      if (run.href) html = `<a href="${escapeHtml(run.href)}" rel="noopener">${html}</a>`;
      return html;
    })
    .join('')
    .trim();
}
