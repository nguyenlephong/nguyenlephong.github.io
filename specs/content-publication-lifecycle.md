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
  related content, sitemap entries, source OG generation, and the released OG
  publication manifest. The publication inventory additionally classifies
  non-draft future entries as `scheduled` and canonical `status: "draft"`
  entries as `prunable`.
- Locale indexes and bodies may translate presentation fields, but cannot
  override canonical `date`, `publishAt`, or `status` values.
- GitHub Pages resolves one UTC build date and rebuilds daily so scheduled
  static content becomes public without a source commit. PR CI and Pages both
  verify the public CDN responses for released plus scheduled OG assets before
  building; the post-build live check remains released-only.
- Sitemap verification uses exact bidirectional parity with exported,
  indexable, self-canonical HTML instead of a fixed URL-count floor. Scheduled
  or draft content therefore cannot be retained merely to satisfy a budget.

The OG publisher is add/replace-only by default. Deletion is a separate,
transactional local operation that requires both `--prune-stale` and
`--apply-prune`; dry-run inventory remains available without mutation. It may
delete only a `.jpg` whose canonical source-index entry explicitly has
`status: "draft"`. Scheduled entries are reservations and are never prune
candidates. Unknown names, removed-source names, other extensions, and manual
media remain unowned. Count/percentage caps, a clean pinned `dom-pub` HEAD,
quarantine, and rollback protect partial failure. The tool never commits or
pushes.

Readiness intentionally trades embargo strength for deterministic release:
the scheduled JPEG must already exist at its public, guessable CDN URL, even
though no article route, collection entry, search record, sitemap URL, or
metadata link exists before release. Authors can generate the ignored local
PNG source against the effective future date, publish the JPEG through the
reviewed cross-repository flow, and then open the content PR. The CI and Pages
checks request bytes zero through three from the public media URL. In the
supported Node 22+ runtime they use a BYOB reader to retain and inspect at most
four decoded body bytes, then cancel the stream. This does not guarantee that
only four bytes cross the network when a CDN ignores `Range` and returns
`200`; socket or Undici buffers may receive more before cancellation. A
declared `200` `Content-Length` must be a safe integer no larger than 5 MiB,
while an absent length remains compatible with chunked CDN responses. They
receive no cross-repository write credential. A missing reservation, redirect,
non-BYOB body, invalid MIME type, invalid JPEG signature, or exhausted retry
fails before the expensive static build. After build, the released-only live check
repeats the same fail-closed validation before artifact upload. Remote-tree
mode remains an operator inventory aid; it is not release-readiness evidence
because a repository entry does not prove the deployed public response.

The canonical authored JSON corpus already lives under repository-only
`content/`. It remains a build input, with regression coverage proving raw or
unpublished metadata is absent from the deployed artifact.

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
- **AC-CPL-008:** **Superseded by AC-CPL-011 and AC-CPL-012.** Future, embargoed,
  and draft entries have no generated or expected OG publication, while
  publication tooling never deletes an existing remote asset implicitly.
- **AC-CPL-009:** Localized indexes and bodies fail closed if they attempt to
  change canonical publication lifecycle fields.
- **AC-CPL-010:** PR CI and Pages fail before build when the public live response
  for a released or scheduled reservation is missing, redirected, mistyped, or
  not a JPEG; the Pages live check runs again after build against released
  entries only.
- **AC-CPL-011:** Future and embargoed entries have no article route or linked
  OG metadata before release, but their publicly reachable JPEG reservations
  are required by pre-build live readiness.
- **AC-CPL-012:** Draft entries are excluded from readiness and are the only
  canonical entries eligible for explicit, transactional pruning. No remote
  asset is deleted implicitly.

## Verification

- Unit-test publication, embargo, draft, and invalid-date boundaries.
- Pin a regression build to 2026-07-18 and prove the five posts dated
  2026-07-19 through 2026-07-23 remain in the dynamically derived unpublished
  corpus and are absent from every public consumer while appearing in the
  scheduled live-readiness inventory.
- Exercise explicit pruning against published, scheduled, draft, unknown, and
  manual assets; prove only canonical drafts are candidates and rollback
  restores the complete managed tree after partial failure.
- Inject valid-but-conflicting locale `date`, `publishAt`, and `status` values
  in both indexes and bodies and prove the loaders reject the override drift.
- Run schema, authored-route, deployment-workflow, and artifact-verifier tests.
- Run type-check, strict lint, and a production static export with
  `CONTENT_BUILD_DATE=2026-07-18`.
