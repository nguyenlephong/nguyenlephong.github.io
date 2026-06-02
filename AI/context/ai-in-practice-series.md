# Session: AI in Practice blog series

## Objective
Review the blog's AI topic and add 3 new AI articles (trends / AI agents / AI workflows / using AI to create value), multi-language, SEO-friendly, friendly+inspiring tone, with reading-time tracking + view/share like existing posts.

## Current State — DONE (build green)
Added a 3-part **"AI in Practice"** series (category `ai`, `series: "ai-in-practice"`, all `featured: true`, date 2026-06-02):
1. `ai-agents-explained` (order 1, 17 min) — What an AI agent is, the perceive→reason→act→observe loop (SVG diagram), 5 ingredients, autonomy levels, office+life uses, failure modes.
2. `ai-workflows-that-save-hours` (order 2, 18 min) — prompt vs workflow, pipeline anatomy (SVG), steal-ready office+life workflows, 3 levels manual→automated, payoff math.
3. `ai-trends-2026-into-value` (order 3, 18 min) — 5 grounded 2026 trends, hype-vs-value filter, value ladder (SVG), value equation, 30-day plan.

Each post: house style (`blog-callout` note/tip/warn, `blog-table-wrap`, `blog-takeaways`, one theme-aware `blog-figure` SVG using `dgm-*` classes), 5 FAQs (FAQPage JSON-LD), key-takeaways box.

**Languages: all 6** — en (canonical `posts/`), vi, fr, ja, ko, zh. = 18 post JSON files + 6 `_index.json` updated.
- en + vi authored directly (primary audience).
- fr/ja/ko/zh via parallel translation subagents (zh finished manually after socket drops). All keep HTML/SVG structure + heading anchor ids byte-identical; only visible text + SVG `<text>`/`<title>` translated; technical terms (agent, workflow, prompt, tool, LLM, trigger…) left untranslated.

Validated: all 18 files valid JSON, structural parity vs EN, anchor-ids identical, indexes consistent (en/vi=24 posts, fr/ja/ko/zh=15), `seriesOrder` 1/2/3. `npm run build` succeeded; all 18 routes (3×6 locales) prerendered with diagrams.

## Decisions
- Tracking/view/share/reactions/OG-image are **component-based** (`BlogReadingTracker` + `track()`→PostHog `notes_*` events; `usePostEngagement`→Firebase; `opengraph-image.tsx`) → **automatic** for any new post. No code changes needed, only content.
- Series sorts to top of AI category via `seriesOrder` (data.ts `bySeriesThenDate`); prev/next + "Part N of M" auto-rendered by `getSeriesContext`. No manual cross-links (no post uses inline `<a>`).
- fr/ja/ko/zh were a frozen 12-post subset; user chose to extend all 6 for this series → now 15 each.

## Constraints
- A post must exist in **base** `/_index.json` to render; per-locale `_index.json` only overrides title/summary/tags. Base `posts/<slug>.json` required; locale files override title/summary/html/tags/faqs.
- JSON authored via Python builders (`json.dump(ensure_ascii=False, indent=2)`) to guarantee escaping of large HTML/SVG.

## Next Steps (actionable)
- Not committed/pushed yet. To ship: `git add public/blog-data && git commit` (no Claude co-author per global rule) on branch `dev`.
- Optional: backfill the older AI posts (`how-ai-changes-software-roles`, `generative-ai-everyday-uses`) into fr/ja/ko/zh for parity.
- Optional: bump `app-version.json` if the footer version should reflect the new content.
