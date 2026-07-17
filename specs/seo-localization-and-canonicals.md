# SEO localization and canonical article contract

## Context

The site publishes blog posts and notes as static HTML under locale-prefixed
URLs. A locale route may exist before the article body has been translated.
Rendering the full default-language article at every locale URL creates
duplicate payloads and gives search engines conflicting language signals.

This contract follows Google Search guidance for
[localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions),
[multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites),
[canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
and [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).

## Decision

- The canonical blog and notes indexes explicitly declare the locales that
  contain a real article body for each entry.
- A real localized article is self-canonical and participates in one complete,
  reciprocal `hreflang` cluster. `x-default` points to the default content
  locale, or the first declared content locale when the site default is absent.
- Locale-prefixed URLs remain stable even before a translation exists. Those
  URLs render a small localized availability notice and links to real variants;
  they do not render or serialize the fallback article body.
- A fallback URL points `rel=canonical` to the preferred real variant. It is
  omitted from the sitemap and `hreflang` cluster. It is not marked `noindex`;
  the canonical is the consolidation signal.
- Article JSON-LD is emitted only beside the visible full article. It describes
  that localized body and only includes author, modification date, image, and
  other optional properties when the source data provides them.
- The sitemap contains canonical, real-content URLs only. Its locale alternates
  mirror the HTML `hreflang` cluster, and `lastmod` comes from source dates.

## Non-goals

- This change does not redesign list/explorer pages or their pagination.
- This change does not create machine translations or infer missing editorial
  metadata.
- This change does not change article slugs or remove existing locale routes.

## Acceptance criteria

- **AC-SEO-LOC-001:** Every canonical blog and notes index entry declares a
  non-empty, supported, unique `locales` list that matches its authored files.
- **AC-SEO-LOC-002:** Every real localized article has a self-canonical URL and
  the same reciprocal alternates for all and only its real variants, including
  a valid `x-default`.
- **AC-SEO-LOC-003:** An untranslated locale route remains available but renders
  only a localized availability notice and links to real variants. It has no
  Article JSON-LD, no fallback article body, and no `noindex` directive.
- **AC-SEO-LOC-004:** Fallback article URLs are absent from sitemap locations and
  language alternates. Canonical article URLs have source-derived `lastmod`.
- **AC-SEO-LOC-005:** Article JSON-LD matches the visible variant's canonical
  URL and language, uses `mainEntityOfPage`, and includes only source-backed
  author, dates, images, and optional metadata.
- **AC-SEO-LOC-006:** Artifact verification rejects broken article canonicals,
  non-reciprocal alternates, fallback Article schema, or sitemap leakage.
- **AC-SEO-LOC-007:** Selecting an available language from a fallback notice is
  tracked without making analytics a navigation dependency.
- **AC-SEO-LOC-008:** Every authored locale index and article override is
  validated with a strict partial schema before it is merged into canonical
  data.
- **AC-SEO-LOC-009:** Future source dates remain authored data but are omitted
  from sitemap freshness signals until they are no longer in the future.
- **AC-SEO-LOC-010:** The origin-level `WebSite` entity is emitted once at the
  root URL. Localized visible homes retain their `Person` and `ProfilePage`
  entities and share a complete home `hreflang` cluster including `x-default`.

## Verification

- Data-contract tests compare declared locale availability with authored files.
- Focused tests cover a fully translated blog post, a partially translated blog
  post, a translated note pair, and an untranslated note locale route.
- The production export is checked for canonical, `hreflang`, sitemap, and
  Article JSON-LD parity.
