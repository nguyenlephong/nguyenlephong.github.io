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
- Require a deferred-stats marker in the Blog and Notes direct scripts, and
  reject stable Firebase configuration and Firestore loader markers from those
  same initial graphs. This source-independent artifact check complements the
  Brotli ceilings: a provider can regress eagerly without first exceeding a
  byte budget.
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
- Discover Next.js route social images only from the concrete routes in
  `.next/prerender-manifest.json`; a matching basename elsewhere in `out/` does
  not establish ownership. Require one regular artifact form per declared
  route, canonicalize Unicode and percent-encoded path segments, then group the
  declared candidates by SHA-256 digest. A byte-identical group keeps
  `/opengraph-image.png` when present; otherwise it keeps the shortest URL and
  then the lexical winner.
- Rewrite exact root-relative or same-origin aliases only as complete,
  consumer-aware URL values: relevant HTML/HTM attributes, source-set
  candidates, inline style attributes and style blocks parsed as CSS, JSON/Web
  Manifest string values, structural RSC/TXT quoted values, and CSS `url(...)`
  arguments. Source-set candidates support `x` and `w` descriptors and fail
  closed on malformed descriptors without splitting commas inside `data:` URLs.
  Preserve query, fragment, slash escaping, quote style, and surrounding source
  formatting. JavaScript files, arbitrary HTML script bodies, CSS
  strings/comments, ordinary prose,
  protocol-relative values, external origins, and aliases embedded inside
  non-HTTP values are excluded. The sole script-body exception is an AST-proven
  `self.__next_f.push(...)` payload: decode only its JavaScript string literals,
  apply the structural RSC/TXT rules, and re-encode only changed source spans.
  An independent context-aware alias-absence proof must pass before pruning;
  the artifact verifier independently resolves the same consumer contexts to
  remaining local files.
- Apply normalization writes, consumer rewrites, and duplicate removals through
  an in-output same-filesystem transaction workspace created only after the
  artifact inventory. Preflight the complete plan before the
  first mutation, back up every changed file, journal state transitions, roll
  back handled failures, and recover stale `applying` journals before building
  the shared artifact inventory. Persist a manifest-bound committed route map
  bound to the output directory identity before transaction commit so only a
  same-tree second invocation can prove intentional pruning and remain
  idempotent. Hold one output-scoped transform lock through OG and offline
  generation. Run this transform before deriving the offline manifest so page
  versions describe the final HTML.
- Expose the official dependency-free Next.js analyzer as
  `npm run analyze`. Its output remains under the ignored
  `.next/diagnostics/analyze` directory.
- Measure initial document CSS for representative Home, About, Gallery, Apps,
  English practice, offline, Blog archive, Notes archive, Blog article, and
  Notes article HTML entries. Each route has an explicit maximum local
  stylesheet count and total Brotli ceiling based on a fresh complete export;
  missing samples or stylesheets fail closed.
- Verify CSS ownership from parsed and normalized emitted selectors rather than
  hashed chunk names or minifier-specific serialization. A route must contain
  its declared owner selectors and must not contain selectors owned by unrelated
  surfaces. PostCSS owns the stylesheet grammar and a selector AST owns exact
  class-token matching, including nested rules and `@scope` roots and limits;
  declarations, custom-property value blocks, and keyframe frames are not
  selectors. The gate reports both raw and Brotli totals, while Brotli bytes and
  request count are the hard transfer guards.

The first hard ceilings are the 2026-07-18 fixed-date baseline plus a narrow
route-level tolerance. They are regression guards, not performance goals. The
total RSC warning has more capacity runway because it includes legitimate
content growth. Each later optimization commit must lower the relevant hard
ceiling after its new baseline is verified.

After the deferred engagement boundary, the 2026-07-20 complete export measured
Blog at 213,534 bytes and Notes at 213,444 bytes Brotli. Their hard ceilings are
therefore lowered from 219,136 to 217,088 bytes, retaining a small build-variance
allowance while locking in the verified reduction.

After the route-owned CSS split and dead Notes-chambers cleanup, the 2026-07-20
complete export measured the following initial document CSS. The prior shared
bundle cost 19,439 Brotli bytes
on non-content routes, 27,474 on Blog, and 30,800 on Notes. The new routes remain
below those transfer baselines even where one route-owned stylesheet adds a
request. Hard limits retain a narrow deterministic-build allowance:

| Route | Stylesheets | Measured raw | Measured Brotli | Brotli limit |
|-------|-------------:|-------------:|----------------:|--------------:|
| Home | 3 | 43,743 | 8,990 | 9,216 |
| About | 3 | 30,045 | 6,666 | 6,912 |
| Gallery | 3 | 37,661 | 7,826 | 8,192 |
| Apps | 3 | 42,422 | 8,812 | 9,216 |
| English practice | 3 | 36,573 | 7,599 | 7,936 |
| Offline | 3 | 24,988 | 5,761 | 6,144 |
| Blog archive | 3 | 73,416 | 13,188 | 13,568 |
| Notes archive | 4 | 80,874 | 15,144 | 15,616 |
| Blog article | 4 | 95,826 | 17,632 | 18,176 |
| Notes article | 5 | 103,284 | 19,588 | 20,096 |

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
- **AC-SPB-023:** Blog and Notes direct JavaScript contains the declared
  deferred archive marker and none of the configured Firebase/Firestore
  provider markers; malformed or empty marker configuration fails closed.
- **AC-SPB-024:** The complete-export browser gate observes zero same-origin RSC
  and engagement-provider chunk requests on an untouched Blog archive,
  permits category hover to prefetch only its destination, and confirms first
  scroll reaches the deferred stats provider.
- **AC-SPB-025:** The same browser gate emulates `Save-Data`, requires the Notes
  archive to report a skipped state, and observes no provider chunk after
  scrolling.
- **AC-SPB-026:** The complete export measures the configured ten-route public
  CSS matrix, fails on missing or duplicate route samples, and enforces each
  route's maximum local stylesheet count and total Brotli bytes.
- **AC-SPB-027:** Emitted public CSS is checked with stable owner selectors, so
  Home, About, Gallery, Apps, English practice, offline, and reader styles
  cannot leak into unrelated initial routes even when chunk hashes change.
- **AC-SPB-028:** The source contract rejects client-side dynamic CSS imports,
  keeps shared selectors in `globals.css`, and requires the reader stylesheet
  only from both nested article layouts.
- **AC-SPB-029:** The source contract inventories every CSS import in every
  `src/app` TypeScript entry and requires the exact importer set for document,
  global, route, Blog, Notes, and reader stylesheets; an extra importer fails.
- **AC-SPB-030:** Owner isolation parses normalized selector lists through the
  nested at-rule contexts used by the emitted CSS. Equivalent whitespace or
  minifier formatting cannot create false failures, while missing and unrelated
  owner selectors still fail.
- **AC-SPB-031:** Notes archive and article budgets use the complete export after
  removing the unconsumed chambers, entry, and chamber-navigation rules. The
  dynamically constructed English result-state selectors remain because they
  have a runtime consumer.
- **AC-SPB-032:** The CSS import inventory resolves only string literals,
  no-substitution templates, recursively static template interpolations, and
  literal `+` concatenations. Any unresolved `import()` or `require()` module
  specifier fails closed, even when its source text does not contain `.css`.
- **AC-SPB-033:** Emitted selector ownership uses PostCSS plus a selector AST,
  includes `@scope` root and limit selectors, matches exact class tokens, and
  excludes declaration values, custom-property blocks, and standard or
  vendor-prefixed keyframe frames.
- **AC-SPB-034:** A type-only CSS import is reported as non-runtime and cannot
  satisfy a stylesheet's declared importer. Type-only non-CSS imports remain
  outside the stylesheet inventory.
- **AC-SPB-035:** Byte-identical emitted OpenGraph/Twitter route images retain
  one deterministic canonical artifact. Different digests and non-social PNGs
  are preserved, and a second post-build run performs no further rewrite or
  deletion.
- **AC-SPB-036:** Duplicate route social images are removed only after every
  HTML and RSC/text consumer has been rewritten and validated. The artifact
  verifier fails on any remaining local social-image URL whose target is
  missing.
- **AC-SPB-037:** Offline manifest generation runs after social-image
  canonicalization, remains sorted and unique, and hashes the final rewritten
  HTML without owning a removed duplicate URL.
- **AC-SPB-038:** Social-image candidates come only from valid concrete
  `prerender-manifest.json` image routes. A missing, ambiguous, non-regular, or
  inconsistent declared artifact fails before mutation, while a manual
  lookalike PNG outside that inventory remains untouched.
- **AC-SPB-039:** Canonicalization rewrites only exact root-relative or exact
  same-origin Unicode/percent-normalized paths in HTML, HTM, RSC, TXT, JSON,
  CSS, and Web Manifest files; it preserves query, fragment, and escaped-slash
  form, does not use suffix matching, and never rewrites JavaScript or an
  external origin.
- **AC-SPB-040:** Normalization, consumer promotion, and prune failures restore
  the byte-identical pre-run tree. A stale applying journal is recovered before
  inventory creation, path collisions fail during preflight, and a committed
  manifest-bound route map makes a second run a no-op.
- **AC-SPB-041:** Consumer planning reads the supported corpus without adding it
  to the shared content cache, spools only changed bodies into the in-output
  transaction workspace, and retains a concurrency-bounded working set rather
  than the complete HTML/RSC/TXT corpus.
- **AC-SPB-042:** One PID/token-owned transform lock covers stale recovery,
  inventory, OG commit, and offline derivation. A live owner is never displaced;
  a dead owner can be retired safely. Committed route state is bound to the
  output directory identity and invalidated before the official wrapper creates
  a fresh export.
- **AC-SPB-043:** The final preflight verifies expected byte length and SHA-256
  for every existing write/removal immediately before `applying`. A failure in
  `prepared` state performs no rollback mutation, and URL rewriting ignores
  protocol-relative and non-HTTP schemes including `data:`, `urn:`, `mailto:`,
  and `javascript:`.
- **AC-SPB-044:** Social-image rewriting and missing-target verification operate
  only on complete URL tokens appropriate to each consumer: HTML metadata/asset
  attributes, source sets, inline style attributes and style blocks parsed as
  CSS, JSON/Web Manifest string values, structural RSC/TXT quoted values, and
  CSS `url(...)` arguments. Aliases embedded in arbitrary script text,
  JSON/RSC strings whose complete value is non-HTTP or prose,
  CSS strings/comments/data URLs, or larger path substrings remain byte-identical;
  surrounding whitespace, quote style, query/fragment text, and escaped-slash
  form are preserved.
- **AC-SPB-045:** Inline Next Flight metadata is rewritten only inside an
  AST-recognized `self.__next_f.push(...)` call. Its JavaScript string literals
  are decoded, transformed with the structural Flight quoted-value contract,
  and re-encoded through byte-local source spans; escaped Unicode and
  query/fragment text remain valid. A recognized malformed payload fails before
  mutation. Arbitrary inline scripts and external JavaScript
  remain untouched, and post-build verification finds no removed alias in
  visible metadata, RSC/TXT consumers, or recognized Flight payloads.
- **AC-SPB-046:** If an `applying` transaction cannot complete rollback, its
  journal, backups, and moved files remain in the reported in-output recovery
  workspace. The next lock owner retries that rollback before inventory; a
  repeated recovery failure remains fail-closed and preserves the workspace.
- **AC-SPB-047:** Social-image aliases in CSS `url(...)` values inside HTML
  `style` attributes and `<style>` bodies are rewritten and independently
  verified. CSS strings, comments, and non-HTTP/data values remain byte-identical.
- **AC-SPB-048:** `srcset` and `imagesrcset` parsing accepts comma-adjacent
  candidates with valid positive `x` or `w` descriptors, treats commas inside a
  `data:` URL as URL data, and aborts before mutation on malformed, duplicate,
  or mixed descriptor forms.
- **AC-SPB-049:** The official build wrapper acquires the output-scoped lock
  before invalidating export detail or committed OG state and before deleting
  the prior output. It holds that lock through Next export and the shared
  postbuild pipeline, avoids nested acquisition for its owned postbuild call,
  and releases it on build, postbuild, or preparation failure. Direct postbuild
  invocation still acquires the same lock.
- **AC-SPB-050:** Every HTML URL-bearing `content`, `href`, `src`, `srcset`,
  `imagesrcset`, and `style` attribute is interpreted after decoding named
  `quot`, `apos`, `amp`, `lt`, and `gt` references plus valid decimal and
  hexadecimal numeric references. An unchanged semantic value remains
  byte-identical; a changed value is re-encoded only within its original
  double-quoted, single-quoted, or unquoted attribute context. Unknown or
  malformed references intersecting a candidate URL fail before mutation.
  Source-set density descriptors accept every finite positive HTML
  valid-floating-point form, including exponent notation, while width remains
  a positive integer; zero, negative, non-finite, malformed, and mixed
  descriptor kinds fail closed in both transformation and verification.
- **AC-SPB-051:** AC-SPB-050's enumerated entity set and unknown-reference
  failure rule are superseded by the HTML parser contract. Before URL,
  source-set, or CSS parsing, the complete raw attribute is decoded in HTML
  attribute context by the direct build-only `entities` dependency, including
  the full named-reference table, numeric replacement rules, multi-code-point
  references, and legacy semicolon behavior. A reference that the HTML parser
  does not decode remains literal rather than becoming an error. Unchanged
  semantic attributes remain byte-identical; a changed attribute is encoded
  for its original quote or unquoted context and must parse back to the
  transformed decoded value. Density uses exactly
  `(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?` before the `x` suffix and must
  also be finite and greater than zero, so `1`, `1.0`, `.5`, `1e0`, and
  `1.0e+2` are accepted while `1.`, `1.e2`, zero, negative, non-finite, and
  mixed descriptor forms fail closed.

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
- Run archive marker fixtures plus the complete-export runtime boundary check
  for untouched, category-hover, first-scroll, and `Save-Data` paths.
- Run public-CSS artifact fixtures for request-count overflow, Brotli overflow,
  missing route stylesheets, normalized selector equivalence through nested
  at-rules and `@scope`, custom-property block exclusion, keyframe exclusion,
  missing owners, and unrelated owner leakage. Run source fixtures for static
  template and binary module specifiers plus unresolved identifier and function
  expressions.
- Run social-image fixtures for authoritative inventory failure, Unicode and
  escaped URLs, external-origin and substring exclusion, every supported
  consumer extension, JavaScript exclusion, collision preflight, three injected
  transaction phases, incomplete-rollback workspace preservation and retry,
  prepared-state and digest drift, live/dead and whole-build lock behavior,
  concurrent destructive-prepare exclusion, HTML CSS contexts, valid and
  malformed source sets including exponent density forms, React-escaped and
  numeric and full named HTML attribute entities, parser-equivalent legacy and
  non-decoding reference behavior, fresh-output state isolation, bounded
  planning memory, stale-journal recovery, and idempotence.
- Run `npm run verify:performance-artifact` against the fixed-date production
  export.
- Run `npm run analyze` when investigating a bundle regression; the interactive
  output is local evidence and is not deployed.
- Run type-check, strict lint, and the full unit suite before committing.

Official command reference:
https://nextjs.org/docs/app/api-reference/cli/next#next-experimental-analyze
