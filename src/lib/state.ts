// Time-based states. Pure functions shared by the build (initial HTML) and the
// browser (re-evaluated on every page load, so a page never shows a stale state).
// All arguments are instants in milliseconds since the epoch.

export type TimeState = 'upcoming' | 'live' | 'done';

export function sessionState(now: number, start: number, end: number): TimeState {
  return now < start ? 'upcoming' : now < end ? 'live' : 'done';
}

/** Index of the next class: the first session that has not ended. -1 after the last class. */
export function nextSessionIndex(now: number, sessions: { end: number }[]): number {
  return sessions.findIndex((s) => now < s.end);
}

export function sessionStateLabel(state: TimeState, isNext: boolean): string {
  if (state === 'live') return 'In session now';
  if (state === 'done') return 'Completed';
  return isNext ? 'Next class' : 'Upcoming';
}

export type OfferingState = 'before' | 'during' | 'after';

export function offeringState(now: number, quarterStart: number, quarterEnd: number): OfferingState {
  return now < quarterStart ? 'before' : now < quarterEnd ? 'during' : 'after';
}

export type ApplicationStatus = 'not-announced' | 'opening-soon' | 'open' | 'closed';

/**
 * The status a visitor should see. An "open" route never appears open without a
 * working form link or submission address, and never after its deadline has passed.
 */
export function effectiveApplicationStatus(
  app: { status: ApplicationStatus; submitHref?: string | null; closes?: number | null },
  now: number,
): ApplicationStatus {
  if (app.status !== 'open') return app.status;
  if (!app.submitHref) return 'not-announced';
  if (app.closes != null && now >= app.closes) return 'closed';
  return 'open';
}
