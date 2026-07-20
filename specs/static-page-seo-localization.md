# Static page SEO localization

## Context

About, Apps, and Gallery are exported under all six locale-prefixed routes so a
visitor can keep the locale selected in the public shell. The three pages do
not have the same editorial coverage, though. Treating an English fallback as
if it were translated creates duplicate indexable pages and inaccurate
language signals.

This contract separates the route locale from the language of the authored
content. It keeps every public route usable while allowing search engines to
index only the variants that have real localized copy.

## Contract precedence

For About, Apps, and Gallery, this specification supersedes older blanket
requirements in `static-runtime-boundaries.md` that described canonical,
`hreflang`, locale-fallback, and sitemap behavior as historically unchanged.
The runtime-boundary contract still requires CSS extraction and route-boundary
refactors to preserve the current SEO policy defined here. This precedence does
not change the SEO policy of any other route.

## Content ownership matrix

| Page | Authored content locales | Accessible fallback routes |
|---|---|---|
| About | `en`, `vi` | `fr`, `ja`, `ko`, `zh` render the English content |
| Apps | `en`, `vi` | `fr`, `ja`, `ko`, `zh` render the English content |
| Gallery | `en`, `vi`, `fr`, `ja`, `ko`, `zh` | None |

Apps keeps canonical English product names and descriptions inside the
otherwise localized Vietnamese showroom. That is intentional product copy,
not evidence that the Vietnamese route is an English fallback.

## Search identity

- An authored variant is indexable, self-canonical, present in the sitemap,
  and participates in a reciprocal `hreflang` cluster containing only authored
  variants plus an English `x-default`.
- A fallback About or Apps route remains directly accessible at its selected
  locale URL. It renders the English content, declares `lang="en"` at the page
  content boundary, emits `noindex, follow`, canonicalizes to the English
  route, and emits no `hreflang` or alternate Open Graph locale. The generic
  robots and Googlebot-specific directives must agree.
- Fallback routes are absent from sitemap locations and sitemap alternates.
  Their route URL does not redirect, so navigation and locale preference stay
  stable for the visitor.
- Each route uses one natural title and description across the document meta,
  Open Graph, Twitter, and the route-owned JSON-LD object. Focused static pages
  clear the broad portfolio keyword metadata inherited from the locale layout.
- About emits `AboutPage`, Apps emits `ItemList`, and Gallery emits
  `ImageGallery`. Their `@id`, `url`, `name`, `description`, and `inLanguage`
  match the resolved search identity. The Apps `ItemList` also keeps its own
  description.

The source policy lives in
`src/lib/seo/static-page-localization.ts`. The export verifier mirrors it in
`config/static-artifact-budgets.json`; a focused test requires both definitions
to remain equal.

## Performance boundary

Gallery keeps the first WAT spotlight image as the desktop visual candidate.
Only that exact image may receive a preload, and the preload must use
`media="(min-width: 641px)"`. The other spotlight images stay lazy with low
fetch priority. The optimization is retained only when a cold-browser check
shows one matching desktop request, no duplicate or unused-preload warning,
and a text LCP on mobile without a mobile preload. Gallery is also a page-level
phone target in the CrUX field-data monitor; missing field data remains
`unknown`, not healthy.

## Non-goals

- This change does not machine-translate About or Apps.
- It does not change locale selection, public route paths, analytics events,
  visible Gallery content, or the shared social-image raster.
- It does not claim that a configured CrUX target already has enough real-user
  traffic to return a page-level sample.

## Acceptance criteria

- **AC-SPS-001:** About and Apps have authored, indexable `en` and `vi`
  variants with self-canonicals and an `en`/`vi`/`x-default` language cluster.
- **AC-SPS-002:** The `fr`, `ja`, `ko`, and `zh` About and Apps routes remain
  accessible, render English content, declare an English content boundary,
  emit matching generic and Googlebot `noindex, follow` directives, and
  canonicalize to the English route.
- **AC-SPS-003:** No fallback About or Apps URL appears in a sitemap location,
  HTML `hreflang`, sitemap alternate, or alternate Open Graph locale.
- **AC-SPS-004:** Gallery has real localized metadata and visible copy for all
  six locales. Every catalog owns the complete 71-leaf visible Gallery message
  shape; every variant is indexable, self-canonical, and belongs to the
  complete six-locale plus `x-default` cluster.
- **AC-SPS-005:** Document title, meta description, Open Graph title and
  description, Twitter title and description, and route-owned JSON-LD name and
  description are byte-for-byte equal for each of the 18 route URLs.
- **AC-SPS-006:** About, Apps, and Gallery JSON-LD use the resolved canonical
  identity and content language; Apps includes an `ItemList` description.
- **AC-SPS-007:** The three focused static pages emit no `meta keywords`,
  including an empty tag or inherited layout keywords.
- **AC-SPS-008:** The artifact verifier checks the emitted HTML and sitemap for
  all 18 URLs and rejects identity, robots, language, parity, keyword,
  `hreflang`, or sitemap-policy drift.
- **AC-SPS-009:** The runtime and artifact policy definitions stay equal under
  a source test, and every modified spec keeps its existing acceptance labels
  as an unchanged prefix.
- **AC-SPS-010:** Existing About, Apps, and Gallery analytics events and the
  visitor's selected route locale remain unchanged.
- **AC-SPS-011:** Gallery preloads only the first WAT spotlight on desktop,
  leaves the other two images lazy and low priority, and is reverted if cold
  desktop/mobile evidence shows duplicate, unused, or mobile LCP regression.
- **AC-SPS-012:** Gallery is present exactly once in the configured page-level
  phone CrUX targets; unavailable field data remains explicitly unknown.

## Verification

- Source tests validate message ownership, the content matrix, policy/config
  parity, metadata construction, sitemap membership, CrUX configuration, and
  append-only acceptance labels.
- Artifact fixtures cover all 18 URL combinations and mutation cases for
  indexing, content language, keywords, metadata parity, `hreflang`, and
  sitemap leakage.
- A fresh Node 22 static export is checked by the artifact, performance,
  runtime, pagination, and offline gates before browser-level desktop/mobile
  verification.
