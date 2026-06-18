# Liquid Glass Reader Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved hybrid A+B Liquid Glass treatment to the shared Blog and Notes index controls without changing search/filter behavior.

**Architecture:** Keep the existing `BlogExplorer` and `NotesExplorer` state, URL, and accessibility behavior. Implement the design primarily in the shared Blog CSS selectors already used by both explorers, and add a static CSS regression test for the new glass contract.

**Tech Stack:** Next.js App Router, React, CSS custom properties, Node test runner, Playwright/browser inspection for visual verification.

---

### Task 1: CSS Contract Test

**Files:**
- Create: `tests/liquid-glass-reader-controls.test.mjs`
- Read: `src/app/[locale]/blog/blog.css`

- [ ] **Step 1: Write the failing test**

Create a Node test that reads `src/app/[locale]/blog/blog.css` and asserts the shared explorer controls include a glass material contract:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile("src/app/[locale]/blog/blog.css", "utf8");

function blockFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  assert.ok(match, `missing CSS block for ${selector}`);
  return match[1];
}

test("blog and notes explorer controls expose the liquid glass material contract", () => {
  const controls = blockFor(".blog-explorer__controls");
  assert.match(controls, /--blog-control-glass:/);
  assert.match(controls, /--blog-control-border:/);
  assert.match(controls, /--blog-control-shadow:/);

  const search = blockFor(".blog-search");
  assert.match(search, /backdrop-filter:/);
  assert.match(search, /saturate/);

  const filters = blockFor(".blog-filters");
  assert.match(filters, /backdrop-filter:/);
  assert.match(filters, /--blog-segment-fill:/);

  const tags = blockFor(".blog-tags");
  assert.match(tags, /backdrop-filter:/);
  assert.match(tags, /--blog-tag-fill:/);

  assert.match(css, /@media\s*\(prefers-reduced-transparency:\s*reduce\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/liquid-glass-reader-controls.test.mjs`

Expected: FAIL because the current CSS does not define `--blog-control-glass` or reduced-transparency handling for the explorer controls.

### Task 2: Liquid Glass Shared Controls CSS

**Files:**
- Modify: `src/app/[locale]/blog/blog.css`
- Test: `tests/liquid-glass-reader-controls.test.mjs`

- [ ] **Step 1: Replace the explorer control styling**

Update the existing CSS blocks for `.blog-explorer__controls`, `.blog-search`, `.blog-filters`, `.blog-chip`, `.blog-tags`, `.blog-tag`, `.blog-explorer__status`, `.blog-explorer__count`, and `.blog-explorer__reset`.

The CSS must:

- Define material tokens on `.blog-explorer__controls`.
- Use `backdrop-filter: blur(...) saturate(...)` on the search, filter tray, and tag tray.
- Keep the search as the primary rounded control.
- Make `.blog-filters` a segmented tray and avoid heavy glass on child chips.
- Make `.blog-tags` a lighter secondary tray.
- Add dark-theme token overrides.
- Add `prefers-reduced-transparency` fallbacks.
- Add `prefers-reduced-motion` fallbacks.
- Preserve focus-visible styles and 44px minimum tap targets.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/liquid-glass-reader-controls.test.mjs`

Expected: PASS.

- [ ] **Step 3: Run all Node tests**

Run: `node --test tests/*.test.mjs`

Expected: PASS for all tests.

### Task 3: Browser Verification

**Files:**
- Read: `package.json`
- Verify pages: `/vi/blog`, `/vi/notes`

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: PASS. Existing warnings are acceptable only if they are unrelated and already present.

- [ ] **Step 2: Run fast build**

Run: `npm run build:fast`

Expected: PASS.

- [ ] **Step 3: Inspect in browser**

Start the dev server if needed, then inspect `/vi/blog` and `/vi/notes` in desktop and mobile viewports. Check dark and light themes, long Vietnamese chip wrapping, focus visibility, no text overlap, and that query parameters still update for search/category/topic/tag.

- [ ] **Step 4: Commit implementation**

Stage only the plan, test, and implementation files. Do not stage unrelated `app-version.json` changes.

Commit message:

```bash
git commit -m "Apply liquid glass reader controls"
```

### Self-Review

Spec coverage:
- Hybrid A+B control layer is covered by Task 2.
- Existing behavior preservation is covered by leaving React state/URL code untouched and verifying query behavior in Task 3.
- Accessibility and reduced-motion/transparency requirements are covered by Task 2 and Task 3.

Placeholder scan:
- No `TBD`, `TODO`, or undefined implementation placeholders are present.

Type consistency:
- This plan touches CSS and a Node static test only; no TypeScript API changes are introduced.
