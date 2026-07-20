# Authored content static export

## What

Generate blog and note article routes only for locales that contain authored
content. A locale switch from an article keeps the article path when that
translation exists; otherwise it opens the translated collection page instead
of constructing a non-canonical article URL.

One evidence-backed compatibility exception preserves the former English URL
for `ai-ideas-bloom-inside-everyday-work`, whose source and history show only a
Vietnamese article. The route is not part of the authored static-param set. It
is emitted through a separate exact allowlist as a `noindex` availability page
that canonical/meta-refreshes to the Vietnamese article, without serializing
the body or Article structured data.

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
and its canonical lifecycle state is explicitly `status: "draft"`. Scheduled
entries remain reserved even before `CONTENT_BUILD_DATE`; unknown names,
removed-source names, manual media, and other extensions are unowned and must
remain untouched.

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
13. **Superseded by AC 16 and AC 17.** A future asset pruned today is generated
    and publishable again when its release date becomes current.
14. Blog and Notes slugs are globally unique across published, scheduled, and
    draft canonical entries. Localized indexes may only reuse slugs from their
    own canonical surface, and the build fails before Next.js starts otherwise.
15. A compatibility locale route requires an exact allowlist entry, a published
    authored target, `noindex`, canonical and meta-refresh agreement, no Article
    JSON-LD, and exclusion from sitemap and hreflang output.
16. A scheduled asset must pass public live-response readiness before build and
    is never a prune candidate.
17. A canonical draft is the only lifecycle state eligible for explicit prune;
    after its lifecycle changes to released, it can be generated and published
    again through the normal reviewed flow.

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
has read-only contents permission and no cross-repository write credential, so
an operator must review the resulting diff, commit it in `dom-pub`, and push it
separately. The reported previous HEAD is the rollback evidence for that review.

Scheduled publication uses the opposite order: generate the ignored local PNG
source with `CONTENT_BUILD_DATE` set to the entry's effective release date,
publish and review its JPEG in `dom-pub`, then open or merge the site change.
Both PR CI and Pages run:

```bash
npm run verify:og-publication:live -- --include-scheduled
```

before the static build. This reservation makes the JPEG publicly reachable at
its guessable CDN key before the article is linked or exported. The trade-off is
intentional: it prevents the daily release build from failing after the content
date becomes current. The verifier requests bytes zero through three and uses
a BYOB reader in the supported Node 22+ runtime to retain and inspect no more
than four decoded body bytes before cancelling the stream. This is not a
four-byte network-transfer guarantee: when a CDN ignores `Range` and returns
`200`, additional bytes can reach the socket or Undici buffers before
cancellation. A declared `200` `Content-Length` must be a safe integer no larger
than 5 MiB; an absent length remains compatible with chunked CDN responses. It
receives no cross-repository write credential. Missing responses, redirects,
non-BYOB bodies, wrong MIME types, invalid JPEG signatures, timeouts, and
exhausted retries fail closed. The post-build live check omits
`--include-scheduled`, so
only released article assets must be publicly valid before Pages uploads the
artifact. Remote-tree mode remains available to an operator for repository
inventory, but it is not a CI or release-readiness gate.

## Non-goals

- Automatically committing or pushing changes to `dom-pub`.
- Deleting unknown/manual media or removed-content assets that cannot be proven
  to belong to the current managed source index.
- Enabling experimental Next.js prefetch or segment-output behavior.
- Changing sitemap coverage for authored content.
