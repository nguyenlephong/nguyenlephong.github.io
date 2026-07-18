# Authored content static export

## What

Generate blog and note article routes only for locales that contain authored
content. A locale switch from an article keeps the article path when that
translation exists; otherwise it opens the translated collection page instead
of constructing a non-canonical article URL.

The postbuild step also removes `out/og-cache`, which is an input cache for OG
generation rather than a deployable asset. The unused `public/assets/full-bg.svg`
asset is removed from the source and offline manifest policy.

## Why

The previous route generator emitted every article for every configured locale.
That produced 1,272 fallback pages without authored translations, adding 14,728
files and about 313.6 MiB to the static artifact. These pages were intentionally
absent from the sitemap, so keeping them as successful public URLs increased
deployment cost without adding indexable content.

The source `blog-data`, `notes-data`, and `thoughts-data` directories remain in
the deployed artifact for now. They are not needed by the current reader or
search runtime, but there is not enough evidence to rule out external consumers
of those historically public URLs.

## Acceptance criteria

1. Blog and note static params equal their declared authored locale sets.
2. No untranslated article URL is generated or included in the sitemap.
3. Canonical and `hreflang` metadata continue to include authored variants only.
4. Selecting an authored locale keeps the current article URL.
5. Selecting an unavailable locale opens that locale's blog or notes collection.
6. The existing `locale_change` analytics event remains wired.
7. `out/og-cache` is removed before the offline manifest and deployment artifact
   are finalized.
8. The artifact verifier and pagination/offline checks pass on a production
   export.
9. CI warns at 75% of the rebased 20,000-file/600 MiB budget and fails before
   the artifact can return to its previous size.

## Non-goals

- Removing the public content-data directories without a compatibility audit.
- Enabling experimental Next.js prefetch or segment-output behavior.
- Changing sitemap coverage for authored content.
