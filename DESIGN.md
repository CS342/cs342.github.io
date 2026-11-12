---
version: alpha
name: BDHG-CS342-ruled-sheet
description: "A white ruled sheet taken from the Stanford Biodesign Digital Health keynote deck: black grotesque type, hairline grids, and flat blocks of Biodesign green, sky blue, orange and navy. Pages are built like the deck's title slide — a narrow coloured bar, a large black title, a block of colour on the right — and every section is a ruled row with a rotated label in the left rail. Corners are square, there are no shadows, and colour is used as solid blocks or thin bars, never as tint or gradient."

colors:
  ink: "#000000"
  ink-2: "#333333"
  ink-3: "#636363"
  paper: "#ffffff"
  rule: "#b9b9b9"
  rule-soft: "#dcdcdc"
  green: "#06ac00"
  green-ink: "#057a00"
  sky: "#85d5e8"
  sky-tint: "#e9f7fb"
  orange: "#f54a1d"
  navy: "#00286f"
  amber: "#f89b0f"
  crimson: "#b10c36"

typography:
  display:
    fontFamily: Archivo
    fontSize: clamp(2.875rem, 7.4vw + 0.6rem, 6.75rem)
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.045em
  h1:
    fontFamily: Archivo
    fontSize: clamp(2.375rem, 4.6vw + 1rem, 4.5rem)
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: -0.035em
  h2:
    fontFamily: Archivo
    fontSize: clamp(1.75rem, 2.2vw + 1rem, 2.75rem)
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.025em
  title:
    fontFamily: Archivo
    fontSize: clamp(1.5rem, 1.2vw + 1.2rem, 2rem)
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.03em
  subtitle:
    fontFamily: Archivo
    fontSize: clamp(1.25rem, 0.9vw + 1.05rem, 1.625rem)
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -0.025em
  lead:
    fontFamily: Archivo
    fontSize: clamp(1.1875rem, 0.6vw + 1.05rem, 1.4375rem)
    fontWeight: 400
    lineHeight: 1.42
  h3:
    fontFamily: Archivo
    fontSize: 1.25rem
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.015em
  body:
    fontFamily: Archivo
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: Archivo
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.45
  small:
    fontFamily: Archivo
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: IBM Plex Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.08em
    textTransform: uppercase
  tag:
    fontFamily: IBM Plex Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.04em
    textTransform: uppercase

rounded:
  none: 0px
  full: 9999px

spacing:
  gutter: 8px / 20px / 40px
  rail: 56px
  side: clamp(272px, 27vw, 344px)
  pad-x: clamp(18px, 3.4vw, 52px)
  pad-y: clamp(36px, 5vw, 68px)
  frame-max: 1248px

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: 15px 21px
  button-primary-hover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink}"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: 1px solid {colors.rule}
    typography: "{typography.tag}"
  route-cell-hover:
    backgroundColor: route colour
    textColor: ink on green/orange, paper on navy
---

# CS 342 / MED 253 — Design System

This file follows the DESIGN.md format collected at
[voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md). Unlike the entries in
that collection it does not describe someone else's website: it records the visual language of the
Stanford Biodesign Digital Health keynote deck (March 2025) so the course site and the group's slides
read as one identity. Tokens live in `src/styles/global.css`.

## Overview

The deck is a Swiss grid in slide form. Its title slide is white, divided by hairlines into cells: a
sky-blue bar on the left edge, a heavy black title, a solid green block on the right carrying a
rosette of white line circles, and a patch of empty hairline squares in the corner. Body slides are
black type on white with a hairline and a small logo at the foot. Colour appears as flat blocks and
as the green / orange / navy rings of the Biodesign process diagram.

The site keeps that structure literally:

- **The page is a ruled sheet.** A centred frame with a hairline down each side; every section is a
  band separated by a full-width hairline. Nothing floats on a card.
- **Every page opens like the title slide.** Coloured bar, title, and a side cell that holds either
  the hairline squares or something useful (next session, application status).
- **Sections are rows.** A narrow left rail carries a rotated mono label, as the process slide labels
  its rows "PHASES" and "STAGES".
- **Colour means something.** Green is the course and the student route, navy is the academic route,
  orange is the industry route, sky marks "you are here" (next class, quarter boundaries).

## Colors

### Brand blocks

| Token | Value | Use |
| --- | --- | --- |
| `green` | `#06ac00` | Biodesign green. Hero block, next-session card, class days in the calendar, student route, rings. Text on it is always `ink`. |
| `sky` | `#85d5e8` | The title-slide bar. Page-header bar, next-class marker, completed-offering card. Text on it is `ink`. |
| `navy` | `#00286f` | "Implement" navy. Academic route. Text on it is `paper`. |
| `orange` | `#f54a1d` | "Invent" orange. Industry route. Text on it is `ink` (white fails contrast). |

### Surface and line

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#ffffff` | The only page background. |
| `rule` | `#b9b9b9` | Hairlines: frame, band dividers, cell borders, grid squares. Always 1px. |
| `rule-soft` | `#dcdcdc` | Dividers inside a cell (fact rows, list rows). |
| `sky-tint` | `#e9f7fb` | Row hover and quarter-boundary days. The only tint in the system. |

### Text

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#000000` | Headings and body. The deck uses pure black; so does the site. |
| `ink-2` | `#333333` | Secondary text, labels. |
| `ink-3` | `#636363` | Muted notes (6.0:1 on white). |
| `green-ink` | `#057a00` | Green where it must work as small text or a list marker (5.5:1). |

### Status

| Token | Value | Use |
| --- | --- | --- |
| `green` | `#06ac00` | Confirmed / open (square marker in a tag). |
| `amber` | `#f89b0f` | Draft, carried forward, pending-notice marker, preview banner. |
| `crimson` | `#b10c36` | Closed. |
| hollow square | — | To be announced. |

Status is never carried by colour alone: every tag has a text label.

## Typography

### Font family

- **Archivo** (variable, 100–900) for everything set in sentences. The deck is set in a bold
  Helvetica-style grotesque; Archivo gives the same heavy, tight headline on every platform and is
  self-hosted from `@fontsource-variable/archivo`. Fallback: `Helvetica Neue, Helvetica, Arial`.
- **IBM Plex Mono** (400/500/600) for labels, tags, week numbers' captions and calendar digits — the
  deck sets framework names (`SpeziBluetooth`, `SpeziFHIR`) in a bold typewriter face.

### Hierarchy

Twelve steps, defined once as `--fs-*` custom properties in `src/styles/global.css`. No other font
size is used anywhere; a new size means a new step here first.

| Step | Token | Size | Weight | Used for |
| --- | --- | --- | --- | --- |
| Display | `--fs-display` | 46–108px | 800 | Home title. Line-height 0.92, tracking −0.045em |
| H1 | `--fs-h1` | 38–72px | 800 | Page titles. Line-height 0.98 |
| H2 | `--fs-h2` | 28–44px | 800 | Band headings |
| Title | `--fs-title` | 24–32px | 800 | Section headings inside a page, route and card titles, ring and week numerals |
| Subtitle | `--fs-subtitle` | 20–26px | 800 / 400 | Topic headings, status headlines, the opening paragraph of the introduction |
| Lead | `--fs-lead` | 19–23px | 400 | Lead paragraphs, hero facts, goals |
| H3 | `--fs-h3` | 20px | 800 | Sub-headings, names, session titles |
| Body | `--fs-body` | 17px | 400 | Running text. Line-height 1.55, 43rem measure |
| Body small | `--fs-body-sm` | 15px | 400 / 600 | Supporting text, navigation, notices |
| Small | `--fs-small` | 14px | 400 | Notes, captions, fine print |
| Label | `--fs-label` | 12px mono | 500 | Uppercase labels, tracking 0.08em |
| Tag | `--fs-tag` | 11px mono | 500 | Uppercase tags and calendar captions, tracking 0.04em |

Fluid steps scale with the viewport between the two sizes shown. Print reuses the ramp one or two
steps down (page title at H2, section headings at H3, body at Small).

### Principles

- Headings are heavy and tight; body is regular. There is no medium-weight heading.
- Sentence case everywhere. Uppercase is reserved for mono labels.
- No typographic substitution is applied to content: the preserved course copy must reach the page
  with its original punctuation.

## Layout

### The frame

`--frame: min(78rem, 100% − 2 × gutter)`, centred, with a 1px `rule` on both sides. Bands stack with
no gap, so the two vertical lines run the full height of the page.

### Band grid

| Column | Width | Holds |
| --- | --- | --- |
| Rail | 56px | Rotated mono label (sticky). Filled with colour in page headers. |
| Main | 1fr | Content. Text blocks keep a 43rem measure. |
| Side (optional) | 272–344px | Next-session card, application panel, contents menu, hairline squares. |

Below 960px the rail disappears (page headers keep a 10px colour strip), and the side cell stacks.

### Spacing

Band padding is `pad-y` × `pad-x`. Inside a band, related items sit 12–20px apart and groups are
separated by a hairline rather than by extra space.

### Whitespace

Text does not stretch to fill a wide band; the unused right-hand part of the row stays empty. The
asymmetry is deliberate and matches the deck.

## Elevation & Depth

None. No shadows, no blur, no gradients, no overlapping cards. Depth comes from hairlines and from
solid colour. The sticky header is separated from the page by a hairline only.

## Shapes

- Corners are square (`0`) on every box, button, tag and image crop.
- The only curves are circles: the rosette, the rings of the process diagram, goal markers, monogram
  rings on the team page, and the ring in the header (the green "O" of the Biodesign wordmark).
- Rings are drawn as thick strokes (7–9px) with nothing inside but a number or initials.

### Motifs

- **Hairline squares** (`.gridmotif`): a field of empty cells, used in page headers and at the foot of
  every page, and made literal in the calendar view.
- **Rosette**: eight circles of radius 55 whose centres sit 62 from the origin, white 1px line on
  green. Decorative; hidden from assistive technology.
- **Astronaut**: the deck's illustration, used once on Home and once on the 404 page, always on white.

## Components

### Buttons

- **Primary**: black fill, white text, square, 15×21px padding, weight 700. Hover: green fill, black
  text. Used only for a live application form.
- **Ghost**: 1px black border, transparent fill.
- **Text link with arrow** (`.more`): bold, 2px black underline that thickens into a green bar on
  hover; the arrow moves 4px.
- Inline links in prose: black text, 2px green underline; hover fills the word green.

### Route cells

The three application pathways. A cell has an 8px colour bar on top, a mono kicker, a large title, the
route's own status tag, and an arrow. On hover or focus the whole cell fills with the route colour.
Cells sit side by side, separated by hairlines, never as separate cards.

### Tags

Mono, uppercase, 1px `rule` border, white fill, with a 9px square marker: green (confirmed/open),
amber (draft), sky (opening soon), crimson (closed), hollow (to be announced).

### Notices

A hairline box whose mono label is led by the same 9px square marker the tags use (amber for "not
yet published", crimson for closed). Used wherever content is pending, so that a missing detail reads
as deliberate. Notices have no coloured edge: bars are reserved for the page-header bar, the route
key and the next-class marker.

### Session row

Week number (mono caption + 28px numeral) · date and time · title and summary · state and status tag ·
arrow. The next class has a sky bar on its left edge; a class in session has a green one.

### Calendar

One table per month, Sunday-first, hairline cells. Class days are solid green links showing the day
and week number; completed classes become a green outline; the quarter's first and last days are
sky-tinted.

### Application panel

A colour head (route colour) with the status as a headline, then facts, the form button when — and
only when — the route is open with a published link, and a contact line.

### Navigation

Sticky header: ring mark in the rail, course lockup, text links with a green bar under the current
page, "Apply" as a solid black cell and "Propose a Project" as an outlined cell. Below 1056px the
links collapse into a "Menu" button that expands a ruled list.

### Footer

A ruled row of four cells (affiliation with the Biodesign wordmark, course links, contact, earlier
offerings), a fine-print line, and a strip of hairline squares — the deck's closing slide.

## Do's and Don'ts

### Do

- Keep every surface white and let hairlines do the dividing.
- Use colour as a solid block or a thin bar, with black text on green, sky and orange and white text
  on navy.
- Put a status tag or a notice wherever something is unconfirmed.
- Keep headings heavy, tight and in sentence case.
- Let rows be asymmetric; leave the right-hand side empty rather than stretching text.

### Don't

- Don't round corners, add shadows, or use gradients or tinted panels.
- Don't set white text on green or orange, or green text smaller than 24px (use `green-ink`).
- Don't introduce a new accent colour; pick from the four blocks.
- Don't float content in cards with gaps between them — cells share borders.
- Don't add a coloured edge to a box to make it a callout; use a square marker and a label.
- Don't write a literal font size; use a step from the ramp.
- Don't use the astronaut or rosette on a coloured or busy background.

## Responsive Behavior

### Breakpoints

| Width | Change |
| --- | --- |
| < 640px | 8px gutter; single column; routes, goals, process and footer stack. |
| ≥ 832px | Three route cells / three goals / topic sub-heading beside its text. |
| ≥ 960px | Rail and side column appear; session rows become a five-column grid; three calendar months. |
| ≥ 1024px | Process becomes five columns of rings on one line. |
| ≥ 1056px | Full navigation replaces the Menu button. |

### Touch targets

Navigation rows, buttons and calendar days are at least 44px in one dimension; whole route cells and
session rows are clickable.

### Motion

Hover transitions are 150–200ms. The rosette turns once every two minutes and the astronaut drifts;
both stop under `prefers-reduced-motion`.

### Print

The syllabus and schedule print as plain black-on-white text: navigation, rails, colour blocks and the
footer links are removed, and external URLs are printed after their links.

## Iteration Guide

1. Start a new page with `PageHeader` and a sequence of `Band`s; do not build custom wrappers.
2. Choose the page tone from the four blocks and use it for the header bar and any panel head.
3. Reach for an existing pattern (facts list, ruled list, tag, notice) before inventing one.
4. Check contrast whenever text lands on colour: black on green/sky/orange, white on navy.
5. Check 375px and 1280px, keyboard focus, and print for the syllabus and schedule.

## Known Gaps

- Light theme only; the deck has no dark variant.
- The Biodesign wordmark and astronaut are raster crops from the deck. Replace them with approved
  vector artwork once branding is signed off.
- No photography is used: the deck's class photos show identifiable students and are not approved for
  the public site.
- No link-preview (Open Graph) image yet.
