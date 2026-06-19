# Command Palette Reader Controls Design

Date: 2026-06-18

## Scope

Revamp the Blog and Notes index controls into a compact command palette. The work covers search, category/topic filters, popular tag filters, active filter tokens, result count, reset action, and responsive behavior. It does not change article data, note data, locale routing, SEO paths, pagination behavior, query-string behavior, analytics, engagement tracking, or card content.

## Design Direction

Use one calm command surface instead of permanent filter trays. The default state should feel light while reading: a single rounded search bar with a filter icon, result count, and optional active tokens. When the reader focuses the search field or presses the filter icon, a floating palette opens with category/topic choices and popular tags.

The palette should feel closer to a modern command menu than a dashboard filter panel: compact, legible, fast to dismiss, and visually quiet enough to sit inside a reading-focused page.

## Interaction Model

- Search stays visible and opens the palette on focus.
- The filter icon toggles the palette and exposes `aria-expanded`.
- Category/topic and tag choices live inside the palette.
- Selecting a category/topic or tag updates the same existing view state, closes the palette, and preserves URL query behavior.
- Active category/topic and tag selections appear as small removable tokens below the search bar.
- The result count lives inside the command bar, not as a separate block.
- Clicking outside the command surface or pressing Escape closes the palette.

## Component Shape

Reuse the existing `BlogExplorer` and `NotesExplorer` state, filtering, pagination, and URL synchronization. Add only the local state needed to open and close the palette.

Expected visual structure:

- `.blog-explorer__controls`: shared material/token scope.
- `.blog-command`: command wrapper and outside-click boundary.
- `.blog-command__bar`: visible search/result/filter surface.
- `.blog-command__toggle`: icon button that opens or closes filters.
- `.blog-command__tokens`: compact active filter row.
- `.blog-command__palette`: floating desktop palette and mobile bottom sheet.
- `.blog-command__option`: category/topic choice.
- `.blog-command__tag`: popular tag choice.

The old `.blog-filters`, `.blog-chip`, `.blog-tags`, and `.blog-tag` selectors may remain only as no-JS fallback styling.

## Theme Behavior

Light and dark themes both use the same command palette structure. Dark theme gets a stronger opaque fallback and clearer border so the palette does not disappear into the page background. Light theme should read as frosted paper/glass over the existing background, not as a heavy card.

When `prefers-reduced-transparency: reduce` is active, glass surfaces use opaque backgrounds and no backdrop blur. When `prefers-reduced-motion: reduce` is active, hover, focus, and highlight transitions are disabled.

## Responsive Behavior

Desktop uses a floating palette positioned near the command bar. If there is not enough viewport space below the bar, the palette opens upward so it remains visible. Mobile uses a bottom sheet with safe-area spacing, capped height, and internal scrolling so long tag/category lists do not overlap the content.

Long Vietnamese labels must stay readable. Buttons and tokens may wrap, but they must not overflow horizontally or resize the command bar unexpectedly. When the palette is open, it must stack above archive navigation, cards, and floating reader controls.

## Accessibility

Keep native `button` and `input` elements. Preserve existing search labels, pressed states, and live result count. The filter button owns the expanded state. Focus states must be visible on search, filter toggle, palette options, tags, tokens, clear search, reset, and pagination controls.

Color cannot be the only active indicator; selected options need background, border, and contrast changes.

## Validation

Run focused checks after implementation:

- `node --test tests/liquid-glass-reader-controls.test.mjs`
- `node --test tests/*.test.mjs`
- `npm run lint`
- `npm run build:fast`
- Browser inspection on `/vi/blog` and `/vi/notes` in desktop and mobile viewports.
- Confirm URL query behavior still works for search, category/topic, tag, and page parameters.

## Out Of Scope

This pass does not redesign article cards, note cards, the article reading page, reader background picker, floating reader tools, OG image generation, or content data.
