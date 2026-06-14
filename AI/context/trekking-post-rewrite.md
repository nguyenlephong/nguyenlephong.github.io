# Session: Trekking post rewrite (Hoàng Ngưu Sơn / Zalo)

## Objective
Rewrite the unsatisfying draft at `/blog/perspectives/quiet-accumulation-on-the-trail` into a creative, inspiring, well-structured photo essay using the author's real Zalo/VNG team-building trekking photos at `/Users/lap16773/Documents/Trekking Post` (118 photos + 55 videos + root files).

## Current State — DONE
- Analyzed all 188 images/video-frames via a fan-out Workflow (`trek-vision`); produced a ranked catalog + richer non-linear narrative arc.
- Selected & web-optimized 22 images into `public/assets/blog/quiet-accumulation-on-the-trail/` (named `01-..` → `24-..`, max 1800px long side, q72; 3 are video poster frames via `qlmanage`). Removed obsolete old draft assets + 2 unused.
- Rewrote EN post + summary/title in `public/blog-data/posts/quiet-accumulation-on-the-trail.json` and EN `_index.json` entry. New title: "The Mountain I'd Already Decided I Couldn't Climb". ~1958 words, 9 min, 6 narrative h2 headings (TOC), 11 figure blocks + trekking canvas + takeaways.
- Rewrote VI override in author's voice (`public/blog-data/vi/posts/...` + `vi/_index.json`). Title: "Ngọn núi mà mình đã tự quyết định là leo không nổi".
- `next build --turbopack` → EXIT 0, 2033 static pages, no errors. Verified built HTML renders title + 22 assets + canvas for EN & VI.

## Decisions
- User choices (via AskUserQuestion): use photos with author+teammates freely (no anonymizing); name Zalo/VNG gently (972m marker, Zalo@trekking medal); hybrid spine (keep "limits we draw" + "everyone has a first day" + quiet accumulation, rebuilt with non-linear emotional arc).
- Emotional climax = standing in the sea looking UP at the just-climbed mountain (`19-looking-up-from-water`). Grace note = night squirrel.
- Kept h2 headings (site uses BlogToc built from h2/h3) instead of fully seamless, but phrased them narratively.
- Slug kept unchanged (URL stable); only title/content changed.
- Author = man in olive tee, navy bucket hat, round glasses, blue Zalo buff.

## Constraints
- Content rules: `AI/skills/calm-content-writer/SKILL.md` (calm, sincere, non-commercial, reserved tech terms, no spiritual framing, quiet-accumulation framing, end with reflection invite).
- HTML injected via `dangerouslySetInnerHTML` (`src/components/blog/BlogContent.tsx`); figure classes: blog-photo-figure (3:2), blog-photo-panorama (16:9), blog-photo-grid (1 vertical lead + 2 horizontal supports), blog-photo-sequence (exactly 5 items, 3:4), blog-workflow-figure (`data-blog-workflow="trekking"`), blog-takeaways.
- Vietnamese written as raw UTF-8 (not HTML entities); only escape < > &.

## Next Steps (if resumed)
- Not committed yet — user has not asked. To commit: branch off dev or stay on dev; `feat:` message, no Claude co-author.
- Optional: user preview via `npm run dev` then open `/en/blog/perspectives/quiet-accumulation-on-the-trail`.
- Temp working files in `/tmp/trek_thumbs/` (thumbnails + manifest + workflow script) and `/tmp/write_en.py`, `/tmp/write_vi.py`.
