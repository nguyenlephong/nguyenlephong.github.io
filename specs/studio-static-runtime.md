# Studio static runtime and crawlable overview

## Context

Studio is a static-exported public route, but its UI is mounted into a Shadow
DOM after hydration. Without JavaScript the exported page previously contained
an empty shadow host, so people and crawlers could not read any Studio content.
The client shell also imported visualization libraries into its entry module,
even when a visitor opened the lightweight welcome route.

## Decision

- Export a concise, localized Studio overview as ordinary light DOM inside the
  shadow host. It remains visible without JavaScript and is replaced only after
  the ShadowRoot is ready.
- Keep exactly one localized, visible page H1 in light DOM for the complete
  route lifetime. Hydration projects that same node through a named slot in the
  Studio top bar; active Studio module titles are H2 and the ShadowRoot owns no
  H1.
- Publish crawlable module links in the overview and mirror those exact URLs in
  the `CollectionPage.hasPart` graph.
- Navigation contract: the three public modules (Delivery checklists, System
  maps, AI setup) live on their own crawlable paths,
  `/[locale]/studio/{checklists,system-maps,ai-setup}`, and the overview on
  `/[locale]/studio`. In-shell navigation between them uses
  `history.pushState` on those paths; every other route (AI Skills, flow deep
  links) stays a `?route=` query plus matching hash on `/[locale]/studio`.
  `normalizeLocationRoute` reads query, then hash, then the module path.
- On every route activation, popstate and the first shell render, the shell
  sets `document.title` and the slotted light-DOM H1 text from
  `getStudioRoutePageTitles`. Routes with a server page reuse that page's
  metadata title and H1 verbatim (fallback locales keep the English content
  title and `lang`), so a client navigation and a reload of the same URL read
  the same. Query-only routes use `{localized route title} | Engineering
  Studio` and the localized route title as H1.
- Analytics: `studio_view` comes only from the server page's `PageTracker` on a
  full document load (with `studio_module` context on module pages). Client
  path or query changes inside the shell never emit `studio_view`; they emit
  `studio_route_open` with a `source` (`sidebar`, `command`, `brand`,
  `studio_module_open`, `browser_history`, ...) and `previous_route`. Event
  names are unchanged.
- Load optional visualization runtimes only from modules that render them.
  Static text and navigation must not depend on those libraries.
- Keep XYFlow behind its own dynamic feature boundary. The default/welcome
  module does not import it; flow state and analytics stay in the shell while
  the canvas uses a narrow typed adapter. Studio ships no chart library: the
  template dashboards and their Recharts dependency were removed (MEP-13,
  MEP-83).
- Keep the direct English Studio entry below 250 KiB Brotli. The artifact gate
  follows emitted Turbopack chunk references, treats every `Promise.all` loader
  group as one atomic download, and hard-gates the English default route at
  204,800 bytes Brotli. It also reports the complete reachable asynchronous
  total, so moving bytes behind `import()` remains visible rather than appearing
  as a bundle reduction.
- Treat AI Skills, Delivery Checklists, and XYFlow as representative lazy
  features. Stable emitted markers for each
  feature must exist in a reachable asynchronous chunk and must not occur in a
  directly referenced Studio script.
- Keep each of the six Studio locale entries isolated. Stable preferences
  sentinels identify their emitted loader groups; every sibling required by the
  selected English locale and Welcome loaders counts toward the default-route
  budget, while all five non-English sentinels are forbidden from that set.
- A visualization chunk failure renders localized text without unmounting the
  Studio workspace. Its recovery control reloads Studio, because retrying the
  same cached rejected lazy module is not reliable.
- Report shell, route, and XYFlow boundary failures through
  `studio_feature_load_error`. Its boundary callback accepts no error object and
  emits only `feature_id`, `locale`, and optional `route_id`/`route_kind`.
- Every localized Studio metadata object explicitly publishes Open Graph and
  Twitter images through the locale root OG image route.

## Non-goals

- Only the three public modules have their own paths; the remaining routes
  keep the query/hash router.
- It does not redesign the interactive flow editor or change its state model.
- Query-only routes are not canonical and never enter the sitemap; the
  overview and the three module paths are the only canonical Studio URLs.

## Acceptance criteria

- **AC-STUDIO-STATIC-001:** Every supported locale exports a meaningful Studio
  overview with one visible page H1, a concise introduction, module
  descriptions, and ordinary anchor links.
- **AC-STUDIO-STATIC-002:** The overview is the initial ShadowIsland fallback,
  is identical for server render and first hydration render, and is removed
  only after the ShadowRoot mounts.
- **AC-STUDIO-STATIC-003:** Disabling JavaScript leaves the overview readable
  and scrollable; it must not depend on Shadow DOM, client state, or Firebase.
- **AC-STUDIO-STATIC-004:** Studio emits one `CollectionPage` object whose
  `hasPart` URLs exactly match the visible module links.
- **AC-STUDIO-STATIC-005:** The canonical Studio URL remains self-canonical,
  indexable, localized with reciprocal alternates, and present in the sitemap.
- **AC-STUDIO-STATIC-006:** Hydrated Studio preserves existing route parsing,
  state, interaction behavior, and analytics event names.
- **AC-STUDIO-STATIC-007:** The welcome route does not statically import any
  visualization runtime, and `package.json` does not depend on Recharts.
- **AC-STUDIO-STATIC-008:** The static artifact verifier rejects a Studio page
  with no fallback, multiple H1 elements, missing module links, invalid
  CollectionPage data, or `hasPart`/anchor URL drift.
- **AC-STUDIO-STATIC-009:** The Studio shell contains no static
  `@xyflow/react` import. The package, node renderer, minimap, controls, and
  viewport helpers live in one dynamically imported flow-canvas runtime behind
  a localized feature error boundary.
- **AC-STUDIO-STATIC-010:** Flow canvas changes, connections, selection,
  history, layout, focus, fullscreen and analytics retain their existing shell
  state and event contracts through typed runtime callbacks.
- **AC-STUDIO-STATIC-011:** XYFlow failures have a localized fallback whose
  recovery action calls `window.location.reload()` rather than remounting a
  cached rejected dynamic module.
- **AC-STUDIO-STATIC-012:** All Studio locales emit explicit `og:image` and
  `twitter:image` metadata; artifact verification rejects either omission.
- **AC-STUDIO-STATIC-013:** Server HTML, first hydration, and the interactive
  workspace retain the same localized H1 node in light DOM. A named slot makes
  it visible inside the hydrated shell, no Shadow DOM subtree contains an H1,
  and internal view titles use H2 or lower.
- **AC-STUDIO-STATIC-014:** Direct scripts referenced by `/en/studio` remain
  below 250 KiB Brotli. Verification also reports raw and Brotli bytes for all
  asynchronous chunks reachable from those scripts and for their combined
  graph.
- **AC-STUDIO-STATIC-015:** AI Skills, Delivery Checklists, and XYFlow remain
  reachable lazy chunks and cannot move into the direct Studio scripts.
- **AC-STUDIO-STATIC-016:** The Vietnamese-only preferences sentinel is present
  in the emitted artifact but absent from English direct scripts, the Welcome
  feature chunk, and the English core-locale chunk.
- **AC-STUDIO-STATIC-017:** The English default route, including all sibling
  chunks in its Turbopack locale and Welcome `Promise.all` loaders, stays at or
  below 204,800 bytes Brotli and contains no representative non-default runtime.
- **AC-STUDIO-STATIC-018:** All six locale sentinels are emitted in distinct,
  reachable loader groups; selecting English cannot download Vietnamese,
  Chinese, Japanese, Korean, or French core copy.
- **AC-STUDIO-STATIC-019:** Retired. The auxiliary dashboard runtime it covered
  was removed with the template routes (MEP-13, MEP-83).
- **AC-STUDIO-STATIC-020:** Every Studio boundary that can intercept a lazy or
  shell failure emits `studio_feature_load_error` with an allowlisted feature
  context and never forwards an error, message, or stack.
- **AC-STUDIO-STATIC-021:** Retired. The default dashboard and its workstream
  query were removed with the template routes (MEP-13, MEP-83).
- **AC-STUDIO-STATIC-022:** After any in-shell navigation or popstate,
  `document.title` and the single light-DOM H1 match the server metadata title
  and H1 of the URL now in the address bar (or the localized route title for
  query-only routes), and no client path change emits `studio_view`.

## Verification

- Focused source tests verify the fallback lifecycle and dynamic dependency
  boundary.
- Artifact fixtures verify no-JavaScript HTML and structured-data parity.
- Artifact fixtures also prove the exclusive 250 KiB direct-script ceiling,
  the 204,800-byte default-route ceiling, complete loader-sibling and reachable
  async accounting, representative lazy markers, and six-locale isolation.
- Source contracts verify that XYFlow occurs only behind its dynamic feature
  entry point, that no Studio source imports Recharts, and that the Shadow
  stylesheet carries no selectors for the removed template routes while flow analytics remain in the shell.
- A boundary behavior test verifies that Retry invokes the supplied reload
  callback and does not claim recovery by merely resetting boundary state. It
  invokes every failure reporter and verifies the exact telemetry allowlist.
- A production export is required before release to measure route JS bytes and
  confirm the emitted HTML contract.
