# Session: Blog feature + first article (Ports & Adapters)

## Objective
Add a **Blog** menu to the personal site (Next.js 16 static export, next-intl, 6 locales:
en/vi/zh/ja/ko/fr). Blog supports **categories with their own landing pages**. First
category = "Source & Architecture"; first article = **Ports & Adapters (Hexagonal
Architecture)** — beginner-friendly, friendly+professional tone, SVG diagrams + comparison
tables, real examples by company size, fully SEO-ready, content in all 6 languages.

## Current State — DONE & build-verified (`npm run build` green, static export OK)
All 6 locales generate home/category/article HTML + per-level OG images; sitemap, hreflang,
JSON-LD (BlogPosting + BreadcrumbList + Blog/CollectionPage) all present; "Blog" link in header.

### Code (mirrors the existing `thoughts` feature pattern)
- `src/lib/blog/{types,data,seo}.ts` — data model + i18n merge-on-read; `seo.ts` re-exports
  generic helpers from `@/lib/thoughts/seo`.
- Routes: `src/app/[locale]/blog/page.tsx` (home), `/[category]/page.tsx` (landing),
  `/[category]/[slug]/page.tsx` (article). Each has `generateStaticParams` + `generateMetadata`
  + JSON-LD. Plus `opengraph-image.tsx` at all 3 levels (uses `@/app/_og/og-shell`).
- Components: `src/components/blog/{BlogContent,BlogToc,BlogPostCard,BlogCategoryCard}.tsx`.
  BlogContent = client, rewrites internal `/blog/*` links to `/{locale}/blog/*`. BlogToc =
  client, builds "On this page" from `h2[id]/h3[id]` + IntersectionObserver active-highlight.
- `src/app/[locale]/blog/blog.css` — cards, article typography, tables, callouts, SVG diagram
  primitives (`.dgm-*`), sticky TOC. Uses global tokens (--fg/--bg/--accent/etc.), light+dark.
- Wiring: `seo.config.ts` (PAGE_SEO.blog), `sitemap.ts` (/blog + categories + posts),
  `app.const.ts` (APP_ROUTE.BLOG), `AppHeader.tsx` (Blog nav link), all 6 `messages/*.json`
  (Nav.blog + Pages.blog.* incl. ICU readingTime/articleCount/backToCategory/writtenBy).

### Content — `public/blog-data/`
- Canonical EN: `_index.json` + `posts/ports-and-adapters.json` (html ~27KB, 3 inline SVG
  diagrams: hexagon overview, dependency-rule, primary/secondary flow; before/after TS code;
  company-size table; vs-layered table; when/when-not; mistakes; getting-started; takeaways).
- Per-locale overrides authored: `vi/`, `zh/`, `ja/`, `ko/`, `fr/` (each `_index.json` +
  `posts/ports-and-adapters.json`). Heading `id`s identical across all (TOC/anchors safe).

## Decisions
- URL shape: `/blog` → `/blog/[category]` → `/blog/[category]/[slug]` (topical SEO grouping).
- Content = HTML strings (same as thoughts), rendered via dangerouslySetInnerHTML.
- Category `architecture` accent = `ocean`.
- Article date 2026-05-29, readingMinutes 16.

## Known minor gap (low priority)
SVG **inner annotation `<text>`** labels: localized in en/vi/zh, but ja/ko/fr translators kept
them English (only translated the SVG `<title>` aria + the figcaption below). Figcaptions
explain everything in-language, so it reads fine — but to fully harmonize, re-translate the
`<text>` annotation lines ("DRIVING SIDE · calls us", "business rules, no vendors",
"● = a port…", "input port"/"output port", adapter labels) in ja/ko/fr post files.

## UPDATE — Series shipped (6 parts)
The architecture category is now a 6-part series **"foundations"** (series id), all 6
locales, build-green, pushed (commit a8d7475):
1. ports-and-adapters · 2. clean-vs-onion-vs-hexagonal · 3. dependency-injection-and-ioc
· 4. structuring-code-feature-vs-layer · 5. monolith-to-microservices ·
6. micro-frontends-when-why-and-cost.
- Series infra: `BlogPostMeta.series/seriesOrder`; `getSeriesContext()` in data.ts;
  article page shows "Part N of M" eyebrow + prev/next cards (`.blog-series-nav`);
  i18n keys partOf/nextUp/previously/seriesNames.foundations in all 6 messages files.
- Category list sorts by seriesOrder (bySeriesThenDate).
- EN authored canonical; vi/zh/ja/ko/fr translated by agents (heading ids identical
  across locales). SVG inner `<text>` labels: localized in en/vi/zh, English in
  ja/ko/fr (figcaption/title localized) — same known gap as P&A.
- To add more articles: write `posts/<slug>.json` (+ locale overrides), then rebuild
  canonical `_index.json` from bodies and add series/seriesOrder; translate per-locale.

## UPDATE 2 — Engineering Culture category shipped (commits 93b56da, ae53eea)
Second category **"culture"** (accent violet, order 2) + series **"kind-engineering"**,
6 locales, build-green, pushed. 5 posts (seriesOrder 1-5):
how-to-review-code-kindly · how-to-be-a-kind-engineer (credits kind.engineering) ·
how-to-write-a-great-pull-request · giving-and-receiving-feedback · mentoring-engineers.
- New SEO feature for how-to/culture content: **FAQ** support. `BlogPost.faqs` (BlogFaq{q,a});
  loadPost merges faqs per locale; article page renders a `.blog-faq` <dl> section AND emits
  **FAQPage JSON-LD** (rich-result eligible) alongside BlogPosting+Breadcrumb. i18n key
  `Pages.blog.faqHeading` + `seriesNames.kind-engineering` in all 6 locales. CSS `.blog-faq*`.
- Each EN article: SVG diagram(s), comparison table(s), company-size examples, 5 FAQs.
- Translations all 5/5 across vi/zh/ja/ko/fr (zh was finished in a follow-up commit after a
  transient agent rate-limit/socket failure; integrity was restored via git + a deterministic
  index rebuild script — pattern: if a translation agent dies mid-run, validate JSON + heading-id
  parity, delete corrupt files, `git checkout` the locale _index, rebuild index from bodies).
- Blog now: 2 categories, 11 posts, 6 locales. To add a category: append to canonical
  `_index.json` categories + each locale _index; pick an accent from blog.css (ocean/gold/
  violet/light/dark).

## UPDATE 3 — Notes section revamped + new article (2026-05-31)
- New note: `chi-phi-mua-nha-toan-bo-nhung-khoan-can-biet` (5 notes total in topic mua-nha)
- `_index.json` extended with `topics[]` array (id/label/description/color)
- `types.ts`: added `TopicMeta`, `topic?` field on `NoteMeta`, `topics` on `NotesIndexFile`
- `data.ts`: added `listTopics()`, `listNotesByTopic()` helpers
- `/notes` page revamped: renders topic sections with icon, description, count badge
- CSS: topic header w/ color variable, card hover uses `--topic-color`, summary clamp 2 lines
- Sitemap auto-picks up new slug via `listNoteSlugs()`

## Remaining backlog (suggested, not yet written)
SOLID · coupling & cohesion · modular monolith deep-dive · bounded contexts ·
strangler-fig + ACL · CQRS/event-sourcing · event-driven · repository/UoW ·
API-as-architecture (versioning) · resilience/idempotency · feature-flags/progressive
delivery · ADRs · testing strategy. (User has strong authority on MFE, feature flags,
fintech resilience, strangler-fig — prioritise those for EEAT.)

## Next Steps (actionable)
1. (Optional) Harmonize ja/ko/fr SVG `<text>` annotations as above.
2. Review visually: `npm run dev` → http://localhost:3000/en/blog (and /vi/blog, etc.).
3. Commit when satisfied (NOT yet committed). Suggested: `feat(blog): add Blog section with
   categories, i18n, SEO + first article on Ports & Adapters`. Remember: no Co-Authored-By line.
4. Future article (teased at end of post): Clean Architecture vs Onion vs Hexagonal.
   Add by creating `posts/<slug>.json` (+ locale overrides) and an entry in each `_index.json`.
