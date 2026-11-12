// Loads and validates the files in /content. Pages import from here and never read
// content files directly, so a typo in a content file fails the build with a clear
// message instead of producing a broken page.

import { parse as parseYaml } from 'yaml';
import { z } from 'astro/zod';
import siteRaw from '../../content/site.yaml?raw';
import { formatDate, formatLocalDateTime, formatTimeRange, nextDay, zonedTimeToUtc } from './time';
import type { Tokens } from './richtext';
import { url } from './paths';

const offeringFiles = import.meta.glob('../../content/offerings/*/*.{yaml,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/* ---------- schemas ---------- */

const text = z.string().min(1);
const optional = z.string().min(1).nullish();
const Status = z.enum(['confirmed', 'draft', 'pending']);
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const TimeString = z.string().regex(/^\d{2}:\d{2}$/, 'Use 24-hour HH:MM');
const LocalDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Use YYYY-MM-DDTHH:MM');
const Link = z.object({ label: text, url: text });

const SiteSchema = z.object({
  currentOffering: text,
  launchStatus: z.enum(['review', 'live']),
  reviewNotice: text,
  affiliation: z.object({ statement: text, links: z.array(Link) }),
  address: z.array(text),
  copyright: text,
  archive: z.array(Link),
});

const ContactSchema = z.object({ name: text, role: optional, email: z.email(), status: Status });

const OfferingSchema = z.object({
  id: text,
  title: text,
  numbers: z.array(text).min(1),
  term: text,
  academicYear: text,
  previousYear: text,
  description: text,
  timeZone: text,
  timeZoneLabel: text,
  quarter: z.object({ instructionBegins: DateString, classesEnd: DateString }),
  meeting: z.object({ day: text, start: TimeString, end: TimeString }),
  room: z.object({ name: optional, mapUrl: optional, status: Status }),
  units: z.object({ value: optional, status: Status, note: optional }),
  canvasUrl: optional,
  contacts: z.object({ students: ContactSchema, sponsors: ContactSchema }),
});

const ResourceSchema = z.object({
  label: text,
  url: optional,
  type: z.enum(['slides', 'recording', 'code', 'reading', 'workshop', 'link']).default('link'),
  access: z.enum(['public', 'stanford', 'course']).default('public'),
  description: optional,
});

const SessionSchema = z.object({
  week: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lower-case letters, numbers and hyphens only'),
  date: DateString,
  start: TimeString.nullish(),
  end: TimeString.nullish(),
  room: optional,
  title: text,
  summary: text,
  dateStatus: Status,
  contentStatus: Status,
  statusLabel: text,
  description: optional,
  objectives: z.array(text).nullish(),
  agenda: z.array(z.object({ time: optional, item: text })).nullish(),
  guest: z.enum(['none', 'tba']).default('none'),
  speakers: z.array(z.object({ name: text, affiliation: optional, url: optional })).nullish(),
  preparation: z.array(text).nullish(),
  resources: z.array(ResourceSchema).nullish(),
  deliverables: z
    .array(z.object({ title: text, due: LocalDateTime.nullish(), submit: optional, access: optional, note: optional }))
    .nullish(),
});

const PersonSchema = z.object({
  name: text,
  credentials: optional,
  group: z.enum(['instructors', 'operations', 'coaches']),
  role: text,
  title: optional,
  profileUrl: optional,
  profileLabel: optional,
  bio: optional,
  headshot: optional,
  headshotAlt: optional,
  status: z.enum(['confirmed', 'draft']),
});

const ApplicationSchema = z.object({
  name: text,
  action: text,
  status: z.enum(['not-announced', 'opening-soon', 'open', 'closed']),
  formUrl: z.url().nullish(),
  opensAt: LocalDateTime.nullish(),
  closesAt: LocalDateTime.nullish(),
  signInNote: optional,
  contact: z.enum(['students', 'sponsors']),
  process: text,
  closedMessage: text,
});

const BlockSchema = z.union([
  z.strictObject({ p: text }),
  z.strictObject({ sub: text }),
  z.strictObject({ list: z.array(text) }),
  z.strictObject({ olist: z.array(text) }),
  z.strictObject({ pending: text }),
  z.strictObject({ note: text }),
  z.strictObject({ copy: z.enum(['introduction', 'goals']) }),
  z.strictObject({ contact: z.enum(['students', 'sponsors']) }),
]);

const SectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: optional,
  title: text,
  status: Status,
  statusNote: text,
  body: z.array(BlockSchema),
});

const SyllabusSchema = z.object({ lastReviewed: DateString, sections: z.array(SectionSchema) });

const InfoPageSchema = z.object({ lead: text, sections: z.array(SectionSchema) });

const PagesSchema = z.object({
  home: z.object({
    process: z.object({
      title: text,
      steps: z.array(z.object({ title: text, text })).min(2),
      after: text,
      prototype: z.object({ title: text, text }),
      product: z.object({ title: text, text }),
    }),
    projects: z.object({ status: Status, text }),
  }),
  apply: InfoPageSchema,
  proposal: z.object({ section: SectionSchema, submitNote: text }),
  sponsors: InfoPageSchema,
  academic: InfoPageSchema,
  industry: InfoPageSchema,
});

const RunSchema = z.object({ text: z.string(), bold: z.boolean().optional(), italic: z.boolean().optional(), href: z.string().optional() });
const CourseCopySchema = z.object({
  source: z.object({ url: text, retrieved: DateString, note: optional }),
  introduction: z.array(z.array(RunSchema)).min(1),
  goals: z.object({ heading: z.array(RunSchema), items: z.array(z.array(RunSchema)).min(1) }),
  topics: z.object({
    heading: z.array(RunSchema),
    blocks: z.array(z.object({ type: z.enum(['subheading', 'paragraph']), runs: z.array(RunSchema) })).min(1),
  }),
});

/* ---------- loading ---------- */

function validate<S extends z.ZodType>(schema: S, data: unknown, file: string): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`Invalid content in content/${file}:\n${z.prettifyError(result.error)}`);
  return result.data;
}

export const site = validate(SiteSchema, parseYaml(siteRaw), 'site.yaml');

function load<S extends z.ZodType>(schema: S, name: string): z.infer<S> {
  const file = `offerings/${site.currentOffering}/${name}`;
  const key = Object.keys(offeringFiles).find((k) => k.endsWith(`/content/${file}`));
  if (!key) throw new Error(`Missing content file: content/${file}`);
  const raw = offeringFiles[key];
  return validate(schema, name.endsWith('.json') ? JSON.parse(raw) : parseYaml(raw), file);
}

export const offering = load(OfferingSchema, 'offering.yaml');
export const people = load(z.array(PersonSchema), 'people.yaml');
export const syllabus = load(SyllabusSchema, 'syllabus.yaml');
export const pages = load(PagesSchema, 'pages.yaml');
export const courseCopy = load(CourseCopySchema, 'course-copy.json');
const rawSessions = load(z.array(SessionSchema).min(1), 'sessions.yaml');
const rawApplications = load(
  z.object({ student: ApplicationSchema, academic: ApplicationSchema, industry: ApplicationSchema }),
  'applications.yaml',
);

/* ---------- derived views ---------- */

const tz = offering.timeZone;
const zone = offering.timeZoneLabel;

export const courseCode = offering.numbers.join(' / ');
export const courseName = `${courseCode}: ${offering.title}`;

export const sessions = rawSessions
  .map((s) => {
    const start = s.start ?? offering.meeting.start;
    const end = s.end ?? offering.meeting.end;
    return {
      ...s,
      start,
      end,
      startUtc: zonedTimeToUtc(s.date, start, tz),
      endUtc: zonedTimeToUtc(s.date, end, tz),
      room: s.room ?? offering.room.name ?? null,
      timeLabel: `${formatTimeRange(start, end)} ${zone}`,
      weekLabel: String(s.week).padStart(2, '0'),
      href: url(`/sessions/${s.slug}/`),
      objectives: s.objectives ?? [],
      agenda: s.agenda ?? [],
      speakers: s.speakers ?? [],
      preparation: s.preparation ?? [],
      resources: s.resources ?? [],
      deliverables: s.deliverables ?? [],
    };
  })
  .sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime());

export type Session = (typeof sessions)[number];

{
  const slugs = new Set(sessions.map((s) => s.slug));
  if (slugs.size !== sessions.length) throw new Error('content: session slugs must be unique.');
}

export const firstSession = sessions[0];
export const lastSession = sessions[sessions.length - 1];

export const quarter = {
  startUtc: zonedTimeToUtc(offering.quarter.instructionBegins, '00:00', tz),
  endUtc: zonedTimeToUtc(nextDay(offering.quarter.classesEnd), '00:00', tz),
};

export const meetingPattern = `${offering.meeting.day}s, ${formatTimeRange(offering.meeting.start, offering.meeting.end)} ${zone}`;
export const roomLabel = offering.room.name ?? 'Room to be announced';

export type RouteKey = 'student' | 'academic' | 'industry';

export const routes: Record<RouteKey, { href: string; kicker: string; title: string; tone: string }> = {
  student: { href: url('/apply/'), kicker: 'Students', title: 'Apply as a Student', tone: 'green' },
  academic: { href: url('/sponsors/academic/'), kicker: 'Academic sponsors', title: 'Propose an Academic Project', tone: 'navy' },
  industry: { href: url('/sponsors/industry/'), kicker: 'Industry sponsors', title: 'Propose an Industry Project', tone: 'orange' },
};

function deriveApplication(key: RouteKey) {
  const app = rawApplications[key];
  if (app.status === 'open' && !app.formUrl)
    console.warn(`[content] applications.yaml: "${key}" is open but has no formUrl — showing "details forthcoming".`);
  if (app.status === 'opening-soon' && !app.opensAt)
    console.warn(`[content] applications.yaml: "${key}" is opening-soon but has no opensAt date.`);
  const toUtc = (local?: string | null) => (local ? zonedTimeToUtc(local.slice(0, 10), local.slice(11), tz) : null);
  return {
    ...app,
    key,
    opensUtc: toUtc(app.opensAt),
    closesUtc: toUtc(app.closesAt),
    opensLabel: app.opensAt ? formatLocalDateTime(app.opensAt, zone) : null,
    closesLabel: app.closesAt ? formatLocalDateTime(app.closesAt, zone) : null,
    contact: offering.contacts[app.contact],
  };
}

export const applications = {
  student: deriveApplication('student'),
  academic: deriveApplication('academic'),
  industry: deriveApplication('industry'),
};

export type Application = ReturnType<typeof deriveApplication>;

/** Placeholders available in content text, e.g. {term} or {sessionDate:week-5}. */
export const tokens: Tokens = {
  course: courseName,
  term: offering.term,
  academicYear: offering.academicYear,
  previousYear: offering.previousYear,
  meetingPattern,
  meetingCount: String(sessions.length),
  firstClass: formatDate(firstSession.date, 'long'),
  lastClass: formatDate(lastSession.date, 'long'),
  quarterStart: formatDate(offering.quarter.instructionBegins, 'long'),
  quarterEnd: formatDate(offering.quarter.classesEnd, 'long'),
  // "January 4–March 12, 2027"; the year is repeated only when the quarter spans two.
  quarterRange: `${formatDate(
    offering.quarter.instructionBegins,
    offering.quarter.instructionBegins.slice(0, 4) === offering.quarter.classesEnd.slice(0, 4) ? 'monthDay' : 'long',
  )}–${formatDate(offering.quarter.classesEnd, 'long')}`,
  ...Object.fromEntries(sessions.map((s) => [`sessionDate:${s.slug}`, formatDate(s.date, 'full')])),
};

/** Data the browser needs to re-evaluate time-based states on page load. */
export const clock = {
  timeZone: tz,
  timeZoneLabel: zone,
  quarterStart: quarter.startUtc.toISOString(),
  quarterEnd: quarter.endUtc.toISOString(),
  quarterStartLabel: formatDate(offering.quarter.instructionBegins, 'long'),
  term: offering.term,
  sessions: sessions.map((s) => ({
    slug: s.slug,
    week: s.week,
    title: s.title,
    href: s.href,
    start: s.startUtc.toISOString(),
    end: s.endUtc.toISOString(),
    dateLabel: formatDate(s.date, 'full'),
    timeLabel: s.timeLabel,
  })),
};

export type Section = z.infer<typeof SectionSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type Person = z.infer<typeof PersonSchema>;
