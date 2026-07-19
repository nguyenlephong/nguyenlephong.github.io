# Authored content static export

## What

Generate blog and note article routes only for locales that contain authored
content. A locale switch from an article keeps the article path when that
translation exists; otherwise it opens the translated collection page instead
of constructing a non-canonical article URL.

The postbuild step also removes `out/og-cache`, which is an input cache for OG
generation rather than a deployable asset. The unused `public/assets/full-bg.svg`
asset is removed from the source and offline manifest policy.

The canonical JSON corpus now lives under the repository-only `content/`
directory. Next.js server modules and build scripts read it from disk and emit
only the public contracts used by readers: static HTML/RSC, generated search
indexes, sitemap entries, and declared OG media.

## Why

The previous route generator emitted every article for every configured locale.
That produced 1,272 fallback pages without authored translations, adding 14,728
files and about 313.6 MiB to the static artifact. These pages were intentionally
absent from the sitemap, so keeping them as successful public URLs increased
deployment cost without adding indexable content.

The compatibility audit found no browser reader for the historical
`/blog-data`, `/notes-data`, or `/thoughts-data` URLs. The only readers are the
filesystem loaders under `src/lib/{blog,notes,thoughts}`, content/schema tests,
OG generators, and authoring scripts. Browser search uses the generated
`/search/blog.json` and `/search/notes.json` endpoints. Moving 848 source files
(10,163,237 bytes, 9.692 MiB) out of `public/` removes them from every static
export without changing those public reader contracts.

Article OG publication is a separate cross-repository boundary. The publisher
may prune only `.jpg` files under the exact managed `icdn/og/blogs` and
`icdn/og/notes` namespaces when the slug is still present in the source index
but is not published for `CONTENT_BUILD_DATE`. Unknown names and extensions are
unowned and must remain untouched.

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
10. No raw corpus directory, raw-corpus browser URL, or unpublished article
    metadata/route may be present in `out/`.
11. Generated search JSON, HTML/RSC, sitemap, and article OG URL behavior remain
    available after the source move.
12. OG stale-asset pruning is opt-in, reports exact candidates and the previous
    `dom-pub` HEAD, enforces count and percentage caps, and rolls the complete
    local tree back after a partial failure.
13. A future asset pruned today is generated and publishable again when its
    release date becomes current.
14. Blog and Notes slugs are globally unique across published, scheduled, and
    draft canonical entries. Localized indexes may only reuse slugs from their
    own canonical surface, and the build fails before Next.js starts otherwise.

## OG prune operation

Inventory first against a clean local `dom-pub` checkout:

```bash
CONTENT_BUILD_DATE=2026-07-19 node scripts/publish-og-assets.mjs \
  --surface blog --dom-pub ../dom-pub --missing-only --prune-stale --dry-run
```

Apply only after reviewing every reported key:

```bash
CONTENT_BUILD_DATE=2026-07-19 node scripts/publish-og-assets.mjs \
  --surface blog --dom-pub ../dom-pub --missing-only --prune-stale --apply-prune
```

The operation mutates the clean local checkout transactionally but does not
commit, push, or update the remote `dom-pub` ref. The site deployment workflow
has read-only contents permission and no cross-repository credential, so an
operator must review the resulting diff, commit it in `dom-pub`, and push it
separately. The reported previous HEAD is the rollback evidence for that review.

## Non-goals

- Automatically committing or pushing changes to `dom-pub`.
- Deleting unknown/manual media or removed-content assets that cannot be proven
  to belong to the current managed source index.
- Enabling experimental Next.js prefetch or segment-output behavior.
- Changing sitemap coverage for authored content.
