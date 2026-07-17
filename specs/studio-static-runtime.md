# Studio static runtime and crawlable overview

## Context

Studio is a static-exported public route, but its UI is mounted into a Shadow
DOM after hydration. Without JavaScript the exported page previously contained
an empty shadow host, so people and crawlers could not read any Studio content.
The client shell also imported visualization libraries into its entry module,
even when a visitor opened the lightweight welcome route.

## Decision

- Export a concise, localized Studio overview as ordinary HTML inside the
  shadow host. It remains visible without JavaScript and is replaced only after
  the ShadowRoot is ready.
- Keep exactly one visible page heading: the static overview owns the H1 before
  hydration; the active Studio module owns it after the fallback is removed.
- Publish crawlable module links in the overview and mirror those exact URLs in
  the `CollectionPage.hasPart` graph.
- Keep the existing query/hash Studio navigation contract and analytics event
  names.
- Load optional visualization runtimes only from modules that render them.
  Static text and navigation must not depend on those libraries.
- Keep Recharts and XYFlow behind separate dynamic feature boundaries. The
  default/welcome module imports neither runtime; flow state and analytics stay
  in the shell while the canvas uses a narrow typed adapter.
- A visualization chunk failure renders localized text without unmounting the
  Studio workspace. Its recovery control reloads Studio, because retrying the
  same cached rejected lazy module is not reliable.
- Every localized Studio metadata object explicitly publishes Open Graph and
  Twitter images through the locale root OG image route.

## Non-goals

- This change does not replace Studio's query/hash router with nested routes.
- It does not redesign the interactive flow editor or change its state model.
- It does not make Studio modules independently canonical or add query URLs to
  the sitemap; `/[locale]/studio` remains the only canonical collection URL.

## Acceptance criteria

- **AC-STUDIO-STATIC-001:** Every supported locale exports a meaningful Studio
  overview containing one visible H1, a concise introduction, module
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

## Verification

- Focused source tests verify the fallback lifecycle and dynamic dependency
  boundary.
- Artifact fixtures verify no-JavaScript HTML and structured-data parity.
- Source contracts verify that Recharts and XYFlow occur only behind their
  dynamic feature entry points while flow analytics remain in the shell.
- A boundary behavior test verifies that Retry invokes the supplied reload
  callback and does not claim recovery by merely resetting boundary state.
- A production export is required before release to measure route JS bytes and
  confirm the emitted HTML contract.
