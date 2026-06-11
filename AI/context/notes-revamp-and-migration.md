# Notes (Ghi chép) — Bilingual Revamp + Perspectives Migration

## Objective
1. Move blog `perspectives` content (personal reflection / self-help) into the
   personal **Notes (Ghi chép)** section — keep blog technical/professional.
2. Revamp Notes UI/UX: pagination, search, topic+tag filter, SEO, per-note view count.
Site = Next.js 16 `output: export` (static, github.io).

## User decisions (locked)
- Move **only `perspectives` (25)**; blog keeps architecture/ai/culture/ways-of-working (31).
- **Don't drop anything**: legacy VI notes stay VI; migrated 25 keep BOTH en+vi →
  Notes data layer made bilingual-compatible.
- **No redirects** for old `/blog/perspectives/...` URLs.
- Do it all in one pass.

## Done ✅ (build green: `next build` exit 0)
### Data migration (one-off Python)
- 25 perspectives moved blog-data → notes-data under new topic **`goc-nhin`**
  (en "Perspectives & Reflections" / vi "Góc nhìn & Chiêm nghiệm", color #b45309).
- Base post (en) → `notes-data/posts/{slug}.json`; vi → `notes-data/vi/posts/{slug}.json`.
- Created `notes-data/vi/_index.json`. Existing 25 notes tagged `baseLocale:'vi', locales:['vi']`;
  migrated tagged `baseLocale:'en', locales:['en','vi']`.
- Removed perspectives from `blog-data/_index.json` + `vi/_index.json` (now 31 posts, 4 cats).

### Visibility model
- `contentLocale`: vi→vi, everything else→en (English is the international fallback).
- `/vi/notes` = 50 notes (VI). `/en|zh|ja|ko|fr/notes` = 25 migrated (EN).
- Legacy VI-only notes never appear on non-vi pages (filtered by `locales`).

### Code
- `src/lib/notes/types.ts` — +baseLocale, locales, featured, faqs (NoteFaq).
- `src/lib/notes/data.ts` — bilingual: loadNotesIndex/listNotes/listTopics/getTopic/
  listNotesByTopic/loadNote all take locale; `listNoteParams()` for static gen.
- `src/components/notes/NotesExplorer.tsx` + `NoteCard.tsx` — reuse blog primitives
  (useDebouncedValue, BlogPagination, .blog-* CSS). Search (diacritics-insensitive),
  topic+tag chips, 9/page, URL sync `?q=&topic=&tag=&page=`, view badges via
  `postStatsId('notes', slug)`.
- `notes/page.tsx` — bilingual index (i18n Pages.notes), no vi redirect, NotesExplorer,
  CollectionPage JSON-LD listing all notes, per-locale metadata.
- `notes/[slug]/page.tsx` — bilingual `loadNote(slug,locale)`, all-locale static params,
  i18n strings, FAQ section + FAQPage JSON-LD, view tracking already via
  EngagementProvider category="notes".
- `notes/[slug]/opengraph-image.tsx` — listNoteParams + locale-aware eyebrow/badge.
- `sitemap.ts` — `/notes` index added; bilingual notes get full hreflang cluster,
  VI-only notes single /vi canonical.
- `messages/{6}.json` — added `Pages.notes.*` + `Nav.notes`.
- `app.const.ts` APP_ROUTE.NOTES; `AppHeader.tsx` nav link.
- Deleted dead `NotesChamberNav.tsx` (old chamber layout replaced by explorer).
- `notes.css` — `.notes-explorer` accent var bridge so blog primitives render right.

## Verified
- tsc clean; prettier (house style = semicolons+double quotes); build exit 0.
- out/en/notes.html: 9 cards, explorer+pager, 2 chips, JSON-LD 25, EN placeholder.
- out/vi/notes.html: 9 cards, 6 chips, JSON-LD 50, VI placeholder.
- out/en/blog.html: no "perspectives", 31 BlogPosting. /blog/perspectives gone.
- Migrated note detail at both /en + /vi with FAQ JSON-LD + view count.

## Notes / caveats
- View history: migrated posts previously counted under `perspectives__{slug}`; now
  `notes__{slug}` (going-forward counts; old orphaned — acceptable per scope).
- All 25 in one topic `goc-nhin`; can re-bucket later (search/tags cover navigation).
- eslint: pre-existing `AppHeader` set-state-in-effect warning (not from this change;
  build ignores eslint).
- NOT committed (awaiting user review).

## Next Steps (optional)
- Browser verify interactions (search/filter/pager/URL) on /en/notes + /vi/notes.
- Optionally split `goc-nhin` into finer topics.
- Commit when approved.
