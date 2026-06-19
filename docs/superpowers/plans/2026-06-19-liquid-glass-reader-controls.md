# Command Palette Reader Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bulky Blog and Notes index filter trays with a compact command palette while preserving search, filter, pagination, URL, locale, SEO, and engagement behavior.

**Architecture:** Keep the existing `BlogExplorer` and `NotesExplorer` filtering model. Add local palette open/close state in each explorer, render category/topic and tag controls inside a floating palette, and keep all shared visual styling in `src/app/[locale]/blog/blog.css`.

**Tech Stack:** Next.js App Router, React, CSS custom properties, Node test runner, browser inspection for visual verification.

---

### Task 1: Command Palette Contract Test

**Files:**
- Modify: `tests/liquid-glass-reader-controls.test.mjs`
- Read: `src/app/[locale]/blog/blog.css`
- Read: `src/components/blog/BlogExplorer.tsx`
- Read: `src/components/notes/NotesExplorer.tsx`

- [ ] **Step 1: Update the focused Node test**

Assert the shared explorer controls define command-palette selectors and material fallbacks:

- `.blog-explorer__controls` exposes material tokens.
- `.blog-command` is the palette boundary.
- `.blog-command__bar` uses backdrop blur/saturation.
- `.blog-command__palette` is a floating overlay.
- `.blog-command__tokens` supports wrapped active filters.
- Blog and Notes explorers both render `paletteOpen`, `.blog-command__palette`, and `.blog-command__toggle`.
- Reduced transparency and reduced motion media queries remain present.

- [ ] **Step 2: Run the test red**

Run: `node --test tests/liquid-glass-reader-controls.test.mjs`

Expected: FAIL before implementation because `.blog-command` selectors are missing.

### Task 2: Blog and Notes Explorer Markup

**Files:**
- Modify: `src/components/blog/BlogExplorer.tsx`
- Modify: `src/components/notes/NotesExplorer.tsx`

- [ ] **Step 1: Add palette state and close behavior**

Add `paletteOpen`, a command wrapper ref, outside-pointer close behavior, and Escape close behavior. Do not change the existing filter/search/page state shape.

- [ ] **Step 2: Replace permanent trays with command UI**

Render:

- One command bar containing search, result count, clear search, and a filter icon button.
- Active category/topic and tag tokens below the bar.
- A conditional palette with category/topic choices and popular tags.
- No-JS fallback markup using the old chip/tag selectors.

- [ ] **Step 3: Preserve behavior**

Search still updates `q`, category still updates `cat`, notes topic still updates `topic`, tags still update `tag`, and pagination still updates `page`.

### Task 3: Shared CSS

**Files:**
- Modify: `src/app/[locale]/blog/blog.css`
- Test: `tests/liquid-glass-reader-controls.test.mjs`

- [ ] **Step 1: Replace explorer control styling**

Define the command palette styling:

- Material tokens on `.blog-explorer__controls`.
- Compact glass command bar with a subtle highlight pass.
- Icon filter button with clear active/open state.
- Wrapped active tokens.
- Floating desktop palette.
- Desktop drop-up placement when there is not enough viewport space below the command bar.
- Mobile bottom sheet palette.
- Dark theme overrides.
- Stacking above archive navigation, cards, and floating reader controls while open.
- Reduced transparency and reduced motion fallbacks.
- Minimal fallback styling for old no-JS chip/tag selectors.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/liquid-glass-reader-controls.test.mjs`

Expected: PASS.

### Task 4: Verification

**Files:**
- Read: `package.json`
- Verify pages: `/vi/blog`, `/vi/notes`

- [ ] **Step 1: Run all Node tests**

Run: `node --test tests/*.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: PASS. Existing unrelated warnings are acceptable.

- [ ] **Step 3: Run fast build**

Run: `npm run build:fast`

Expected: PASS.

- [ ] **Step 4: Inspect in browser**

Start the dev server if needed. Inspect `/vi/blog` and `/vi/notes` in desktop and mobile viewports. Confirm palette open/close, URL updates, active tokens, dark/light readability, and no text overlap.

### Task 5: Commit and Push

- [ ] Stage only the spec, plan, test, explorer components, and shared CSS.
- [ ] Do not stage unrelated `app-version.json` changes.
- [ ] Commit with `Revamp reader controls as command palette`.
- [ ] Push `dev` and confirm the existing pull request is updated.

### Self-Review

Spec coverage:
- Compact command palette direction is covered by Tasks 2 and 3.
- Existing behavior preservation is covered by Task 2 and browser checks in Task 4.
- Accessibility and reduced-motion/transparency requirements are covered by Task 3 and Task 4.

Placeholder scan:
- No `TBD`, `TODO`, or undefined implementation placeholders are present.

Type consistency:
- This plan adds local UI state only. It does not change post, note, family, SEO, analytics, or URL data models.
