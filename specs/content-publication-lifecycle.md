# Static content publication lifecycle

## Context

Blog and note source files can be authored before their release date. Static
export previously treated every indexed entry as public, so five blog posts
dated after the build day were emitted as article routes and leaked into
collections, search indexes, related content, and the sitemap.

## Decision

- One build-wide UTC `CONTENT_BUILD_DATE` controls publication visibility.
  The build wrapper validates an explicit value or resolves the UTC date once,
  then injects that exact value into both the Next build and postbuild child.
- Existing content requires no migration: a missing `status` means published,
  and `date` is its release date.
- `status: "draft"` always prevents publication.
- Optional date-only `publishAt` delays a backdated article. The later of
  `date` and `publishAt` is the effective release boundary, so content can
  never be public before its displayed publication date.
- The same predicate gates collection data, pagination, topic/series context,
  article loading, static params, locale availability, search indexes,
  related content, sitemap entries, source OG generation, and the expected OG
  publication manifest.
- Locale indexes and bodies may translate presentation fields, but cannot
  override canonical `date`, `publishAt`, or `status` values.
- GitHub Pages resolves one UTC build date and rebuilds daily so scheduled
  static content becomes public without a source commit.
- Sitemap verification uses exact bidirectional parity with exported,
  indexable, self-canonical HTML instead of a fixed URL-count floor. Scheduled
  or draft content therefore cannot be retained merely to satisfy a budget.

The OG publisher intentionally remains add/replace-only. An unpublished entry
is neither generated nor expected, but a stale file already present in
`dom-pub` is not deleted automatically. Safe pruning needs an explicit remote
inventory, namespace allowlist, approval boundary, and rollback contract; the
current publisher has none of those delete guarantees.

The authored JSON corpus remains a build input. Moving it out of `public/` is
deferred to the artifact-boundary phase of this optimization PR and must retain
regression coverage proving unpublished metadata is absent from the deployed
artifact.

## Acceptance criteria

- **AC-CPL-001:** A content item is visible on its effective release date and
  not before it, using one deterministic UTC date for the complete build.
- **AC-CPL-002:** Draft items are absent regardless of `date` or `publishAt`.
- **AC-CPL-003:** Unpublished items have no static route, locale cluster,
  collection/search/related entry, or sitemap location; direct loading returns
  no article.
- **AC-CPL-004:** Existing source files without lifecycle fields retain their
  behavior except that future dates are scheduled rather than exposed early.
- **AC-CPL-005:** Invalid lifecycle values and invalid `CONTENT_BUILD_DATE`
  values fail closed with a clear validation error.
- **AC-CPL-006:** Sitemap entries and exported indexable self-canonical pages
  have exact parity without a fixed minimum URL count.
- **AC-CPL-007:** The Pages workflow runs daily and exports against one resolved
  `CONTENT_BUILD_DATE` before quality, build, and verification steps.
- **AC-CPL-008:** Future, embargoed, and draft entries have no generated or
  expected OG publication, while publication tooling never deletes an existing
  remote asset implicitly.
- **AC-CPL-009:** Localized indexes and bodies fail closed if they attempt to
  change canonical publication lifecycle fields.

## Verification

- Unit-test publication, embargo, draft, and invalid-date boundaries.
- Pin a regression build to 2026-07-18 and prove the five posts dated
  2026-07-19 through 2026-07-23 remain in the dynamically derived unpublished
  corpus and are absent from every public consumer and generated OG target.
- Exercise add/replace publication against an existing stale future asset and
  prove the summary remains `deleted: 0` and the bytes remain unchanged.
- Inject valid-but-conflicting locale `date`, `publishAt`, and `status` values
  in both indexes and bodies and prove the loaders reject the override drift.
- Run schema, authored-route, deployment-workflow, and artifact-verifier tests.
- Run type-check, strict lint, and a production static export with
  `CONTENT_BUILD_DATE=2026-07-18`.
