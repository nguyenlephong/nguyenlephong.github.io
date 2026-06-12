# Note: Inductive vs Deductive Thinking (quy nạp / diễn dịch)

## Objective
Publish a bilingual (en+vi) reflective essay revamped from a reference piece on
induction vs deduction (Steve Jobs / Elon Musk / wealth / relationships) — in the
author's calm, sincere, office-relatable voice. Not a 1:1 rewrite.

## Current State — DONE & build-verified
Slug: `inductive-and-deductive-thinking` · surface: **notes** (ghi chú) ·
topic: `goc-nhin` (Góc nhìn & Chiêm nghiệm) · date 2026-06-12 · ~13 min · featured.

Files (the only content changes):
- `public/notes-data/posts/inductive-and-deductive-thinking.json` (EN canonical, full html + 5 FAQs)
- `public/notes-data/vi/posts/inductive-and-deductive-thinking.json` (VI override: title/summary/html/tags/faqs)
- `public/notes-data/_index.json` (prepended EN meta: baseLocale en, locales [en,vi], topic goc-nhin)
- `public/notes-data/vi/_index.json` (prepended VI meta override)

`npm run build` green: pages + OG images generated for all 6 locales; VI renders
Vietnamese (no EN fallback); hreflang cluster + canonical + Article/FAQPage JSON-LD;
engagement auto-inherited (view count, share, reactions, TOC, PostHog reading
tracker via `category="notes"`). Both `<h2>`/SVG/FAQ id sets balanced & unique.

## Decisions (important)
- **Placement = notes/goc-nhin, not blog.** Blog's 4 categories are all technical;
  this is the same reflective genre as the 3 essays migrated to notes last session
  (`choice-or-fate`, `dealing-with-people-you-dislike`, `complexity-is-inevitable…`).
  Notes reuses the full blog engagement stack, so all "blog feature" asks are met.
- **"Không chia tiêu đề" = flowing essay with evocative `<h2>` waypoints** (matches
  existing essays; preserves TOC + SEO), not a rigid listicle.
- **Neutralized sensitive source bits:** removed gendered "all men/women" lines and
  street-vendor/class framing → gender- and class-neutral examples. Folded the Musk
  "P/S" into a proper section. Kept technical terms untranslated (First Principles
  Thinking; quy nạp/diễn dịch). No selling/inbox CTA — closes by inviting the
  reader's own perspective.

## Constraints
- Authoring model: EN canonical in `posts/`; VI in `vi/posts/`; meta in both `_index.json`.
  `locales:["en","vi"]` triggers full hreflang + both static params.
- HTML toolkit: `blog-figure`+inline `dgm-*` SVG, `blog-callout--tip/--warn/--note`,
  `blog-table-wrap`, `blog-takeaways`, `<h2 id>` for TOC. JSON strings (no literal newlines).
- `out/` is a build artifact; not committed.

## Next Steps (actionable)
- Not committed yet. To ship: `git add public/notes-data && git commit` on `dev`
  (suggested: `feat(notes): add bilingual reflection on inductive vs deductive thinking — en+vi`).
- Optional: preview locally with `npm run dev` → /en/notes/inductive-and-deductive-thinking
  and /vi/notes/... to eyeball the two SVG diagrams.
