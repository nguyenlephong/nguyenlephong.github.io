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
- Keep the existing query/hash Studio navigation contract and analytics event
  names.
- Load optional visualization runtimes only from modules that render them.
  Static text and navigation must not depend on those libraries.
- Keep Recharts and XYFlow behind separate dynamic feature boundaries. The
  default/welcome module imports neither runtime; flow state and analytics stay
  in the shell while the canvas uses a narrow typed adapter.
- Load an auxiliary dashboard and its route runtime through one outer lazy
  loader. The outer entry statically owns the dashboard runtime; only genuinely
  heavy capabilities such as Recharts remain behind a nested lazy boundary.
- Keep the direct English Studio entry below 250 KiB Brotli. The artifact gate
  follows emitted Turbopack chunk references, treats every `Promise.all` loader
  group as one atomic download, and hard-gates the English default route at
  204,800 bytes Brotli. It also reports the complete reachable asynchronous
  total, so moving bytes behind `import()` remains visible rather than appearing
  as a bundle reduction.
- Treat Mail, AI Skills, Delivery Checklists, auxiliary dashboards, Recharts,
  and XYFlow as representative lazy features. Stable emitted markers for each
  feature must exist in a reachable asynchronous chunk and must not occur in a
  directly referenced Studio script.
- Keep each of the six Studio locale entries isolated. Stable preferences
  sentinels identify their emitted loader groups; every sibling required by the
  selected English locale and Welcome loaders counts toward the default-route
  budget, while all five non-English sentinels are forbidden from that set.
- A visualization chunk failure renders localized text without unmounting the
  Studio workspace. Its recovery control reloads Studio, because retrying the
  same cached rejected lazy module is not reliable.
- Report shell, route, dashboard, Recharts, and XYFlow boundary failures through
  `studio_feature_load_error`. Its boundary callback accepts no error object and
  emits only `feature_id`, `locale`, and optional `route_id`/`route_kind`.
- The default dashboard derives its displayed workstream count from the filtered
  result. A zero-result query exposes a localized status and clear action; clear
  uses the same canonical query serializer as every other dashboard filter.
- Every localized Studio metadata object explicitly publishes Open Graph and
  Twitter images through the locale root OG image route.

## Non-goals

- This change does not replace Studio's query/hash router with nested routes.
- It does not redesign the interactive flow editor or change its state model.
- It does not make Studio modules independently canonical or add query URLs to
  the sitemap; `/[locale]/studio` remains the only canonical collection URL.

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
- **AC-STUDIO-STATIC-007:** The welcome route does not statically import the
  Recharts runtime; chart code is loaded as a separate dynamic module.
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
- **AC-STUDIO-STATIC-011:** Recharts is loaded only by the delivery-signal
  feature. Recharts and XYFlow failures have localized fallbacks whose recovery
  action calls `window.location.reload()` rather than remounting a cached
  rejected dynamic module.
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
- **AC-STUDIO-STATIC-015:** Mail, AI Skills, Delivery Checklists, auxiliary
  dashboards, Recharts, and XYFlow remain reachable lazy chunks and cannot move
  into the direct Studio scripts.
- **AC-STUDIO-STATIC-016:** The Vietnamese-only preferences sentinel is present
  in the emitted artifact but absent from English direct scripts, the Welcome
  feature chunk, and the English core-locale chunk.
- **AC-STUDIO-STATIC-017:** The English default route, including all sibling
  chunks in its Turbopack locale and Welcome `Promise.all` loaders, stays at or
  below 204,800 bytes Brotli and contains no representative non-default runtime.
- **AC-STUDIO-STATIC-018:** All six locale sentinels are emitted in distinct,
  reachable loader groups; selecting English cannot download Vietnamese,
  Chinese, Japanese, Korean, or French core copy.
- **AC-STUDIO-STATIC-019:** The auxiliary dashboard runtime is loaded atomically
  by one outer route loader with no wrapper-to-runtime waterfall, and that
  loader does not preload the Recharts runtime.
- **AC-STUDIO-STATIC-020:** Every Studio boundary that can intercept a lazy or
  shell failure emits `studio_feature_load_error` with an allowlisted feature
  context and never forwards an error, message, or stack.
- **AC-STUDIO-STATIC-021:** The default dashboard displays the filtered
  workstream count. A zero-result state and clear action are localized in all six
  Studio locales, and clearing removes dashboard query keys through
  `writeStudioDashboardQuery()` while preserving the active route.

## Verification

- Focused source tests verify the fallback lifecycle and dynamic dependency
  boundary.
- Artifact fixtures verify no-JavaScript HTML and structured-data parity.
- Artifact fixtures also prove the exclusive 250 KiB direct-script ceiling,
  the 204,800-byte default-route ceiling, complete loader-sibling and reachable
  async accounting, the single-hop auxiliary dashboard loader, Recharts
  exclusion from that loader, representative lazy markers, and six-locale
  isolation.
- Source contracts verify that Recharts and XYFlow occur only behind their
  dynamic feature entry points while flow analytics remain in the shell.
- A boundary behavior test verifies that Retry invokes the supplied reload
  callback and does not claim recovery by merely resetting boundary state. It
  invokes every failure reporter and verifies the exact telemetry allowlist.
- Dashboard query tests verify zero-result serialization and canonical clearing;
  a browser smoke should exercise the same deep link and clear action when a
  browser runtime is available.
- A production export is required before release to measure route JS bytes and
  confirm the emitted HTML contract.
