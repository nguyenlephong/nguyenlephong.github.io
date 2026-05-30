# Firebase Blog Engagement — Session Snapshot

## Objective
Add Firestore-backed engagement to blog posts: per-post **view count**, **reactions**
(like / love / insightful / clap), and a **share** bar. Must stay simple and SEO-safe.

## Current State — DONE (feature complete, build green)
- Site is `output: "export"` (GitHub Pages) → **client-side Firebase Web SDK only**.
- Firebase loaded via **dynamic `import()`** → code-split into async chunk
  (~348 KB firestore lands in its own lazy chunk, off the landing/main bundle,
  fetched only after a blog post hydrates → no LCP/SEO impact).
- **No-ops gracefully when env unset** → site works before config.

### Files added
- `src/lib/firebase/client.ts` — lazy, memoised Firestore init; `isFirebaseConfigured()`, `getDb()`.
- `src/lib/firebase/postStats.ts` — data access: `getPostStats`, `incrementView`,
  `incrementShare`, `applyReaction`, `postStatsId`. Doc id = `{category}__{slug}`
  (locale-agnostic → numbers pooled across translations). All writes use atomic `increment()`.
- `src/components/blog/usePostEngagement.ts` — hook: load counters, 1 view/session
  (sessionStorage dedupe), optimistic reaction toggle persisted in localStorage.
- `src/components/blog/BlogEngagement.tsx` — UI: reactions row, view count, share
  (Web Share API + X/Facebook/LinkedIn + copy-link). Client component.
- `firestore.rules` — public read; write limited to `postStats`, known fields,
  non-negative ints, **±1 delta per write** (anti-inflation).
- `.env.example` + `.env` — `NEXT_PUBLIC_FIREBASE_*` keys (blank).

### Files modified
- `src/app/[locale]/blog/[category]/[slug]/page.tsx` — renders `<BlogEngagement>` after content.
- `messages/{en,vi,fr,ja,ko,zh}.json` — added `Pages.blog.engagement.*` labels.
- `src/app/[locale]/blog/blog.css` — `.blog-engagement` + `.blog-react` + `.blog-share-btn` styles.
- `package.json` / lockfiles — `firebase@12.14.0`.

## Decisions
- Doc id locale-agnostic (`category__slug`) — same article = one stat row across languages.
- Dynamic import for code-split (perf budget; microsite < 80 KB initial).
- Anti-spam is client-side (localStorage/sessionStorage) + ±1 rule server-side.
  Acceptable for a personal blog; no auth.

## Constraints
- Static export: no server runtime, no Admin SDK, no API routes.
- All Firebase config must be `NEXT_PUBLIC_*` (baked at build time).

## Next Steps (for the user to configure)
1. Firebase Console → create project → **Build → Firestore Database → Create**
   (production mode, region e.g. `asia-southeast1`).
2. Project settings → **Add Web app** → copy the config object.
3. Fill `.env`:
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
   (others optional).
4. Firestore → **Rules** tab → paste contents of `firestore.rules` → Publish.
   (Or `firebase deploy --only firestore:rules` if using firebase CLI — needs `firebase.json` with a firestore block.)
5. For the GitHub Pages CI build: add the same `NEXT_PUBLIC_FIREBASE_*` as repo
   secrets/build env (they're public anyway).
6. `bun run dev`, open a blog post → reactions/share appear; refresh → view +1 once/session.

## Update — engagement layout v2
Refactored into a shared context so all widgets share one Firestore read / one
view increment:
- `src/components/blog/EngagementProvider.tsx` — context wrapping the article.
- `src/components/blog/BlogViewCount.tsx` — view count inline in the byline meta
  (hidden until ready & views > 0).
- `src/components/blog/BlogShareDock.tsx` — responsive share surface:
  ≥1280px = sticky vertical rail in the left margin; <1280px = floating FAB
  (bottom-right) that opens a popover / native share sheet. Reveals after 500px scroll.
- `src/components/blog/BlogReactions.tsx` — bottom bar, reactions only (share removed).
- `BlogEngagement.tsx` deleted. `formatCount` moved to `postStats.ts`.
- New i18n key `Pages.blog.engagement.close` in all 6 locales.

## Verify
- `bunx tsc --noEmit` → clean.
- `bunx next build` → green, 747 static pages, firebase in async chunk.
- Exported HTML contains `.blog-share-dock` + `.blog-reactions`, old `.blog-engagement` gone.
