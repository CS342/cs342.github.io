// Date and time helpers. Calendar dates are "YYYY-MM-DD" strings and clock times
// are "HH:MM" strings, always interpreted in the course time zone.

/** Convert a wall-clock date and time in `timeZone` to the matching instant. */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const offsetAt = (t: number) => {
    const p: Record<string, number> = {};
    for (const part of fmt.formatToParts(new Date(t))) if (part.type !== 'literal') p[part.type] = Number(part.value);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - t;
  };
  // Two passes settle the offset on either side of a daylight-saving change.
  const first = wall - offsetAt(wall);
  return new Date(wall - offsetAt(first));
}

/** The day after a calendar date, as "YYYY-MM-DD". */
export function nextDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

const asUtcNoon = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

type DateStyle = 'full' | 'long' | 'short' | 'monthDay' | 'monthYear';
const DATE_STYLES: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }, // Wednesday, January 6, 2027
  long: { month: 'long', day: 'numeric', year: 'numeric' }, // January 6, 2027
  short: { weekday: 'short', month: 'short', day: 'numeric' }, // Wed, Jan 6
  monthDay: { month: 'long', day: 'numeric' }, // January 6
  monthYear: { month: 'long', year: 'numeric' }, // January 2027
};

/** Format a calendar date without any time-zone shifting. */
export function formatDate(date: string, style: DateStyle = 'full'): string {
  return new Intl.DateTimeFormat('en-US', { ...DATE_STYLES[style], timeZone: 'UTC' }).format(asUtcNoon(date));
}

/** "15:30" -> "3:30 pm" */
export function formatTime(time: string): string {
  const [hh, mm] = time.split(':').map(Number);
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return `${h}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${hh < 12 ? 'am' : 'pm'}`;
}

/** "15:30", "18:20" -> "3:30–6:20 pm" */
export function formatTimeRange(start: string, end: string): string {
  const a = formatTime(start);
  const b = formatTime(end);
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a}–${b}`;
}

/** "2026-12-04T23:59" -> "Friday, December 4, 2026 at 11:59 pm Pacific" */
export function formatLocalDateTime(local: string, zoneLabel: string): string {
  const [date, time] = local.split('T');
  return `${formatDate(date, 'full')} at ${formatTime(time)} ${zoneLabel}`;
}

/** Month grids (Sunday-first weeks) covering every month from `from` to `to`. */
export function monthGrids(from: string, to: string): { year: number; month: number; label: string; weeks: (string | null)[][] }[] {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  const out = [];
  for (let y = fy, m = fm; y < ty || (y === ty && m <= tm); m === 12 ? (y++, (m = 1)) : m++) {
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    const cells: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= days; d++) cells.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    while (cells.length % 7) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    out.push({ year: y, month: m, label: formatDate(`${y}-${String(m).padStart(2, '0')}-01`, 'monthYear'), weeks });
  }
  return out;
}
