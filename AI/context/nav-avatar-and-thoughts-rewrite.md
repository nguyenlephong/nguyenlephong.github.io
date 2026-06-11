# Nav simplify + Avatar + Thoughts blog-style rewrite

## Objective
1. Header: remove Ghi chép (still in footer); collapse About/Experience/Projects/
   Contact → one "About me"; replace "NLP" monogram with round avatar.
2. Rewrite all 40 /thoughts notes as richer blog-style articles (en+vi): keep core
   + author intent + coined terms, expand expression, add ONE tasteful inline link
   to the original author's home (huylenq.github.io, anchor text, no raw URL).
3. After rewrite, remove the old credit footer line ("…mirroring thoughts from
   huylenq.github.io…").

## Done ✅ (build exit 0, tsc clean)
### Header
- `AppHeader.tsx`: navItems now [About me → /#about, Gallery, Blog]. Removed
  experience/projects/contact/notes from top nav.
- Avatar: replaced `<span class="brand-mark">NLP</span>` with
  `<img src="/icon.png" class="brand-avatar">` (the 512×512 favicon = his portrait,
  already circular). CSS `.brand-avatar` (round, 36px, hover) in globals.css.
- i18n: added `Nav.aboutMe` to 6 locales.

### Thoughts rewrite (40 notes × en+vi = 80 files)
- 3 done by main loop (pilot): perfect-tools (6e9a5e59), AI-info-privilege (23cd8fda),
  the-cost-of-delayed-action. 37 done by 6 parallel general-purpose subagents.
- Each: expanded prose (seeds ~2–3x, evergreens polished), preserved thesis +
  bold/coined terms + `<hr>` related-links block verbatim + internal /thoughts/ links.
  Exactly ONE inline `<a href="https://huylenq.github.io" …>` credit per article,
  varied anchor text (en: "a friend's garden of thoughts/notes/thinking"; vi: "vườn
  ý nghĩ / ghi chú / dòng suy nghĩ của một người bạn"), wrapped in `<em>(…)</em>`.
- Files touched: only the `html` field (slug/title/backlinks/maturity untouched).

### Credit removal
- Removed credit `<p>` from `thoughts/[slug]/page.tsx` AND `thoughts/page.tsx`
  (+ unused THOUGHTS_SOURCE imports / originalUrl).
- Removed `Pages.thoughts.credit` key from all 6 message files (so the text is gone
  from the embedded i18n blob too).

## Verified
- Validation script: 80 thought files, 0 problems — each has exactly 1 huylenq link,
  internal links preserved vs git original, valid JSON, expanded.
- Build: credit-class gone, no "mirroring"/"phản chiếu" text, index huylenq count 0.
- Avatar present in header HTML.

## Notes
- Detail pages show huylenq count 2 = 1 rendered + 1 in Next RSC flight data (normal).
- THOUGHTS_SOURCE still defined in seo.config (now unused by pages) — left in place.
- Committed + pushed on branch dev.
