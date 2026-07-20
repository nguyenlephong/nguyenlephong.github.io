# Curated content hubs

## Context

The Blog and Notes archives already make every published article reachable,
but their broad filters do not provide a stable editorial path for readers who
want to follow one subject. Curated hubs add small, indexable collections on
top of the existing static corpus. They do not add a CMS, runtime search
service, database, or backend dependency.

This specification is pinned to `CONTENT_BUILD_DATE=2026-07-19`. Counts in this
document describe that reproducible publication snapshot. Later content can
legitimately change page and sitemap totals, but the catalog decision and the
verification snapshot must be updated together.

## Decision

- Publish seven Blog series and six Notes topic hubs from explicit ordered
  catalogs in the canonical indexes.
- Generate hubs only for English and Vietnamese. Other supported UI locales
  keep their existing archive and content-fallback behavior, but do not export
  curated hub routes.
- Keep the shared page size at nine cards. Page one uses the hub root; there is
  no successful or canonical `/page/1` alias.
- Keep grouping, ordering, pagination, metadata, and JSON-LD in the static
  server path. The browser receives the current nine-card slice and a small
  delegated analytics boundary, not the full corpus or a search index.
- Treat catalog membership as an editorial decision. A topic or series is not
  promoted merely because enough content happens to use the same label.

## Route contract

The exact public route shapes are:

```text
/{en|vi}/blog/series/{series}
/{en|vi}/blog/series/{series}/page/{page}
/{en|vi}/notes/topics/{topic}
/{en|vi}/notes/topics/{topic}/page/{page}
```

`{page}` is a positive integer greater than one. Page one resolves only at the
root route. Invalid values, `/page/1`, unknown catalog IDs, and page numbers
beyond the collection total return not found. Reserved route segments prevent
authored categories, series, topics, or article slugs from shadowing static
routes such as `page`, `series`, `topics`, and `opengraph-image`.

## Fixed-date catalogs and route count

### Blog series

| ID                          | English title                        |        Authored posts EN / VI | Pages EN / VI | EN/VI URLs |
| --------------------------- | ------------------------------------ | ----------------------------: | ------------: | ---------: |
| `foundations`               | Foundations of Software Architecture |                       15 / 15 |         2 / 2 |          4 |
| `ways-of-working`           | Ways of Working                      |                         4 / 4 |         1 / 1 |          2 |
| `ai-in-practice`            | AI in Practice                       |                         4 / 5 |         1 / 1 |          2 |
| `kind-engineering`          | Kind & Effective Engineering         |                         5 / 5 |         1 / 1 |          2 |
| `lean-business-analysis`    | Lean Business Analysis               |                         4 / 4 |         1 / 1 |          2 |
| `data-eos-operating-system` | Data in the EOS Operating System     |                         4 / 4 |         1 / 1 |          2 |
| `leadership-and-management` | Leadership and Management            |                         5 / 5 |         1 / 1 |          2 |
| **Total**                   |                                      | **41 / 42 authored variants** |     **8 / 8** |     **16** |

Series membership is explicit on each post. `seriesOrder` is a contiguous,
one-based editorial order within that series; it is not derived from file
order or publication date.

### Notes topic hubs

| Topic       | English title              |     Published notes | Pages per locale | EN/VI URLs |
| ----------- | -------------------------- | ------------------: | ---------------: | ---------: |
| `mua-nha`   | Home Buying                |                  12 |                2 |          4 |
| `tiet-kiem` | Personal Finance & Saving  |                  11 |                2 |          4 |
| `su-nghiep` | Career & Growth            |                  18 |                2 |          4 |
| `sach`      | Book Notes                 |                  19 |                3 |          6 |
| `goc-nhin`  | Perspectives & Reflections |                  33 |                4 |          8 |
| `thoughts`  | Thought Garden             |                  40 |                5 |         10 |
| **Total**   |                            | **133 memberships** |           **18** |     **36** |

`mua-xe` remains an ordinary Notes filter topic and has no curated hub route.
Its single note is not enough to make it an editorial landing page, and it is
deliberately absent from the exact hub catalog. Adding it later requires an
explicit catalog, copy, route-count, sitemap, and monitoring decision.

Together, the catalogs produce 26 pages per locale: 8 Blog pages and 18 Notes
pages. Across English and Vietnamese, that is 16 Blog URLs plus 36 Notes URLs,
or exactly **52 new URLs**. The pre-hub snapshot contained 896 sitemap URLs,
but one English URL incorrectly claimed an article whose only authored body is
Vietnamese. Removing that invalid indexable variant leaves a valid baseline of
895 URLs. The static-page localization contract also removes eight un-authored
About and Apps fallback variants from the sitemap, leaving 887 canonical
pre-hub URLs. The fixed-date target is therefore exactly **939 unique sitemap
URLs** at `CONTENT_BUILD_DATE=2026-07-19`.

## Pagination and navigation

- `CONTENT_PAGE_SIZE` remains 9 for archives and curated hubs.
- Every page renders at most nine cards and only the current slice.
- Root catalog links, article cards, previous/next links, and numbered page
  links are plain crawlable anchors in the static HTML.
- Numbered links use the root URL for page one and `/page/{page}` for later
  pages.
- `ItemList.position` and analytics card positions are global within the hub:
  the first card on page two is position 10, not position 1.
- Blog series follow their explicit `seriesOrder`. Notes hubs preserve the
  canonical Notes ordering used by their data loader.

## Locale and SEO behavior

- Only `en` and `vi` static params are emitted for curated hubs.
- Each hub page has a self-referencing canonical URL, index/follow robots
  metadata, localized title and description, and OpenGraph locale metadata.
- Hreflang clusters contain only locales that export that exact page, plus
  `x-default`. English is preferred when that page exists in English;
  otherwise `x-default` points to Vietnamese. This prevents a later EN/VI
  content-count difference from creating an alternate to a missing page.
- Open Graph and Twitter metadata use the existing root social image. The hub
  routes do not create another image artifact family.
- Each page emits `CollectionPage` with a page-local `ItemList` and global list
  positions, plus a `BreadcrumbList` back to the Blog or Notes archive.
- Blog and Notes page-one catalogs provide static inlinks to every promoted
  hub. Hub cards provide static inlinks to their articles.
- The sitemap contains every exported, indexable, self-canonical hub page and
  no `/page/1` or `mua-xe` hub entry. Existing bidirectional sitemap-to-HTML
  parity remains the deployment gate.

The count of 939 is a fixed-date regression assertion, not a permanent global
SEO floor. Publication lifecycle changes must still be evaluated through exact
artifact parity rather than by forcing an outdated total.

## Authored-locale correction and legacy route

`ai-ideas-bloom-inside-everyday-work` was introduced by a commit described as a
Vietnamese article. Its canonical and Vietnamese title, summary, and body are
the same Vietnamese content; no authored English source exists. Its locale
contract is therefore `vi` only.

The former English URL remains as one exact compatibility artifact so existing
links do not end at a generic 404. It is not an English article: it is
`noindex`, canonicalizes and immediately meta-refreshes to the Vietnamese URL,
renders only the localized availability notice and link, marks the Vietnamese
article title with `lang="vi"`, emits no Article
JSON-LD, and stays out of the sitemap and hreflang cluster. The artifact
verifier accepts this behavior only for an explicitly marked locale redirect
whose refresh target equals its canonical URL.

## Editorial metadata

Blog and Notes entries may use these optional fields:

| Field            | Contract                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `contentMode`    | Closed vocabulary: `technical`, `reflective`, `book-reflection`, or `decision-guide`.                |
| `seoTitle`       | Search-specific title. It does not replace the visible article `title`.                              |
| `seoDescription` | Search-specific description. It does not replace the visible card/article `summary`.                 |
| `reviewedAt`     | Date on which accuracy was reviewed. It emits `WebPage.lastReviewed` and is never an edit timestamp. |

`updated` remains the only source for article `dateModified`. `reviewedAt` must
never be copied into `dateModified`. Optional editorial fields are applied only
after individual review; they must not be mass-assigned merely to satisfy a
schema or create a freshness signal.

## Notes author correction

The canonical Notes index and body files now agree on an explicit author for
24 previously authorless notes:

1. `mua-xe-lan-dau-chi-phi-va-quyet-dinh`
2. `lam-chu-su-nghiep-bien-cong-viec-thanh-be-phong`
3. `lap-ngan-sach-lam-chu-dong-tien`
4. `quy-khan-cap-tu-a-den-z`
5. `thoat-no-thong-minh`
6. `dau-tu-cho-nguoi-moi-bat-dau`
7. `lam-phat-va-suc-mua`
8. `bao-hiem-dung-va-du`
9. `tranh-bay-lua-dao-dau-tu`
10. `tai-chinh-theo-do-tuoi`
11. `tien-bac-trong-gia-dinh`
12. `thinh-vuong-tai-chinh-de-tien-lam-viec-cho-ban`
13. `giu-tien-trong-tui-cach-de-giau`
14. `vay-ngan-hang-mua-nha-don-bay-thong-minh`
15. `dinh-gia-va-thuong-luong-gia-mua-nha`
16. `chon-vi-tri-va-quy-hoach-khi-mua-nha`
17. `quy-trinh-mua-nha-tu-a-den-z`
18. `chung-cu-vs-nha-dat-va-mua-nha-du-an`
19. `doc-ban-ve-thiet-ke-nha-danh-gia-chat-luong`
20. `tam-ly-mua-nha-tranh-bay-nguoi-ban`
21. `bay-mat-tien-khi-mua-nha-cac-kich-ban-can-tranh`
22. `phap-ly-bat-dong-san-nhung-dieu-can-biet`
23. `phong-thuy-mua-nha-tieu-chi-can-biet`
24. `mua-nha-nhung-dieu-can-biet`

One slug remains intentionally unresolved:
`chi-phi-mua-nha-toan-bo-nhung-khoan-can-biet`. Its author must not be inferred
from adjacent files, topic membership, or site ownership. The exact unresolved
list is a quality gate: any new authorless note must be an explicit editorial
decision.

## Analytics contract

The static links remain usable without JavaScript. When analytics is available,
the delegated hub tracker emits:

- `content_hub_view` with hub kind, stable hub ID, current page, content
  surface, and total pages;
- `content_hub_click` from a Blog or Notes root catalog or a curated article
  hierarchy link, with a stable source and destination pathname;
- `content_hub_archive_click` from a hub breadcrumb back to its parent archive;
- `content_hub_article_click` with stable content slug and global position;
- `content_hub_page_change` with current and destination page.

Existing dashboard-compatible events remain alongside the new taxonomy:
article clicks also emit `blog_card_click` or `notes_card_click`, and pagination
also emits `explorer_page_change`. Tracking must continue to respect Do Not
Track and the central property sanitizer.

## Performance and operational boundaries

- Hub data is read from repository JSON during static generation. There is no
  runtime Firebase, R2, CMS, or API dependency.
- Hub pages do not mount the interactive Explorer, fetch a search index, or
  serialize the Blog/Notes client message scopes. They retain only the shared
  `site` scope plus the small analytics boundary.
- Route-asset regression samples include the most nested Blog and Notes hub
  pages: `en/blog/series/foundations/page/2.html` and
  `vi/notes/topics/thoughts/page/5.html`.
- The 52-route expansion is measured against the existing file, byte, route
  asset, RSC, secret-scan, and exact sitemap gates. It does not relax any
  performance budget.
- Search Console URL Inspection canaries observe those two nested routes. They
  are not page-level CrUX targets yet; those targets should be added only after
  enough real traffic makes the signal useful. Any later missing page-level
  CrUX data must remain `unknown`, not a passing performance result.

## Acceptance criteria

- **AC-CCH-001:** The exact ordered catalogs contain seven Blog series and six
  Notes hubs, with no `mua-xe` hub.
- **AC-CCH-002:** Only English and Vietnamese hub static params are generated;
  each page's hreflang cluster contains only its exported locale variants and
  `x-default`, which always resolves to an exported page.
- **AC-CCH-003:** Page one uses the root route. `/page/1`, invalid pages,
  unknown IDs, and pages beyond the total return not found.
- **AC-CCH-004:** Every page contains at most nine cards and uses global
  one-based card and `ItemList` positions.
- **AC-CCH-005:** Catalog, article, and pagination links are crawlable static
  anchors, and every promoted hub is linked from its parent archive.
- **AC-CCH-006:** Each hub page is self-canonical and emits localized metadata,
  the existing root Open Graph/Twitter image, and `CollectionPage`, `ItemList`,
  and `BreadcrumbList` structured data.
- **AC-CCH-007:** At `CONTENT_BUILD_DATE=2026-07-19`, the catalogs add exactly
  52 hub URLs and the sitemap contains exactly 939 unique URLs: 887 canonical
  pre-hub URLs plus the new hubs.
- **AC-CCH-008:** The sitemap contains no curated `/page/1`, unsupported-locale,
  or `notes/topics/mua-xe` URL and remains in exact parity with exported
  indexable self-canonical HTML.
- **AC-CCH-009:** Editorial metadata is optional and schema-validated;
  `seoTitle` and `seoDescription` do not change visible copy.
- **AC-CCH-010:** `reviewedAt` emits `WebPage.lastReviewed`; only `updated` may
  emit article `dateModified`.
- **AC-CCH-011:** The 24 corrected Notes authors match between canonical index
  and body, while the one exact unresolved slug remains authorless.
- **AC-CCH-012:** Hub interactions emit stable hub/page/position, source, and
  destination context while preserving the existing card and pagination event
  names.
- **AC-CCH-013:** Hub pages remain static-first and do not import Explorer,
  search-index, Firebase, or another runtime content service.
- **AC-CCH-014:** Nested Blog and Notes hub artifacts stay within existing
  route-asset and runtime budgets; adding the routes does not raise a ceiling.
- **AC-CCH-015:** Search Console inspection includes one nested Blog hub and one
  nested Notes hub. Page-level CrUX targets remain deferred until traffic can
  support them, and unavailable field data is never treated as healthy.
- **AC-CCH-016:** The Vietnamese-only AI article has no indexable English
  variant. Its one legacy English route is `noindex`, canonical/meta-refreshes
  to Vietnamese, contains no article body or Article JSON-LD, and is absent
  from sitemap and hreflang output.

## Verification

Use the fixed date for the reproducible route and sitemap assertions:

```bash
CONTENT_BUILD_DATE=2026-07-19 npm test
CONTENT_BUILD_DATE=2026-07-19 npm run build
npm run verify:pagination
npm run verify:artifact
npm run verify:performance-artifact
npm run verify:runtime-boundaries
npm run typecheck
npm run lint
```

The focused hub tests must pin catalog order, content counts, EN/VI static
params, reserved-route validation, author parity, optional metadata semantics,
and the 52/939 fixed-date sitemap result. Artifact verification remains the
source of truth for emitted canonicals, language alternates, JSON-LD, inlinks,
route assets, public-secret scanning, and client-message scope.
