# Content List Loading Performance

## What

Blog and notes cards use intent-driven App Router prefetching. Links remain
normal localized Next links, but viewport visibility alone does not fetch every
article payload. Keyboard focus or pointer hover restores Next's native
prefetch policy for only the intended link.

The public header displays the existing 72 px favicon asset at 36 CSS pixels.
That small asset is loaded eagerly with high fetch priority; the 512 px app
icon remains unchanged for Next metadata and install/icon consumers.

## Why

Content archives can render dozens of links at once. Automatic viewport
prefetching turns those lists into dozens of speculative RSC requests. The
header also transferred a 512 px image for a 36 px slot, increasing critical
image bytes without improving visual quality.

## Acceptance criteria

1. Blog and notes article-card links render with `prefetch={false}` before
   interaction.
2. Pointer hover or keyboard focus changes only that link to Next's default
   App Router prefetch mode (`null`).
3. Touch, click, modifier-click, locale routing, existing link props, and card
   analytics continue through the existing Next/next-intl link contract.
4. The header requests the 72 px favicon, displayed at 36 x 36, with eager
   loading and high fetch priority.
5. `src/app/icon.png` remains the metadata app icon and is not repurposed or
   removed.
6. Tests lock the intent-prefetch state mapping, card wiring, analytics wiring,
   and header image contract.
