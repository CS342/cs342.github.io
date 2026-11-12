# CS 342 / MED 253: Building for Digital Health — course website

The public website for the Stanford Biodesign Digital Health course **CS 342 / MED 253: Building for
Digital Health**. It replaces the Notion course site: it explains the course, supports enrolled
students (syllabus, sessions, materials), and routes student applicants and project sponsors to the
right application form.

The site is a static [Astro](https://astro.build) build deployed to GitHub Pages. There is no server,
database, account system or form backend: applications are Google Forms, and course systems (Canvas
and so on) are linked.

> **Status: in review.** `content/site.yaml` has `launchStatus: review`, which shows a banner on every
> page and asks search engines not to index the site. See [Before launch](#before-launch).

## Pages

| Page | Route |
| --- | --- |
| Home | `/` |
| Syllabus | `/syllabus/` |
| Sessions (list and calendar) | `/sessions/`, `/sessions/?view=calendar` |
| Session detail | `/sessions/week-1/` … `/sessions/week-10/` |
| Faculty & Team | `/faculty/` |
| Apply as a Student | `/apply/` |
| Propose a Project | `/sponsors/` |
| Academic Sponsors | `/sponsors/academic/` |
| Industry Sponsors | `/sponsors/industry/` |

## Run it locally

Requires Node.js 22.23 or newer.

```bash
npm install
```

```bash
npm run dev
```

The dev server prints its address (`http://localhost:4321/CS342/`).

```bash
npm test
```

`npm test` builds the site and runs the copy check. `npm run check:links` checks every internal link
and anchor and requests each external link once.

## Editing content

All content lives in `content/`. Layout lives in `src/`. To change a date, a person, a room, an
application status or a form link, edit one content file; every page that shows that fact updates.
Files are validated when the site builds, so a typo stops the build with a message that names the
file and the field instead of publishing a broken page.

| To change… | Edit |
| --- | --- |
| Quarter dates, meeting time, time zone, room, units, Canvas link, contacts | `content/offerings/winter-2027/offering.yaml` |
| A session's title, summary, agenda, speakers, materials, deliverables, status | `content/offerings/winter-2027/sessions.yaml` |
| Faculty and team (names, roles, titles, bios, photos, profile links) | `content/offerings/winter-2027/people.yaml` |
| Application status, form links, opening and closing dates | `content/offerings/winter-2027/applications.yaml` |
| Syllabus sections and policies | `content/offerings/winter-2027/syllabus.yaml` |
| "How the course works", student application page, sponsor pages | `content/offerings/winter-2027/pages.yaml` |
| Introduction, Goals of the Course, Topics Covered (preserved wording) | `content/offerings/winter-2027/course-copy.json` |
| Review banner, footer affiliations, address, earlier offerings | `content/site.yaml` |

Each file starts with a comment that explains its fields.

**Workflow:** edit → preview (`npm run dev`) → course-team review of anything substantive → merge to
`main`, which publishes automatically.

### Status markers

Most records carry a `status`:

- `confirmed` — approved for this offering (green marker).
- `draft` — proposed, or carried forward from 2025–26 and not yet approved (amber marker).
- `pending` — not yet known; the page says "to be announced" (hollow marker).

Sessions keep the date status (`dateStatus`) apart from the content status (`contentStatus`), and
both are separate from the time-based state (upcoming / in session / completed), which the site works
out from the clock.

### Applications

Each of the three routes (student, academic, industry) has its own record in `applications.yaml` with
a status, a form link, opening and closing times and a contact.

| Status | What visitors see |
| --- | --- |
| `not-announced` | "Details forthcoming"; no button |
| `opening-soon` | The opening date; no button |
| `open` | The deadline and a button to the form |
| `closed` | The closed message; no button |

Two safeguards are built in: a route marked `open` with no `formUrl` is shown as "details
forthcoming", and an open route switches to closed by itself once `closesAt` has passed. Use the
form's **published respondent link**, never the editing link or the response sheet.

### Dates and time-based states

Dates are stored once, as dates, in the course time zone (`America/Los_Angeles`). "Next session",
"In session now", "Completed" and the open/closed switch are re-evaluated in the visitor's browser on
every page load, so the site stays correct between deployments.

To see the site as it will look at another moment, add `?preview-date=` to any address:

```
/sessions/?preview-date=2027-02-03T16:00-08:00
```

A banner shows that a preview is active, and the date is carried along as you navigate.

### Preserved course copy

The course team requires three sections of the Notion syllabus to appear **verbatim** on Home: the
introduction beginning "As our world…", *Goals of the Course*, and *Topics Covered*. They are stored
in `course-copy.json` exactly as captured from Notion (text, emphasis, order) and rendered without
any typographic substitution. `npm run verify:copy` compares the built page with that file block by
block and fails on any difference; the deploy workflow runs it on every publish.

Do not edit `course-copy.json` to fix wording. Record the suggestion (see below), get course-team
approval, then change the file.

### Starting the next offering

Copy `content/offerings/winter-2027/` to a new folder (for example `winter-2028/`), update its files,
and set `currentOffering` in `content/site.yaml`. The previous year's content stays in the repository
under its own folder. Add the outgoing site to `archive` in `site.yaml` if it remains online.

## Deployment

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. In the repository's
**Settings → Pages**, set **Source** to **GitHub Actions** (once).

The workflow reads the site address from the Pages settings, so the same build serves
`https://stanfordbdhg.github.io/CS342/` today and a custom domain later. To move to
`cs342.stanford.edu`, add the custom domain in Settings → Pages once domain ownership and DNS are
confirmed; no code change is needed.

## Design

The visual system follows the Stanford Biodesign Digital Health keynote deck and is written up in
[`DESIGN.md`](DESIGN.md), in the format used by
[awesome-design-md](https://github.com/voltagent/awesome-design-md). Read it before adding a page or
component.

## Before launch

The structure and components are complete. The items below are content decisions that the
specification leaves with the course team; each is shown on the site as draft or "to be announced"
until it is settled.

| Decision | Where it goes |
| --- | --- |
| Classroom and map link | `offering.yaml` → `room` |
| Units, prerequisites, enrollment process, workload | `offering.yaml` → `units`; `syllabus.yaml`; `pages.yaml` → `apply` |
| **Grading model.** The Notion syllabus (10/10/30/20/30: attendance, participation, assignments, midterm, final) and the introductory lecture (10/15/30/45: attendance, participation, midterm, final) disagree. Neither is published; the syllabus says "to be announced". Approve one and add it. | `syllabus.yaml` → `assessment` |
| Attendance, AI and collaboration, training, IP, accessibility wording | `syllabus.yaml` |
| 2027 roster, titles, biographies, approved photos | `people.yaml`, `public/images/people/` |
| Session topics, guests, preparation, materials, deadlines | `sessions.yaml` |
| Student application: questions, eligibility, dates, form owner, published link | `applications.yaml` → `student`; `pages.yaml` → `apply` |
| Academic proposals: eligible institutions, dates, fee, terms, published link | `applications.yaml` → `academic`; `pages.yaml` → `academic` |
| Industry proposals: dates, sponsorship terms, agreement process, published link | `applications.yaml` → `industry`; `pages.yaml` → `industry` |
| Student and sponsor contact addresses (currently the 2025–26 contacts) | `offering.yaml` → `contacts` |
| Canvas link for Winter 2027 | `offering.yaml` → `canvasUrl` |
| Branding, institutional footer wording, domain | `site.yaml`; `public/images/` |
| Go live | `site.yaml` → `launchStatus: live` |

Deliberately **not** carried over from the 2025–26 pages: the $5,000 and $20,000 participation fees,
hosting-cost estimates, open/closed-source provisions, the 2025–26 room, Zoom link and Canvas course,
and the single legacy proposal form.

Before opening any application: publish the form, test a submission and its confirmation message with
test data, confirm who owns the responses, then set the route to `open`.

### Suggested copy changes (not applied)

The preserved sections are published exactly as written in Notion. These are suggestions for the
course team, recorded here rather than applied:

- *Goals of the Course*, third goal: "accelarate" → "accelerate"; the item has no closing period,
  unlike the other two.
- *Topics Covered*: "SpeziVibe, our new cross-platform built for AI-assisted development" appears to
  be missing a noun after "cross-platform" (framework? template?).
- *Topics Covered*: "Paths offer opportunity to integrate…" — "Paths" has no antecedent.
- *Topics Covered*: "MedPlum" is written "Medplum" by the project itself.
- *Topics Covered*: "This year marks a transformative shift: for the first time…" was written for
  2025–26.
- The heading *Goals of the Course* is bold in the source and *Topics Covered* is not; both are
  preserved as found.

### After launch (optional in the specification)

Calendar download (.ics), a syllabus PDF, a project showcase, prior-year archive pages, and search.

## Project layout

```
content/                 everything an editor changes
  site.yaml
  offerings/winter-2027/
src/
  lib/                   content loading and validation, dates, time-based states
  components/            bands, page header, tags, panels, session list and calendar
  layouts/Base.astro     page shell, metadata, header and footer
  pages/                 one file per route
  scripts/live.ts        re-evaluates time-based states in the browser
  styles/global.css      design tokens and components
scripts/                 copy check, link check, Notion snapshot
public/                  images, favicon
DESIGN.md                the design system
```

## Sources

- Specification: "CS 342 / MED 253: Building for Digital Health — Website content outline and
  implementation specification, Winter 2027".
- Course copy and legacy policies: the
  [2025–26 Notion syllabus](https://stanfordbdhg.notion.site/CS342-MED253-Building-for-Digital-Health-ea1a66dfc9b44c90b6908de0d083d4e1).
- Sponsor principles: the 2025–26 request for proposals and partner pages.
- Visual language: Stanford Biodesign Digital Health keynote deck, March 2025.
