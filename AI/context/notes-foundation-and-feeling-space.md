# Notes: Foundation-before-the-leap + The Space Between Feeling & Doing (en+vi)

## Objective
From a batch of 6 reference pieces the author pasted, produce bilingual (en+vi)
reflective notes in his calm, office-relatable voice — secular, neutral, no
spiritual color, SEO-friendly, ending on the signature thesis "big changes are a
quiet accumulation surfacing." Not 1:1 rewrites.

## Key Decision — combine vs split
SPLIT, and write only the 2 genuinely-new themes. 4 of the 6 source pieces are
ALREADY published:
- "15 rules" → `quiet-rules-for-moving-through-the-world`
- silence/maturity + eagle-crow + soft-heart/hard-method → covered across
  `the-master-who-plays-the-fool`, `the-quiet-art-of-letting-go`,
  `half-light-half-shadow`, `solitude-of-great-minds`.
So only piece 2 ("before 40 / lập đạo–chí–thân–nghiệp") and piece 6 ("cảm thọ")
were new. Pieces 3 (Bát Chánh Đạo) and 4/5 were absorbed as supporting beats
(daily-1%-better; notice-name-let-it-crest; race-your-own-last-version).

## Current State — DONE & build-verified
Two notes, surface **notes**, topic `goc-nhin`, date 2026-06-12, featured, en+vi:

1. `the-foundation-comes-first` (~12 min) — from piece 2. Secularized
   lập-đạo/chí/thân/nghiệp → direction/resolve/capability/contribution (built
   bottom-up). Spine: time (not money) charges interest; easy road narrows /
   hard road widens; the visible leap = last inch of an unseen runway. Avoids
   overlap with salary-is-seed-capital (money) & dreamers-doers-and-grit (grit)
   by owning the TIME/foundation-order/accumulation angle. 2 SVGs (two-roads,
   foundation-stack).
2. `the-space-between-feeling-and-doing` (~11 min) — from piece 6 (Vedanā),
   FULLY secularized (no Buddha/luân hồi/duyên khởi — verified 0 hits). Spine:
   feeling→[space]→response (Frankl); a feeling is information not an
   instruction; conflict starts from one unnoticed charge; notice/name/let-it-
   crest; silence as one option of the space; composure = a thousand small
   pauses compounded. 1 SVG (same-spark-two-endings cascade).

Files (only content changes):
- public/notes-data/posts/{slug}.json (EN canonical: html + 5 FAQs)
- public/notes-data/vi/posts/{slug}.json (VI override: title/summary/html/tags/faqs)
- public/notes-data/_index.json (prepended 2 EN metas; baseLocale en, locales [en,vi])
- public/notes-data/vi/_index.json (prepended 2 VI metas)

`npm run build` GREEN. Verified per slug/locale: <slug>.html generated for all
6 locales; VI renders Vietnamese (lang="vi", no EN fallback); canonical + full
hreflang cluster (en/vi/zh/ja/ko/fr/x-default); Article + FAQPage JSON-LD; OG
PNGs; engagement stack auto-inherited (views/share/reactions/TOC + PostHog
reading tracker via category="notes"). Structure checks: 5 <h2 id> each, SVG
<title> ids == aria-labelledby, balanced <p>/<div>/<svg>, 5 FAQs each.

## Constraints / Authoring model
- EN canonical in posts/; VI in vi/posts/; meta in BOTH _index.json.
  EN meta = {slug,title,summary,date,readingMinutes,tags,author,featured,topic,
  baseLocale,locales}. VI meta = {slug,title,summary,tags}.
- HTML toolkit: blog-figure + inline dgm-* SVG (suffix ids -en/-vi for
  uniqueness), blog-callout--tip/--warn/--note, blog-table-wrap, blog-takeaways,
  <h2 id> for TOC. JSON via Python json.dump (no manual escaping).
- All goc-nhin notes are featured; posts date-sorted desc (prepend = newest).
- Builder scripts live in /tmp (essayA_en/vi, essayB_en/vi, write_essayA/B).
- out/ is a build artifact; not committed. Note pages are out/<loc>/notes/<slug>.html.

## Next Steps (actionable)
- NOT committed yet (commit only when asked). To ship on `dev`:
  `git add public/notes-data && git commit -m "feat(notes): add two bilingual
  goc-nhin reflections — foundation-before-the-leap + the space between feeling
  and doing (en+vi)"`  (do NOT add Co-Authored-By).
- Optional preview: npm run dev → /en|/vi /notes/the-foundation-comes-first and
  /notes/the-space-between-feeling-and-doing.
- Leftover source not yet used: piece 3 (Bát Chánh Đạo) — only viable as a
  heavily-secularized standalone if the author wants it; flagged as optional.
