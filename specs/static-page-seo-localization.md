# Static page SEO localization

## Context

About, Apps, Gallery, and Studio (the `/studio` overview plus its three module
pages `/studio/checklists`, `/studio/system-maps`, `/studio/ai-setup`) are
exported under all six locale-prefixed routes so a visitor can keep the locale
selected in the public shell. These pages do not have the same editorial
coverage, though. Treating an English fallback as
if it were translated creates duplicate indexable pages and inaccurate
language signals.

This contract separates the route locale from the language of the authored
content. It keeps every public route usable while allowing search engines to
index only the variants that have real localized copy.

## Contract precedence

For About, Apps, Gallery, and the Studio pages, this specification supersedes older blanket
requirements in `static-runtime-boundaries.md` that described canonical,
`hreflang`, locale-fallback, and sitemap behavior as historically unchanged.
The runtime-boundary contract still requires CSS extraction and route-boundary
refactors to preserve the current SEO policy defined here. This precedence does
not change the SEO policy of any other route.

## Content ownership matrix

| Page | Authored content locales | Accessible fallback routes |
|---|---|---|
| About | `en`, `vi`, `fr`, `ja`, `ko`, `zh` | None |
| Apps | `en`, `vi` | `fr`, `ja`, `ko`, `zh` render the English content |
| Gallery | `en`, `vi`, `fr`, `ja`, `ko`, `zh` | None |
| Studio overview and 3 modules | `en`, `vi` | `fr`, `ja`, `ko`, `zh` render the English content |

Apps keeps canonical English product names and descriptions inside the
otherwise localized Vietnamese showroom. That is intentional product copy,
not evidence that the Vietnamese route is an English fallback.

## Search identity

- An authored variant is indexable, self-canonical, present in the sitemap,
  and participates in a reciprocal `hreflang` cluster containing only authored
  variants plus an English `x-default`.
- A fallback Apps or Studio route remains directly accessible at its selected
  locale URL. It renders the English content, declares `lang="en"` at the page
  content boundary, emits `noindex, follow`, is self-canonical (its own route
  URL, also used for `og:url` and the JSON-LD `@id`/`url`), and emits no
  `hreflang` or alternate Open Graph locale. A canonical that pointed at the
  English page would contradict the `noindex`, so the two signals never
  disagree. The generic robots and Googlebot-specific directives must agree.
- Fallback routes are absent from sitemap locations and sitemap alternates.
  Their route URL does not redirect, so navigation and locale preference stay
  stable for the visitor.
- Each route uses one natural title and description across the document meta,
  Open Graph, Twitter, and the route-owned JSON-LD object. Focused static pages
  clear the broad portfolio keyword metadata inherited from the locale layout.
- About emits `AboutPage`, Apps emits `ItemList`, Gallery emits
  `ImageGallery`, the Studio overview emits `CollectionPage`, and each Studio
  module page emits `WebPage` with exactly one H1. Their `@id`, `url`, `name`, `description`, and `inLanguage`
  match the resolved search identity. The Apps `ItemList` also keeps its own
  description.

The source policy lives in
`src/lib/seo/static-page-localization.ts`. The export verifier mirrors it in
`config/static-artifact-budgets.json`; a focused test requires both definitions
to remain equal.

## Performance boundary

Gallery emits no image preload. The first photo of the grid renders with
`loading="eager"` and `fetchpriority="high"`; every other photo stays lazy with
automatic fetch priority. Gallery is also a page-level
phone target in the CrUX field-data monitor; missing field data remains
`unknown`, not healthy.

## Non-goals

- This change does not machine-translate Apps or Studio.
- It does not change locale selection, public route paths, analytics events,
  visible Gallery content, or the shared social-image raster.
- It does not claim that a configured CrUX target already has enough real-user
  traffic to return a page-level sample.

## Acceptance criteria

- **AC-SPS-001:** Apps and the four Studio pages have authored, indexable `en`
  and `vi` variants with self-canonicals and an `en`/`vi`/`x-default` language
  cluster. About is authored and indexable in all six locales.
- **AC-SPS-002:** The `fr`, `ja`, `ko`, and `zh` Apps and Studio routes remain
  accessible, render English content, declare an English content boundary,
  emit matching generic and Googlebot `noindex, follow` directives, and are
  self-canonical.
- **AC-SPS-003:** No fallback Apps or Studio URL appears in a sitemap location,
  HTML `hreflang`, sitemap alternate, or alternate Open Graph locale.
- **AC-SPS-004:** Gallery has real localized metadata and visible copy for all
  six locales. Every catalog owns the complete 32-leaf visible Gallery message
  shape; every variant is indexable, self-canonical, and belongs to the
  complete six-locale plus `x-default` cluster.
- **AC-SPS-005:** Document title, meta description, Open Graph title and
  description, Twitter title and description, and route-owned JSON-LD name and
  description are byte-for-byte equal for each of the 42 route URLs (seven
  pages, six locales).
- **AC-SPS-006:** About, Apps, Gallery, and Studio JSON-LD use the resolved canonical
  identity and content language; Apps includes an `ItemList` description.
- **AC-SPS-007:** The focused static pages emit no `meta keywords`,
  including an empty tag or inherited layout keywords.
- **AC-SPS-008:** The artifact verifier checks the emitted HTML and sitemap for
  all 42 URLs and rejects identity, robots, language, parity, keyword,
  `hreflang`, sitemap-policy drift, or a Studio module page without exactly
  one H1.
- **AC-SPS-009:** The runtime and artifact policy definitions stay equal under
  a source test, and every modified spec keeps its existing acceptance labels
  as an unchanged prefix.
- **AC-SPS-010:** Existing About, Apps, and Gallery analytics events and the
  visitor's selected route locale remain unchanged.
- **AC-SPS-011:** Gallery emits no image preload; only the first grid photo is
  `loading="eager"` with `fetchpriority="high"`, and every other photo stays
  lazy.
- **AC-SPS-012:** Gallery is present exactly once in the configured page-level
  phone CrUX targets; unavailable field data remains explicitly unknown.

## Verification

- Source tests validate message ownership, the content matrix, policy/config
  parity, metadata construction, sitemap membership, CrUX configuration, and
  append-only acceptance labels.
- Artifact fixtures cover every policy URL combination, including a Studio
  module page, and mutation cases for
  indexing, content language, keywords, metadata parity, `hreflang`, and
  sitemap leakage.
- A fresh Node 22 static export is checked by the artifact, performance,
  runtime, pagination, and offline gates before browser-level desktop/mobile
  verification.
