# Session: Strict review + refactor (nguyenlephong.github.io)

**Branch:** dev · **Date:** 2026-06-19

## Objective
Strict code review of the personal site, then execute the full prioritized
refactor (security → CI → dedup → engagement → god-file → perf).

## Current State (6 commits on `dev`, all verified tsc + eslint + node:test + static build)
- `a4e478f9` Phase 0 — security & hygiene: hardened `firestore.rules` (monotonic
  int +1 writes; was: anyone could overwrite any counter); anonymized real
  family DOBs in `heartbeats/family.data.ts`; removed unused `NEXT_PUBLIC_OPEN_AI_KEY`;
  deleted legacy `/home` route + `HomeSocialTracker` + `*.bk.ts`; added `sharp` devDep.
- `c42a494e` Phase 1 — CI: replaced dead Node-14/jest job with real gate
  (npm ci → typecheck → eslint → node:test → smoke build); added `test`/`typecheck`
  scripts; `eslint.ignoreDuringBuilds:false`.
- `7669230d` Phase 2 — shared content IO: `src/lib/content/{io,types}.ts` (cached +
  validated `readJson`, shared `byDateDesc`/`overlayByKey`, `Faq`/`BookSource`);
  blog/notes/thoughts `data.ts` now compose it (removed 3× `readJson` + ~180 dup lines).
- `afd9c58b` Phase 3 — engagement: unified `usePostEngagement` (options:
  withReactions/storageNamespace) drives blog/notes + thoughts; side-effects moved
  out of setState updater + rollback on failed writes; `postStats` repository returns
  success booleans + `getAllPostStats()`; explorers use one batched read (no per-card fan-out).
- `ec3ecdda` Phase 3 — stripped dead code from `app.const.ts` (785→616): all `_bk`
  fields + `jobs_bk` type + 4 commented-out data blocks.
- `fbde1798` Phase 4 — privacy/tracking: Do-Not-Track gate in `track()` +
  `respect_dnt:true`; `PageTracker` guards duplicate `page_time_on_page`.

## Decisions (important)
- `.env` kept tracked: all values are public-by-design `NEXT_PUBLIC_*` Firebase web
  config and the GitHub-Pages deploy has no secrets block, so untracking would break
  live engagement for zero security gain. Removed only the unused OpenAI footgun.
- Thoughts surface kept (orphaned/dead code) per user; de-duplicated via shared IO,
  not deleted.
- View counts batched (one query) rather than baked at build, to keep counts live.
- Did NOT force a generic content `createCollection` — blog/notes diverge enough
  (series vs topic, locale-collapse, visibility) that shared helpers are cleaner.

## Constraints
- Static export (`output:"export"`) → no request-time server; deploy = `gh-pages`.
- `firestore.rules` change must be deployed: `firebase deploy --only firestore:rules`.
- Keep `package.json` ↔ `package-lock.json` in sync (CI runs `npm ci`).

## Next Steps (deferred — pure refactors, do as focused PRs)
1. ~~Explorer extraction~~ DONE (`121cc028`): `useExplorer` + `ExplorerShell` +
   `src/lib/content/search.ts`; BlogExplorer 501→131, NotesExplorer 506→133.
2. **`app.const.ts` module split**: shard into `src/content/{gallery,projects,profile,
   skills,media}.ts` + `routes.ts`; migrate about/summary prose to `messages/*` (single
   source) so the about page stops rendering English-only.
3. **ThoughtGraph perf** (only when thoughts is revived — currently unrendered):
   `next/dynamic({ssr:false})`, debounce resize, replace O(n²) `forceRectCollide`.
4. **Font loading**: 9 Google families in `[locale]/layout.tsx`; lazy-load by reader
   selection. Needs screenshot testing across themes.
5. Deploy the hardened `firestore.rules`. Consider Firebase App Check (the only real
   anti-abuse for anonymous counter writes on a static host).
