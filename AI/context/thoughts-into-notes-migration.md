# Thoughts → Notes migration (Thought Garden)

## Objective
Move all 40 /thoughts (digital garden) into the notes surface ("ghi chép") as
first-class bilingual notes, rewritten in the author's calm reflective voice,
tagged `Thoughts` for filter/search. Hide the footer brain icon; /thoughts
route stays reachable by typing the URL.

## Current State — DONE & build-verified
- New topic `thoughts` in both registries: EN "Thought Garden" / VI "Vườn suy
  nghĩ", color #4d7c0f.
- 40 notes migrated (EN canonical posts/ + VI override vi/posts/ + metas in
  both _index.json). date 2026-05-27 (git import date — sorts below the
  2026-06-02 essays), featured:false, author set, readingMinutes computed,
  tag "Thoughts" FIRST in both EN & VI tag arrays (literal in both locales so
  the tag filter works in either). cardSummary hooks EN+VI for every note.
- Voice: prose smoothed into the author's warm first-person style; kept
  substance/length (short garden notes), kept huylenq attributions, kept
  technical terms (GTD, SRS, Obsidian, tsundoku, First Principles…). Fixed
  rough drafts (recognizable-patterns: Einstellung typo, completed the
  inside/outside-view fragment). `private-link` spans → plain text/em.
  h1/h3 → h2 with ids (TOC works).
- UUID slugs renamed: 23cd8fda→ai-reduces-the-information-privilege,
  516f2efb→why-taking-notes, 6e9a5e59→perfect-tools-syndrome,
  96524a51→articulation-skill, e165fb3e→the-physics-laws-of-life.
- Internal links: authored as /thoughts/<old-slug>, converted by
  retarget() in /tmp/thought_common.py → /notes/<new-slug>. At runtime
  BlogContent.tsx prefixes locale (a[href^="/notes/"] → /<locale>/notes/...).
- Footer: AppFooter.tsx — thoughts <li> + PiBrainBold import removed, comment
  explains the route is intentionally unlisted.
- /thoughts route untouched & still builds (reachable by URL only).
- Build green: 40/40 EN + 40/40 VI note pages; topic chips render in both
  locales; Thoughts is the top popular tag (filter chip + ?tag=Thoughts);
  VI pages render Vietnamese; zero leftover /thoughts/ hrefs in note bodies.
- Validation script confirms: no private-link leaks, balanced tags, all
  internal /notes/ links resolve, every note has VI override + hooks.

## Decisions
- Topic chip AND tag (he asked for tag; topic gives the built-in chip filter).
- Date = 2026-05-27 for all (the real git import date; avoids flooding the
  index top).
- VI bodies written fresh from the revamped EN (not patched from old VI);
  titles reused from vi/_titles.json (cleaned "§ " prefix).
- Did NOT delete /thoughts or thoughts-data; duplicate content with
  /notes/<slug> accepted per request (could add noindex to /thoughts later if
  SEO becomes a concern — not asked).

## Constraints / Conventions (same as before)
- EN meta: slug,title,summary,cardSummary,date,readingMinutes,tags,author,
  featured,topic,baseLocale:"en",locales:["en","vi"].
  VI meta: slug,title,summary,cardSummary,tags.
- Builders in /tmp: thought_common.py (writer+SLUG_MAP+retarget) and
  tb1..tb5.py (8 notes each). Re-runnable (dedupe by slug).
- out/ is a build artifact; note pages are out/<loc>/notes/<slug>.html.

## Next Steps (actionable)
- NOT committed. To ship on dev:
  git add public/notes-data src/components/AppFooter.tsx AI/context
  commit msg suggestion:
  "feat(notes): fold the /thoughts garden into notes as bilingual 'Thought
  Garden' topic (40 notes, en+vi) + hide footer thoughts icon"
  (no Co-Authored-By).
- Optional later: noindex on /thoughts pages to avoid duplicate-content SEO;
  or a redirect /thoughts/<slug> → /notes/<slug>.
