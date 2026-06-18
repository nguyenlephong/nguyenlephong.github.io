# Liquid Glass Reader Controls Design

Date: 2026-06-18

## Scope

Refine the Blog and Notes index controls with a hybrid of the approved A and B mockups. The work covers the search field, category/topic filters, popular tag filters, result count, reset action, and empty state styling. It does not change article data, note data, locale routing, SEO paths, pagination behavior, query-string behavior, analytics, engagement tracking, or card content.

## Design Direction

Use a restrained Liquid Glass-inspired control layer. Search remains the primary floating control from option A: large, clear, and easy to scan. Category/topic filters become a soft segmented glass tray from option B: grouped enough to feel intentional, but not so heavy that it competes with the post list. Popular tags move into a lighter secondary tray, giving the page a reading-studio quality without turning the whole screen into glass.

The design should feel new and tactile while staying calm enough for long reading sessions.

## Apple-Inspired Principles

The implementation follows these principles from Apple's Liquid Glass guidance:

- Treat glass as a functional layer for controls and navigation, not as the whole content surface.
- Preserve hierarchy: search first, filters second, tags third, content list after that.
- Avoid glass-on-glass stacking. If a child sits inside a glass tray, it uses tint, transparency, or simple fills rather than another heavy material.
- Use color tint only for active or primary states. Do not tint every chip.
- Maintain legibility in dark and light themes, including stronger fallback backgrounds when transparency should be reduced.
- Keep motion subtle and responsive, and respect `prefers-reduced-motion`.

## Component Shape

Reuse the existing `BlogExplorer` and `NotesExplorer` markup where possible because they already share class names and state behavior. The main implementation should live in `src/app/[locale]/blog/blog.css`, with Notes inheriting the shared styles through `notes-explorer`.

Expected visual structure:

- `.blog-explorer__controls`: becomes the overall command surface with modern spacing.
- `.blog-search`: becomes the primary rounded glass bar.
- `.blog-filters`: becomes a segmented glass tray for category/topic buttons.
- `.blog-chip`: becomes a segment item with a soft active tint.
- `.blog-tags`: becomes a lighter secondary tray.
- `.blog-tag`: becomes a smaller secondary token.
- `.blog-explorer__status`: aligns count and reset without adding visual weight.

Only add markup if CSS alone cannot meet accessibility or layout requirements.

## Theme Behavior

Dark theme gets the richer glass treatment visible in the mockup: translucent dark material, subtle highlights, warm active tint, and a restrained ambient glow. Light theme should feel like frosted paper/glass over the existing page background, with darker text and softer shadows. Both themes must keep placeholder, label, chip, and tag text readable.

When `prefers-reduced-transparency: reduce` is active, glass surfaces use more opaque backgrounds and stronger borders. When `prefers-reduced-motion: reduce` is active, hover and focus transitions are shortened or disabled.

## Responsive Behavior

Desktop layout should feel wide and calm, matching the screenshot's scanning workflow. Mobile should stack controls with stable heights and no horizontal overflow. Long Vietnamese category names must wrap cleanly or remain readable in flexible chips without clipping.

The control group must not hide content or become sticky unless explicitly requested later.

## Accessibility

Keep native `button` and `input` elements. Preserve existing `aria-label`, `aria-pressed`, and `aria-live` behavior. Focus states must be visible on search, chips, tags, clear search, reset, and pagination controls. Color cannot be the only indicator of active state; active chips need border, background, and text-weight changes.

## Validation

Run focused checks after implementation:

- `npm run lint`
- `npm run build:fast`
- Browser inspection on `/vi/blog` and `/vi/notes` in dark and light themes.
- Mobile viewport inspection for chip wrapping and no text overlap.
- Confirm URL query behavior still works for search, category/topic, tag, and page parameters.

## Out Of Scope

This pass does not redesign article cards, note cards, the article reading page, reader background picker, floating reader tools, OG image generation, or content data.
