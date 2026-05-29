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

## Next Steps (actionable)
1. (Optional) Harmonize ja/ko/fr SVG `<text>` annotations as above.
2. Review visually: `npm run dev` → http://localhost:3000/en/blog (and /vi/blog, etc.).
3. Commit when satisfied (NOT yet committed). Suggested: `feat(blog): add Blog section with
   categories, i18n, SEO + first article on Ports & Adapters`. Remember: no Co-Authored-By line.
4. Future article (teased at end of post): Clean Architecture vs Onion vs Hexagonal.
   Add by creating `posts/<slug>.json` (+ locale overrides) and an entry in each `_index.json`.
