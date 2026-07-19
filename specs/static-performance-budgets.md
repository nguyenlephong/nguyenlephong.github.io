# Static artifact performance budgets

## Context

The existing artifact verifier limits raw files and total export size. Those
ceilings protect GitHub Pages capacity, but they do not catch smaller client
bundle regressions or growth hidden across thousands of Next.js RSC payloads.
The static export therefore needs a second gate based on transfer-oriented and
route-oriented measurements.

## Decision

- Keep the existing raw artifact budgets unchanged.
- Measure direct JavaScript referenced by the English home, Blog, Notes, and
  Studio HTML entries. Compress each emitted chunk with Brotli and enforce a
  per-surface ceiling.
- Pin those four samples to `en.html`, `en/blog.html`, `en/notes.html`, and
  `en/studio.html`. Missing, extra, or aliased route mappings invalidate the
  configuration instead of measuring the same route twice.
- Classify an exported `.txt` file as RSC when its basename begins with
  `__next.` or when a sibling `.html` route exists. This excludes public files
  such as `robots.txt` and `ads.txt` without relying on a growing exclusion
  list.
- Report total RSC bytes against an advisory capacity threshold. Total export
  size naturally grows with valid content, so this signal must stay visible
  without turning normal publishing into a route-performance failure.
- Enforce an exact, unique 24-route matrix covering six locales and home,
  Blog, Notes, and Studio. The average payload and each route's surface ceiling
  are hard gates, catching both broad regressions and a single localized spike.
- Extend the raw route-asset samples with the most nested fixed-date curated
  hubs: `en/blog/series/foundations/page/2.html` and
  `vi/notes/topics/thoughts/page/5.html`. The 52 new EN/VI routes increase
  capacity usage but do not raise a file, byte, route-asset, JavaScript, CSS, or
  RSC ceiling.
- Keep the locale root server-only for translations. Client Components receive
  messages through fail-closed, surface-scoped providers: shared site chrome,
  home, Blog, Notes, Gallery, and the currently dormant Thoughts surface each
  have an explicit namespace allowlist.
- Inventory every supported Next.js source module (`.js`, `.jsx`, `.ts`,
  `.tsx`, `.mjs`, and `.mts`) with the TypeScript AST. Provider-dependent
  `next-intl` hooks and locale-navigation imports must use direct named imports
  and map to an allowed public scope. Namespace imports, re-exports, dynamic
  loading, CommonJS loading, and indirect hook references fail closed.
  `next-intl/navigation` and `createNavigation` are reserved for the canonical
  navigation adapter. Raw `NextIntlClientProvider` usage is reserved for the
  scoped adapter, direct `use-intl` imports are forbidden, and every
  `ScopedIntlProvider` placement has an exact file and literal-scope contract.
- Build a static local dependency graph from the Studio page and every Studio
  Client Component root. Alias and relative imports, value re-exports, and
  literal dynamic/CommonJS loads are traversed transitively. Studio must not
  reach a provider, provider-dependent hook consumer, or locale-navigation
  runtime, including an otherwise approved shared public component.
- Parse serialized next-intl provider props from every localized route-level
  `.txt` payload with a sibling `.html` page. The locale root requires site and
  home scopes. Gallery requires site and Gallery. Blog collection, category,
  and positive-integer pagination routes require site and Blog; Notes collection
  and positive-integer pagination routes require site and Notes. Articles and
  other public static pages require site only. Curated Blog series and Notes
  topic hubs are intentionally in this site-only class: their grouping and
  nine-card slice are server-rendered and they do not mount Explorer. Every
  Studio route requires zero providers.
- Count every serialized `messages` occurrence before classification. Null,
  primitive, array, malformed, and empty values are providers but cannot match a
  scope. Every valid non-empty message structure must match exactly one declared
  scope, and each route must contain exactly one instance of every required
  scope with no extras or duplicates.
- Keep heavy Studio dashboards, ReactFlow, Recharts, and Firebase/Firestore
  markers out of the initial Studio scripts. Require the Shadow host marker in
  the direct scripts and require Studio route analytics/module markers in the
  reachable chunk graph, so valid route splitting cannot look like a missing
  runtime and an accidental empty or unrelated bundle cannot pass.
- Enforce the Studio direct-script ceiling at 176,128 bytes Brotli, a narrow
  allowance over the 2026-07-19 measured 169,964-byte entry. Parse emitted
  Turbopack `Promise.all` loader groups as atomic downloads, including every
  sibling chunk needed by the selected locale and Welcome route. Hard-gate the
  resulting default-route total at 204,800 bytes Brotli over its measured
  199,659-byte baseline. Continue to report the complete reachable asynchronous
  and combined totals as observability signals because feature growth and
  entry-route latency are separate concerns.
- Require representative lazy markers for Mail, AI Skills, Delivery
  Checklists, auxiliary dashboards, ReactFlow, and Recharts in reachable async
  chunks, and reject any of them from the default-route loader path. Locate all
  six locale loaders with stable, locale-specific sentinels, require an isolated
  Turbopack loader group for each one, and reject cross-locale copy from the
  selected English entry/default set.
- Allow only the documented analytics and advertising origins in Studio
  preconnect or DNS-prefetch markup. This is an allowlist, not a requirement to
  keep every current provider; later runtime work may remove an origin and
  tighten the contract.
- Use one `artifact-index` inventory for route discovery and cached HTML and
  JavaScript reads. File sizes use metadata reads, and localized RSC bodies are
  checked sequentially outside the content cache, so the complete scope scan
  does not retain the full corpus in Node.js memory.
- Expose the official dependency-free Next.js analyzer as
  `npm run analyze`. Its output remains under the ignored
  `.next/diagnostics/analyze` directory.

The first hard ceilings are the 2026-07-18 fixed-date baseline plus a narrow
route-level tolerance. They are regression guards, not performance goals. The
total RSC warning has more capacity runway because it includes legitimate
content growth. Each later optimization commit must lower the relevant hard
ceiling after its new baseline is verified.

## Acceptance criteria

- **AC-SPB-001:** CI, GitHub Pages, and Firebase deployment paths fail when any
  per-surface initial JavaScript Brotli ceiling is exceeded.
- **AC-SPB-002:** Total exported RSC `.txt` bytes report an advisory capacity
  warning, while the average localized route sample remains a hard limit.
- **AC-SPB-003:** Adding a heavy Studio runtime marker, Firebase marker, or an
  unapproved third-party connection to the initial Studio surface fails the
  build gate; required route/module markers must remain reachable through the
  emitted chunk graph.
- **AC-SPB-004:** Missing route, script, or localized payload samples fail
  closed instead of reporting a zero-sized success.
- **AC-SPB-005:** The verifier scans the artifact inventory once and avoids
  caching every RSC body while summing file sizes.
- **AC-SPB-006:** `npm run analyze` uses
  `next experimental-analyze --output` and adds no analyzer dependency.
- **AC-SPB-007:** The localized RSC sample configuration contains exactly one
  deterministic path for each locale/surface pair; duplicates, omissions, and
  per-surface route spikes fail the build gate.
- **AC-SPB-008:** The guarded legacy Pages publisher runs both
  `verify:artifact` and `verify:performance-artifact` after its final `out/`
  mutation and before staging the tree.
- **AC-SPB-009:** Initial JavaScript configuration contains exactly the four
  canonical English route samples; missing, extra, or duplicate paths fail
  before artifact measurement.
- **AC-SPB-010:** The locale root injects no client translation catalog and the
  Studio artifact serializes none; a full catalog or an undeclared namespace
  on any localized route fails the build gate.
- **AC-SPB-011:** All localized route artifacts expose their derived site and
  surface scopes exactly once, so a missing or duplicate provider fails before
  deployment.
- **AC-SPB-012:** Every provider-dependent `next-intl` client hook uses a direct
  named import and maps to an allowed public route scope; Studio hook consumers
  and import indirection fail the source gate.
- **AC-SPB-013:** Scoped message matching includes empty object and array
  branches, so an undeclared empty namespace cannot pass as an invisible leaf.
- **AC-SPB-014:** Source inventory allows the raw provider only in the scoped
  adapter, rejects `use-intl`, and enforces the exact file and literal scope for
  every scoped provider. Provider-dependent locale navigation follows the same
  public-scope contract, with no Studio consumer.
- **AC-SPB-015:** The artifact verifier derives provider scopes for every
  localized route-level RSC/HTML pair and counts every serialized `messages`
  value. Unsampled articles, pagination routes, null providers, and future
  public static routes cannot bypass the gate.
- **AC-SPB-016:** Empty Blog, Notes, and category collections retain their
  declared surface provider, and Studio transitive dependencies cannot reach a
  scoped provider, provider-dependent hook consumer, or locale-navigation
  runtime through an intermediate local module.
- **AC-SPB-017:** The direct English Studio entry is strictly smaller than 250
  KiB Brotli, while the Studio verifier reports async-reachable and combined
  JavaScript totals from the same emitted chunk graph.
- **AC-SPB-018:** Representative Studio features remain reachable but absent
  from direct scripts; Vietnamese core copy is emitted but absent from the
  English direct, Welcome, and default-locale chunks.
- **AC-SPB-019:** The Studio default-route budget includes every sibling in the
  selected Turbopack locale and Welcome loader groups, remains at or below
  204,800 bytes Brotli, and cannot preload any representative non-default route.
- **AC-SPB-020:** English, Vietnamese, Chinese, Japanese, Korean, and French
  each expose a distinct reachable locale sentinel through an isolated loader
  group; the selected English route path contains no sentinel from another
  locale.
- **AC-SPB-021:** Raw route-asset verification includes the nested Blog series
  page two and Notes `thoughts` page five artifacts without increasing an
  existing ceiling for the 52-route expansion.
- **AC-SPB-022:** Curated series and topic routes serialize exactly the shared
  `site` message scope, with no Blog/Notes surface provider or full Explorer
  search payload.

## Verification

- Run mocked artifact fixtures for compressed growth, advisory total RSC
  growth, average and single-route RSC growth, duplicate or missing samples,
  aliased initial routes, all-route scoped client message drift, empty structural
  branches, null providers, article, archive pagination, and curated hub route
  derivation, provider placement and client-import escapes, empty collection
  placement, transitive Studio imports, Studio markers, missing artifacts, and
  third-party origin drift.
- Verify route assets for `en/blog/series/foundations/page/2.html` and
  `vi/notes/topics/thoughts/page/5.html` in the fixed-date production export.
- Run the focused Studio artifact fixtures for direct/default budget overflow,
  complete `Promise.all` sibling accounting, reachable async accounting,
  all-route preload rejection, eager feature markers, and six-locale isolation.
- Run `npm run verify:performance-artifact` against the fixed-date production
  export.
- Run `npm run analyze` when investigating a bundle regression; the interactive
  output is local evidence and is not deployed.
- Run type-check, strict lint, and the full unit suite before committing.

Official command reference:
https://nextjs.org/docs/app/api-reference/cli/next#next-experimental-analyze
