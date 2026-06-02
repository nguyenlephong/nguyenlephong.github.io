# Session: Ways of Working series

## Objective
Rename blog category `agile` → broader identity and add a 4-part series on how software teams
collaborate across company types (big corp / startup / outsourcing).

## Current State (DONE)
- **Category renamed + reslugged** `agile` → `ways-of-working` (URL changed per user request):
  - EN title "Ways of Working", VI title "Cách làm việc"; tagline + description rewritten to cover
    Agile/Scrum + -Driven Dev + collaboration across company types. accent `light`, order 5.
  - Updated `category` field in both `_index.json` files and in the 2 migrated post files (EN+VI):
    `agile-scrum-in-practice`, `tdd-bdd-ddd-driven-development`.
  - Category slug is data-driven (`src/lib/blog/data.ts listCategorySlugs()`), no hardcoded `"agile"`
    in `src/`. Old `/blog/agile/...` URLs intentionally dropped (static github.io export).
- **New series `ways-of-working` (4 bilingual posts, EN+VI), seriesOrder 1–4:**
  1. `how-teams-work-big-corp-startup-outsourcing` — flagship comparison (featured: true)
  2. `working-in-a-big-corp`
  3. `working-in-a-startup`
  4. `working-in-outsourcing-software-services`
  - All registered at TOP of `posts[]` in both indexes (newest). Cross-linked within series +
    to `agile-scrum-in-practice` and culture `how-to-write-a-great-pull-request`.
- **Verified:** all JSON valid, EN/VI parity (28 posts each), no dangling internal links,
  `next build --turbopack` green — all 6 ways-of-working pages generated in en/vi, old `agile`
  route gone, sitemap has ways-of-working URLs and 0 `/blog/agile/`.

## Decisions
- Keep slug `ways-of-working` (user chose; matches title).
- Series = 4 NEW posts only; the 2 migrated posts stay in the category but are NOT in the series.
- Format matches existing posts: `blog-callout` (note/tip/warn), `blog-table-wrap`,
  `blog-takeaways`, 5 FAQs each, voice = practical "field guide".

## Constraints
- Bilingual: every post needs EN (`public/blog-data/posts/`) + VI (`public/blog-data/vi/posts/`).
- Internal links: `href="/blog/<category>/<slug>"` (no locale prefix).
- Index entries are inserted via Python load/dump (round-trip is byte-identical → clean diffs).

## Next Steps
- Optional: commit (branch `dev`). Commit msg suggestion:
  `feat(blog): rename category to Ways of Working + add company-types series (big corp/startup/outsourcing) — en+vi`
- Nothing else outstanding; series complete.
