---
name: Nguyen Le Phong
description: A CV and engineering practice drawn the way its owner would draw a system he runs.
colors:
  ground: "oklch(98% 0.003 250)"
  surface: "oklch(100% 0 0)"
  surface-muted: "oklch(95% 0.005 250)"
  ink: "oklch(20% 0.02 260)"
  ink-muted: "oklch(45% 0.015 260)"
  ink-subtle: "oklch(52% 0.012 260)"
  signal-blue: "oklch(58% 0.18 252)"
  signal-blue-strong: "oklch(48% 0.20 252)"
  signal-blue-soft: "oklch(94% 0.04 252)"
  on-accent: "oklch(99% 0 0)"
  hairline: "oklch(92% 0.006 260)"
  border: "oklch(90% 0.008 260)"
  border-strong: "oklch(82% 0.01 260)"
  status-online: "oklch(70% 0.18 145)"
  status-offline: "oklch(66% 0.18 24)"
  ground-dark: "oklch(14% 0.012 260)"
  surface-dark: "oklch(18% 0.015 260)"
  ink-dark: "oklch(95% 0.005 250)"
  ink-muted-dark: "oklch(72% 0.015 260)"
  signal-blue-dark: "oklch(68% 0.18 252)"
  signal-blue-strong-dark: "oklch(78% 0.18 252)"
  hairline-dark: "oklch(24% 0.01 260)"
typography:
  hero:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "5.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.6rem + 4.4vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2vw, 2.75rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.3rem + 1.2vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, Inter Fallback, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 550
    lineHeight: 1.35
  meta-mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  node: "10px"
  pill: "999px"
spacing:
  gutter: "2rem"
  gutter-phone: "1.25rem"
  container: "1120px"
  section: "clamp(4rem, 3rem + 4vw, 8rem)"
  measure: "64ch"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-strong}"
    textColor: "{colors.on-accent}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  button-secondary-hover:
    backgroundColor: "{colors.surface-muted}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.875rem"
    height: "40px"
  figure-node:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.node}"
    padding: "12px 14px"
  line-node:
    backgroundColor: "{colors.ground}"
    size: "14px"
    rounded: "50%"
  line-node-active:
    backgroundColor: "{colors.signal-blue}"
---

# Design System: Nguyen Le Phong

## Overview

**Creative North Star: "The System Spec"**

Every page is drawn the way its owner would present a system he runs. A section is a figure of that system with an annotation layer on top: nodes, dashed edges between them, hairline rules between rows of text, and numbers attached to the thing they measure. The ground is a cool, near-white grey (deep blue-black in dark mode); Inter at heavy display weights carries the claims, and JetBrains Mono appears only where a technical drawing would put small print: dates, durations, stage labels, counts, code.

Density follows the work. The hero and lists are dense; figures (the capability map, the career route, the Studio lifecycle line, the system map) get the most air and are the visual peaks. One blue does all the signalling: the active node, the live edge, a hovered link. Everything else is ink at three strengths. Depth is almost absent; structure comes from rules, alignment and the line that threads the parts in order.

Motion is authored once per section and always additive: the default state is the final state, so a reader with reduced motion or no JavaScript sees the complete page. The homepage carries one ambient layer (a WebGL particle field behind the hero and map); no other surface has a backdrop.

**Key Characteristics:**
- Nodes and dashed edges in place of cards; a boxed container exists only as a node inside a figure.
- One accent hue (blue, hue 252) for state and direction, never for decoration.
- Heavy Inter headings with tight negative tracking; mono reserved for apparatus.
- Hairline dividers (1px) between rows and parts; no borders or backgrounds on lists of text.
- Light and dark are both first-class, toggled by `data-theme`, with a system option.

## Colors

A cool grey-blue neutral ramp (hue 250 to 260, chroma under 0.02) with a single saturated blue for signal and a small set of status hues. All tokens are OKLCH in `src/app/document.css`; the frontmatter mirrors them.

### Primary
- **Signal Blue** (`signal-blue`): the active node fill, every dashed edge, node and stop outlines, focus rings (2px outline, 2 to 4px offset). In dark mode it lifts to `signal-blue-dark`.
- **Deep Signal Blue** (`signal-blue-strong`): hover text on links and stop titles, the primary button's hover fill, the "last read" flag, copied-state text. Lifts to `signal-blue-strong-dark` in dark mode.
- **Blue Wash** (`signal-blue-soft`): the faint fill of system-map zones (mixed at 55%) and the hero news link hover. Never a panel background.

### Neutral
- **Cool Paper** (`ground`): the page ground and the hollow fill inside an unvisited node.
- **White Sheet** (`surface`): figure frames, figure nodes, quiet buttons.
- **Grey Wash** (`surface-muted`): code blocks, inline notices, button hover fills.
- **Ink** (`ink`): headings, body emphasis, the primary button fill, a checked tick.
- **Muted Ink** (`ink-muted`): leads, descriptions, mono meta, inactive links.
- **Subtle Ink** (`ink-subtle`): separators in crumbs, footer links, disabled controls (5.2:1 on ground, still legible).
- **Hairline** (`hairline`): the 1px rule between parts, steps and rows.
- **Border / Strong Border** (`border`, `border-strong`): figure frames, button outlines, link underlines at rest.

### Status
- **Online Green / Offline Red** (`status-online`, `status-offline`): the live status dot, the offline banner, a failed copy. Syncing and partial ambers exist in `document.css` for the offline banner only.

### Named Rules
**The One Signal Rule.** Blue marks state or direction (active, live, hovered, next). If removing the blue would lose no information, it should not be blue.

**The Three Inks Rule.** Text hierarchy comes from `ink`, `ink-muted` and `ink-subtle`, not from new greys or opacity on text.

## Typography

**Display and Body Font:** Inter variable, self-hosted Latin plus Vietnamese subset (with a metric-matched Arial fallback, so the swap does not shift layout)
**Mono Font:** JetBrains Mono variable, weights 400 to 700, same subset

**Character:** One sans family carries everything a reader reads; its heavy cuts (650 to 800) with tight tracking give the claims weight without a second display face. Mono is the drawing's small print.

### Hierarchy
- **Hero** (700, `--text-hero` 5.25rem, stepping to 4rem at 840px and 2.85rem at 560px, line-height 1, -0.035em): the owner's name on the homepage only.
- **Display** (700 to 800, about 4.5 to 5.25rem at the top of a clamp, line-height 1.02, -0.03 to -0.04em): page titles on About and Studio openers. Max about 16ch.
- **Headline** (650, `clamp(2rem, 1.4rem + 2vw, 2.75rem)`, 1.1, -0.02em): homepage section titles, written as claims. Studio index chapters run larger (800, up to 3.25rem).
- **Title** (700, up to 2rem, 1.15, -0.02em): a part or block heading inside a page.
- **Lede** (500, 1.125 to 1.375rem, 1.4): the reader's question beside a Studio title, the hero claim; ink, not muted.
- **Body** (400, 1rem, 1.6; leads at 1.0625rem with 1.6 to 1.65): prose capped at 62 to 64ch.
- **Label** (550 to 650, 0.875rem): node titles, crumbs, small headings inside figures.
- **Meta Mono** (400, 0.8125rem, tabular numerals; 0.75rem for stage labels): dates, counts, stage names, version tags.

### Named Rules
**The Apparatus Rule.** Mono is for dates, measurements, stage labels and code. Never for section labels, prose, buttons or pills, and never uppercase-tracked.

**The Diacritic Rule.** Vietnamese headings open up to line-height 1.12 (`:lang(vi)`); stacked diacritics must never touch the line above.

**Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`.**

## Layout

A single centred container (`min(1120px, 100% - 2rem)`, gutter dropping to 1.25rem under 560px) under a fixed 72px translucent header; `main` starts 80px down. Sections are separated by `--space-section` (4 to 8rem), and the space above a section title is always larger than the gap below it.

Inside a page the recurring grid is a reading column plus a narrow right column: Studio opener `1fr / 26rem` aligned to the title's baseline, Studio parts `1fr / 15rem` with a sticky aside at 96px, index chapters `1fr / 30rem`, the hero `1.15fr / 1fr`. All collapse to one column at 860 to 880px. Horizontal lines of nodes (Studio lifecycle line, About career arc) turn vertical under 720px, with the dot on the left and stage and title beside it.

Targets are at least 44px tall for primary controls (36px for in-figure tools). Anchored parts use `scroll-margin-top: 96px` to clear the header.

## Elevation & Depth

Flat by default. Structure comes from 1px hairlines, alignment and the threading line, not from shadows. Three shadow tokens exist (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, cool slate rgba in light, black in dark) and appear only on things that float above the page: menus, the search dialog, the offline banner. The fixed header uses a 12px backdrop blur over 70 to 90% ground instead of a shadow.

### Named Rules
**The Floating-Only Shadow Rule.** A shadow means the element sits above the page (menu, dialog, toast). Content, figures and nodes never cast one.

## Shapes

Gentle, small radii: 6px for controls and chips of UI (`--radius-sm`), 8px for buttons and figure frames (`--radius-md`), 10px for nodes inside a figure, full circles for nodes on a line, and a pill (999px) only for the theme toggle group and the search trigger. Edges are dashed (1.25 to 1.5px, accent, roughly 5 on 4 off for edges and 6 on 5 off for zone outlines, `vector-effect: non-scaling-stroke`); rules are solid 1px hairlines. The capability map and case figures sit on a faint 24px dot grid, the only texture in the system.

## Components

### Buttons
Restrained and solid; they lift by 1px on hover and settle on press.
- **Shape:** gently rounded (8px).
- **Primary:** ink fill, ground text, 0.625rem by 1rem, 0.875rem at 600. Hover turns the fill to Deep Signal Blue.
- **Secondary:** transparent with a strong border; hover darkens the border to ink and adds the grey wash.
- **Quiet (Copy as Markdown, map tools):** white sheet, strong border, 6px radius, 40px tall (36px in figures), 15px stroke icon. Hover darkens the border; a copied state turns border and text blue, a failed state turns text red.

### Links
Inline and navigational links are ink or muted ink with an underline in `border-strong` at 0.25 to 0.3em offset; hover turns the text Deep Signal Blue and the underline to currentColor. "Next" and "open" links carry a small arrow that shifts 3px on hover.

### Navigation
Fixed translucent header with avatar and name, text links at 0.875rem/500 in muted ink with a scaleX underline on hover and `aria-current`, a search trigger, locale menu, a three-way theme toggle (light, system, dark) and a primary Résumé button. Under 1024px the links move into a slide-down panel.

### Figure Node
The only boxed container in the system. White sheet, 1.5px strong border, 10px radius, 12 by 14px padding, a mono badge over a 650 title. Hover turns the border blue; the active node takes a 3px blue border; siblings dim to 25% when a zone is picked.

### Lifecycle Line (signature)
One node per part, joined by a single 1.5px dashed blue edge in the order the work happens. Node: 14px circle, 2px blue outline, hollow ground fill; the active node fills blue and scales to 1.15. Above each name sits a 0.75rem mono stage label; a blue mono flag marks the part read last. The same grammar appears vertically for chapter part lists (9px nodes) and AI setup flows, and on About as the career arc (11px nodes on a solid hairline, the current role filled blue).

### Checklist Step
A row on a hairline: a 15px square tick (1.5px subtle-ink border, 3px radius) that fills ink with an inset ground ring when done, and the step text dims to muted ink. State is stored locally; the default unchecked page reads complete.

## Do's and Don'ts

### Do:
- **Do** draw relationships as nodes and dashed edges in `signal-blue`; keep the edge in work order.
- **Do** put every number on the node, edge or sentence it measures, with its condition (p95, in 3 months, 18M+ MAU).
- **Do** separate rows and parts with 1px `hairline` rules and leave lists of text unboxed.
- **Do** cap prose at 62 to 64ch and balance headings.
- **Do** give each section one authored moment, use `--ease` (expo out) at 150 or 250ms for UI and 500 to 800ms for figure draws, and guard every keyframe with `prefers-reduced-motion`.
- **Do** design light and dark together; dark accents are lighter and text on them is dark (`--fg-on-accent`).
- **Do** keep tap targets at 44px and focus rings at 2px blue.

### Don't:
- **Don't** use cards: no bordered or shaded box around text that is not a node in a figure, and no card inside a card.
- **Don't** put eyebrows, kickers or category labels above headings; headings speak for themselves as claims.
- **Don't** number sections.
- **Don't** use gradient text or gradient fills on surfaces, borders or buttons. The dot grid and the hero's faint backdrop halo are the only gradients, and they are texture, not fill.
- **Don't** use chips or pills for tags, tech lists or labels; write them as a muted line.
- **Don't** set mono in uppercase with wide tracking, or use it for anything but apparatus.
- **Don't** add hero-metric grids, stat cards or fake sparklines.
- **Don't** cast shadows on content.
