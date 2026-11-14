# Design grammar: the CV as a system spec

Distilled from `AI/research/cv-design-audit-direction-2026-11-12.md` and the impeccable craft floor. The Core Capabilities live system map (`src/components/cv/CapabilityMap*.tsx`) is the reference implementation and the quality bar.

## 5. Direction: "the CV as a system spec"

One idea for the whole page: Phong is presented the way he would present a system he owns. Each section is a figure of that system with an annotation layer, and numbers are measurements attached to the thing they measure, never free-floating counters. The particle backdrop is the ambient field; the diagrams are the foreground. No new brand, no new colors: the map's tokens, strokes, dashed edges, accent and amber/emerald lane colors become the page grammar.

### 5.1 Grammar (applies to every section)
- **Nodes and edges, not cards.** A boxed container is allowed only when it is a node in a figure. Lists of text get no border, no background, no shadow.
- **Annotations carry the numbers.** A number always sits on an edge, a node, or next to the sentence that earns it, with its condition ("p95", "in 3 months", "across 30+ tenants").
- **Mono = apparatus only.** Dates, durations, figure labels, measurements, version tags, code. Never section labels, never prose, never pills.
- **One authored moment per section**, and at most one continuous loop visible at any time.
- **Headings speak for themselves.** No eyebrows anywhere. Headings are claims in the owner's voice, not category names.

### 5.2 Section concepts

**Hero: "current deployment"**
- Left: name (solid color, no gradient), one claim line borrowed from `/about` ("I build product systems that can be shipped, observed, and recovered."), the two roles, a two-line bio, Résumé + Email. Phone moves to Contact.
- Right (replaces the stat grid): a small SVG topology in the map's style. A node "Phong" with two live edges: Zalo PC (Lead, since Mar 2026, 18M+ MAU desktop, Android product used by ~80M) and BonBon Mobility (Co-founder, $500K pre-seed led by Tasco, live in VETC's 4.3M-user app). Each edge carries its annotation. A third dashed, faded edge for "previous: NDSVN delivery lead, 8 dev + 3 QC" links down to Experience.
- Authored moment: on first load the two edges draw in once (stroke-dashoffset, exponential ease-out, about 700ms), starting from an already-visible static state so nothing is hidden if JS or motion is off. Hovering an edge highlights the matching role line on the left.
- Interaction: edge nodes are real links (Zalo role → `#experience` anchor, BonBon → case file). Track `cv_hero_node_select`.
- Mobile: topology goes below the CTAs at a fixed small height (about 220px) or collapses to two annotated rows; hero target at 375 is under 900px.
- Delete: stat cards, sparklines, six tones, conic ring, glow, icon tiles, `.accent` sheen, `stat-*` CSS (about 200 lines).

**About: merge into the map**
- Delete the three intro paragraphs; one or two sentences of genuinely new information can become the map section's lede (max 62ch).
- Section title rewritten as a claim, not a triad. Example to confirm with owner: "Six systems I have carried to production." (only if the count and wording are true).
- Map stays the visual peak. Additions: each zone's panel gets a "Case file" link when one exists (LogiUP, BonBon first), so the diagram becomes the table of contents into Projects. Pause SVG/CSS motion when out of view (`svg.pauseAnimations()` + a class toggle), add an edge fade on the mobile tab strip.

**Technical foundation: "stack manifest"**
- Replace the eight cards with a dense two-column definition list: category in the left column (sans, 600), items in the right (sans, `--fg-muted`), hairline rule between rows, no checks, no pulses.
- Optional P2 link to the map: each manifest row lists which zones use it; hovering a row dims the map to those zones. Only do this if it stays honest (every mapping real).
- Target height at 375: under 600px (from 1,180px).

**Experience: "release history" (git graph)**
- A left rail drawn in SVG as a branch graph: main line = career; Zalo PC branch (2024-2025); a branch to NDSVN (2025-2026, CTO transition, delivery lead); merge back into Zalo PC as Lead (2026). Earlier roles (PrimeData, Splus, Propman) sit lower on the main line. This makes the boomerang and the level progression visible without a sentence.
- Each role row: date range in mono tabular (one format: `Mar 2026 – now`, `Aug 2025 – Mar 2026`), title, company, a one-line scope (team size, users, ownership), the evidence link where it exists, then the top three contributions. The rest go in a native `<details>` ("All contributions (5)"). Track `cv_experience_expand`.
- 2018 to 2020 roles collapse into one "Earlier" row group with one line each.
- Tech: one muted mono line per role, max five items, no chips. Featured vs plain distinction removed.
- Authored moment: the rail draws as you scroll (CSS `animation-timeline: view()` on the path, static full rail as fallback and under reduced motion). The merge-back node gets the single accent pulse when it enters.
- Fix: normalise locations to "Ho Chi Minh City" (district names go), replace "→" bullets with plain hanging-indent list or a small drawn tick from the same stroke set.
- Target: about 1,400px at 1440, under 3,000px at 375.

**Projects: two case files + an index**
- Two flagship case files, LogiUP and BonBon, each with a fixed shape: Context, Decisions (two or three, each one line), Outcome (the numbers with conditions), Evidence (site, coverage). Each gets a figure that reuses the map's drawing code for that zone at a larger scale (multi-tenant isolation for LogiUP; mini-app inside VETC with kill-switch rollout for BonBon). Wide layout: figure left, text right at 1440; stacked on mobile.
- Everything else becomes an index table: year (mono), project, role, one-line outcome, link if any. Remove the entries that only repeat Experience (CDP, Event SDK, Savyu, Mobivi) or keep them as single index lines.
- Authored moment: arriving from a map zone's "Case file" link scrolls to the case file and plays that zone's figure once (same animation as in the map), so the two sections visibly belong to one system. Track `cv_case_file_open` with `source: map|index|hero`.
- No hover lift. `cv_project_view` (existing name, keep it for dashboards) moves from mouseenter to an IntersectionObserver view at 50%.
- Target: about 1,600px at 1440, under 3,000px at 375.

**Contact: "endpoint"**
- Left-aligned, no box, no grid paper, no eyebrow. A short heading in the owner's voice (owner to write), then a small spec block: Open to (Staff/Principal, Lead Fullstack/Product Eng, EM), Where (Ho Chi Minh City or remote, UTC+7), Reply (for example "within two working days", only if true), Email, Phone.
- Primary action: email with a copy button that shows "Copied" state and an `aria-live` confirmation. Résumé PDF and LinkedIn as text links.
- Optional: the final node of the hero topology reappears here as an open port (a dashed edge ending at the email). Static, no loop.
- Track `cv_email_copy`; keep `cv_contact_click`, `cv_resume_download`, `cv_social_click` names.

### 5.3 Typography rules
- Keep Inter (self-hosted, latin + vi). Content is always Inter.
- Mono: self-host one mono face, subset latin + vi, weights 400 and 500 (one variable file, budget about 30 to 40KB). JetBrains Mono is the default pick (matches DuBois-style apparatus, open licence); verify its Vietnamese coverage before subsetting, otherwise IBM Plex Mono. Alternative with zero bytes: drop mono from labels entirely and use Inter with `font-variant-numeric: tabular-nums` for dates and figures. Either is fine; Courier is not.
- Scale (keep tokens, change use): hero name `--text-hero` with `letter-spacing: -0.03em`; section titles up from 2rem/600 to `clamp(2rem, 1.4rem + 2vw, 2.75rem)`/650 with -0.02em, so they clearly beat the 20px company names; body 16px/1.65; meta 13px; nothing below 12px (stat captions are 11.2px today).
- Measure: prose capped at 62 to 68ch everywhere (`.prose`, role summaries, case file text).
- `text-wrap: balance` on all headings, `pretty` on paragraphs.
- Bold inside bullets: one bold phrase per bullet maximum. Today several bullets bold three to four phrases, so nothing stands out.

### 5.4 Spacing and layout rules
- Section rhythm: hero (dense) → map (peak, most air) → experience (dense list) → case files (second peak) → contact (quiet). Section padding stays `--space-section`, but the space above a section title must be larger than below it (today the head has a bottom border and 2.5rem margin under, which makes every section start the same way). Drop the per-section bottom divider.
- A 4px spacing scale for intra-section gaps (4, 8, 12, 16, 24, 32, 48); stop one-off values like 0.95rem/1.125rem.
- Containers only for figures. Lists, manifests, timelines are borderless.
- Mobile: total page target under 9,000px at 375 (now 15,287px).

### 5.5 Motion rules
- Budget: one authored moment per section (hero edge draw, map cycle, rail draw, case-file figure, copy confirmation). At most one infinite loop visible at a time: the map's active zone. Everything else runs once.
- Delete: name gradient sheen, eight skill-check pulses, conic stat ring, card hover lifts on non-interactive elements. Keep the status dot pulse only if it signals something live; otherwise make it static.
- Ease: the existing `--ease` (expo out) for everything; durations 150/250ms for UI, 500 to 800ms for figure draws.
- Default state is the final state. Animations only add, so reduced motion and no-JS show the complete page. Every keyframe animation sits under a `prefers-reduced-motion` guard.
- Pause everything off-screen (map SVG via `pauseAnimations()`, CSS via a `data-inview` attribute).
- Particle backdrop: keep as is for now. P2 idea: tie its density or tint to the active section (calmer behind Experience text, fuller behind the map) using the existing scroll renderer, with no new library.

### 5.6 Delete list
- Hero stat grid and all `stat-*` CSS; the six tones; sparklines; `.accent` gradient.
- All eyebrows: `Section` `eyebrow` prop and `.cv-section-eyebrow`, `.vision-header`/`.vision-eyebrow`/`.vision-rule`, `.cta-eyebrow`, and `Sections.*Eyebrow`, `Summary.visionEyebrow`, `Summary.hardSkillsEyebrow`, `CTA.eyebrow` keys in six locales (update `tests/helpers/client-message-contract-config.mjs` accordingly).
- `.skill-check` and its pulse; skill card borders.
- `.cta-inner` grid background and inset border.
- "→" bullets, location/date pills, featured-chip logic (`FEATURED_TECHS`).
- Hover lifts on `.project-card`, `.stat-card`, `.skill-list-item`.
- Dead props: `stagger` on `Stagger` (Reveal is now a no-op wrapper; either remove the wrapper usage or leave it, but stop passing `stagger`).
- Repeated "PC message backup" sentence: keep it in the map panel and Experience, remove from the hero bio.

---

