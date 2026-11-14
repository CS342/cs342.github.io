// Re-evaluates time-based states in the browser on every page load, so pages built
// days or weeks ago still show the right "next class", session and application
// states. The build renders the same states as of build time as a fallback.
//
// Preview: add ?preview-date=2027-02-03T16:00-08:00 to any page to see the site as
// it will appear at that moment. A banner makes the preview obvious.

import { nextSessionIndex, offeringState, sessionState, sessionStateLabel } from '../lib/state';

interface ClockSession {
  slug: string;
  week: number;
  title: string;
  href: string;
  start: string;
  end: string;
  dateLabel: string;
  timeLabel: string;
}
interface Clock {
  timeZone: string;
  timeZoneLabel: string;
  quarterStart: string;
  quarterEnd: string;
  quarterStartLabel: string;
  term: string;
  sessions: ClockSession[];
}

const source = document.getElementById('course-clock');
if (source?.textContent) run(JSON.parse(source.textContent) as Clock);

function run(clock: Clock) {
  const param = new URLSearchParams(location.search).get('preview-date');
  const preview = param ? Date.parse(param) : NaN;
  const previewing = !Number.isNaN(preview);
  const now = previewing ? preview : Date.now();

  if (previewing) showPreviewBanner(clock, now);

  const sessions = clock.sessions.map((s) => ({ ...s, startMs: Date.parse(s.start), end: Date.parse(s.end) }));
  const nextIndex = nextSessionIndex(now, sessions);
  const next = nextIndex >= 0 ? sessions[nextIndex] : null;

  // Session rows, calendar cells and session pages.
  document.querySelectorAll<HTMLElement>('[data-session]').forEach((node) => {
    const s = sessions.find((x) => x.slug === node.dataset.session);
    if (!s) return;
    const state = sessionState(now, s.startMs, s.end);
    const isNext = next?.slug === s.slug;
    node.dataset.timeState = state;
    node.dataset.next = String(isNext);
    node.querySelectorAll<HTMLElement>('[data-state-label]').forEach((label) => {
      label.textContent = sessionStateLabel(state, isNext);
    });
  });

  // "Next session" cards.
  document.querySelectorAll<HTMLElement>('[data-next-session]').forEach((card) => {
    const active = card.querySelector<HTMLElement>('[data-next-active]');
    const done = card.querySelector<HTMLElement>('[data-next-done]');
    if (!active || !done) return;
    active.hidden = !next;
    done.hidden = !!next;
    card.dataset.offering = next ? 'active' : 'completed';
    if (!next) return;
    const live = now >= next.startMs;
    const set = (field: string, value: string) => {
      const el = active.querySelector<HTMLElement>(`[data-f="${field}"]`);
      if (el) el.textContent = value;
    };
    set('label', live ? 'In session now' : nextIndex === 0 ? 'First session' : 'Next session');
    set('week', `Week ${next.week}`);
    set('date', next.dateLabel);
    set('time', next.timeLabel);
    set('title', next.title);
    const link = active.querySelector<HTMLAnchorElement>('a[data-f="link"]');
    if (link) link.href = next.href;
  });

  // Offering state ("Begins …", "In progress", "Completed").
  const oState = offeringState(now, Date.parse(clock.quarterStart), Date.parse(clock.quarterEnd));
  document.querySelectorAll<HTMLElement>('[data-offering-state]').forEach((el) => {
    el.dataset.offeringState = oState;
    el.textContent =
      oState === 'before' ? `Begins ${clock.quarterStartLabel}` : oState === 'during' ? 'In progress' : 'Completed';
  });

  // Applications: an open route flips to closed once its deadline passes.
  document.querySelectorAll<HTMLElement>('[data-app-closes]').forEach((wrap) => {
    const closes = Date.parse(wrap.dataset.appCloses ?? '');
    if (Number.isNaN(closes)) return;
    const closed = now >= closes;
    wrap.querySelectorAll<HTMLElement>('[data-app-variant]').forEach((variant) => {
      variant.hidden = (variant.dataset.appVariant === 'closed') !== closed;
    });
    wrap.dataset.appState = closed ? 'closed' : 'open';
  });

  // Calendar: mark today.
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: clock.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  document.querySelector<HTMLElement>(`[data-day="${today}"]`)?.setAttribute('data-today', 'true');

  // Keep the preview date while navigating.
  if (previewing) {
    document.querySelectorAll<HTMLAnchorElement>('a[href]:not([data-keep])').forEach((a) => {
      const target = new URL(a.href, location.href);
      if (target.origin !== location.origin) return;
      target.searchParams.set('preview-date', param!);
      a.href = target.toString();
    });
  }
}

function showPreviewBanner(clock: Clock, now: number) {
  const banner = document.getElementById('preview-banner');
  if (!banner) return;
  const when = new Intl.DateTimeFormat('en-US', { timeZone: clock.timeZone, dateStyle: 'full', timeStyle: 'short' }).format(now);
  banner.textContent = `Previewing this site as of ${when} ${clock.timeZoneLabel}. `;
  const exit = document.createElement('a');
  const here = new URL(location.href);
  here.searchParams.delete('preview-date');
  exit.href = here.toString();
  exit.dataset.keep = 'true';
  exit.textContent = 'Exit preview';
  banner.append(exit);
  banner.hidden = false;
}
