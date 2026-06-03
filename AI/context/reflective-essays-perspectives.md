# Session: Reflective life essays (perspectives)

## Objective
Turn a Vietnamese prose-poem (meaning of life = the living, not the destination; stop waiting for "later") into a full blog essay. First of a planned line of similar life-reflection pieces.

## Decisions (user-confirmed)
- Category: **perspectives** (Chia sẻ), **standalone featured**, **no series** (user picked "bài lẻ").
- Languages: **en + vi** only (fr/ja/ko/zh fall back to English via data.ts merge — same as other partly-translated posts).

## Current State — DONE (build green)
- `posts/meaning-is-in-the-living.json` (en, canonical) + `vi/posts/meaning-is-in-the-living.json`.
  - Title EN: "The Meaning of a Life Is in the Living: A Gentle Case Against Waiting for 'Later'".
  - category `perspectives`, date 2026-06-03, 13 min, featured, NO series.
  - Opens with the user's original poem as a `<blockquote>` epigraph (VI = their exact words; EN = poetic translation).
  - Sections: destination isn't the point → life makes no appointments → what mattered fades → the "later" trap (SVG "waiting line vs live today" diagram, dgm-*) → too busy to love → what life is also for → live don't exist → unfinished-but-radiant → key takeaways. 5 FAQs.
- Registered in base `_index.json` + `vi/_index.json` (both now 29 posts, inserted at front).
- Validated: en/vi structural parity, identical anchor ids, 1 blockquote, 5 faqs, no series. `npm run build` OK (1055 pages, route + OG generated for all 6 locales).

## Notes
- Tracking (PostHog `notes_*`), view/share/reactions, OG image are component-based → automatic.
- fr/ja/ko/zh render the EN content (no override file) — consistent with how-ai-changes-software-roles etc.

## Second essay — DONE (build green)
- `posts/solitude-of-great-minds.json` (en) + `vi/posts/solitude-of-great-minds.json`.
  - Title EN: "The Solitude of Great Minds: The Quiet Strength of People Who Walk Alone".
  - From a Vietnamese source about lonely/independent "awakened" people; expanded with healthy framing.
  - Core distinction: solitude (chosen, restoring) vs loneliness (a gap, draining) — SVG contrast diagram.
  - Sections: solitude≠loneliness → worth within not borrowed → gentle outside/steel inside → reading people → high threshold not cold → if a warm person goes quiet → inner fortress → through the dark (with a "keep one gate open" healthy caveat). 5 FAQs (woven with user's VI keywords).
  - perspectives, 2026-06-03, 13 min, featured, NO series. Registered base + vi (both now 30 posts).

## Next Steps
- Two reflective essays NOT committed yet (user hasn't asked): `meaning-is-in-the-living` + `solitude-of-great-minds` (4 post files + base/vi index edits). To ship: `git add public/blog-data && git commit` on `dev` (no Claude co-author).
- Future: more life-reflection essays in perspectives; if the collection grows, consider grouping into a series later (e.g. "Sống Trọn / Living Fully").
