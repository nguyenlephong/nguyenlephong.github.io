# Content List Loading Performance

## What

Blog and notes cards, Blog category cards, the public header, and the internal
Apps footer destination use intent-driven App Router prefetching. Links remain
normal localized Next links with crawlable `href` values, but viewport
visibility alone does not fetch their RSC payloads. Keyboard focus or pointer
hover restores Next's native prefetch policy for only the intended link.

Archive view counters are another progressive enhancement. Blog and Notes do
not load the Firebase adapter or request Firestore data during an ordinary
first paint. The first scroll, search/filter interaction, or restored
search/filter deep link enables a bounded visible-page read. Readers with
`Save-Data` enabled browse without archive counters. Card hover remains solely
a navigation signal and never enables Firebase.

The public header displays the existing 72 px favicon asset at 36 CSS pixels.
That small asset is loaded eagerly with high fetch priority; the 512 px app
icon remains unchanged for Next metadata and install/icon consumers.

## Why

Content archives can render dozens of links at once. Automatic viewport
prefetching turns those lists into dozens of speculative RSC requests. The
header also transferred a 512 px image for a 36 px slot, increasing critical
image bytes without improving visual quality. Loading the Firestore SDK and
opening provider channels before browsing intent creates a larger avoidable
network cost than the visible counters themselves.

## Acceptance criteria

The numbered criteria are append-only. Existing criteria keep their original
number when later loading boundaries are added.

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
7. Header brand, desktop/mobile navigation, Blog category cards, article cards,
   and the internal Apps footer link start with prefetch disabled; hover or
   keyboard focus can prefetch only that destination.
8. Existing localized `href` output, SSR crawlability, click analytics, touch,
   modifier-click, and the full-document Studio boundary remain unchanged.
9. Blog and Notes archive counters remain in `waiting` state until the first
   scroll, explicit search/filter interaction, or a restored `q`, category,
   topic, or tag parameter.
10. The shared archive hook runs at most one `CONTENT_PAGE_SIZE` provider batch
    and retains at most one replaceable latest-visible queue of the same size.
    Resolved and active ids are deduplicated, no more than two pages are
    outstanding, the mounted resolved cache retains at most four visible pages,
    and an empty or failed read releases the active batch before the latest view
    continues. Static cards remain usable throughout.
11. `navigator.connection.saveData === true` skips archive counter loading for
    the lifetime of the mounted archive. Article-page engagement remains
    available through its existing behavior.
12. Source, artifact, and browser gates reject eager provider markers or RSC
    requests before intent, prove category hover targets only its destination,
    prove first scroll enables stats, and prove direct Blog and Notes query
    links preserve their query while requesting both the static search index and
    deferred counters. Under `Save-Data`, the same query may load only its search
    index. These checks use observable state rather than timeout-based byte
    assertions.
