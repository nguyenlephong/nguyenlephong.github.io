# Static content pagination and on-demand search

## Context

The blog and notes archives currently serialize every card into the first HTML
document and paginate only after hydration. That keeps filtering instant for a
small corpus, but page weight, browser work, and Firestore reads grow with the
entire archive.

This change keeps the site static-first. Each archive page is emitted as a
crawlable HTML document, while full-corpus search data is fetched only after a
reader expresses search or filter intent.

## Why

- Keep initial HTML proportional to one page of cards rather than the archive.
- Give crawlers sequential links that do not depend on JavaScript.
- Give every indexable page its own URL, canonical, title, description, and
  current-page `ItemList`.
- Preserve fast client-side search without making search a prerequisite for
  browsing.

The SEO contract follows Google's pagination guidance: unique page URLs,
self-canonicals for indexable pages, and sequential links represented by real
`<a href>` elements. Search remains progressive enhancement because crawlers
and readers without JavaScript must still reach every article.

## Scope

- `/[locale]/blog` and `/[locale]/blog/page/[page]`
- `/[locale]/notes` and `/[locale]/notes/page/[page]`
- Blog and notes explorer state, pagination controls, and search data loading
- Static JSON search indexes generated through export-compatible GET handlers

Article pages, article sitemap policy, and source content files are outside this
change.

## Acceptance criteria

Acceptance criteria IDs are append-only. New criteria must receive a new ID;
existing IDs must not be renamed or renumbered.

- **AC-SCP-001:** Page one remains at `/[locale]/blog` or
  `/[locale]/notes`; later pages use `/[locale]/blog/page/[page]` or
  `/[locale]/notes/page/[page]`.
- **AC-SCP-002:** Every generated archive page contains no more than one page
  of cards in its initial HTML and React payload.
- **AC-SCP-003:** Every indexable archive page has a self-referencing canonical,
  locale alternates for the same page number, and page-aware title and
  description metadata.
- **AC-SCP-004:** Pagination exposes previous, next, and numbered destinations
  as real `<a href>` links; each page links sequentially to its neighbours and
  back to page one.
- **AC-SCP-005:** Structured data contains an `ItemList` for the current page
  only, with positions continuing from the page offset.
- **AC-SCP-006:** The initial page does not embed the full search corpus. A
  minimal locale-specific JSON index is requested only after search/filter
  intent or when restoring a search/filter deep link.
- **AC-SCP-007:** If the search index cannot be loaded, current-page cards and
  static pagination remain usable and an accessible status message explains
  that browsing is still available.
- **AC-SCP-008:** Existing category/topic filters, tags, query-string state,
  analytics event names, visible-card engagement, localization, keyboard
  access, and screen-reader labels remain supported.
- **AC-SCP-009:** Static export generates every declared pagination page and
  locale search index without requiring a runtime server.
- **AC-SCP-010:** Automated tests cover page arithmetic, canonical/path
  behavior, crawlable anchor markup, lazy index loading, current-page JSON-LD,
  and the no-full-corpus initial-props contract.
- **AC-SCP-011:** Blog archive cards, pagination parameters, search indexes,
  and `ItemList` entries contain only posts with an explicitly authored body
  for that locale.
- **AC-SCP-012:** A paginated archive emits `hreflang` only for locales where
  the same page number exists; every member is reciprocal and `x-default`
  resolves to a real page.
- **AC-SCP-013:** Notes pagination is generated only for authored archive
  locales. Other locale landing pages consolidate to English with a canonical
  and canonical article links, without combining canonical and `noindex`.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build:fast`
- Inspect exported page canonicals, `ItemList`, pagination anchors, search JSON,
  and raw/gzip HTML size for English blog and notes page one.

## References

- [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Next.js static export route handlers](https://nextjs.org/docs/app/guides/static-exports#route-handlers)
