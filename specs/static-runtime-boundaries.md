# Static runtime boundaries

## Context

Before the pathless route group was introduced, the localized root layout
mounted public navigation, footer, offline runtime, motion runtime, route
progress, and reader controls for every route. Studio then hid those elements
with CSS even though their client code, effects, event listeners, and markup
still loaded and hydrated.

This change keeps every public URL stable while using a pathless App Router
route group to give public pages and Studio different runtime boundaries.

## Decision

- `src/app/[locale]/layout.tsx` remains the locale document boundary. It owns
  locale validation, static locale parameters, shared metadata, the
  server request locale, the shared PostHog bootstrap, and one Web Vitals
  reporter for both public pages and Studio. It does not mount Google Analytics
  or AdSense, a client internationalization provider, or the full message
  catalog.
- All localized routes except Studio live under
  `src/app/[locale]/(site)`. Route groups are omitted from generated URLs.
- `src/app/[locale]/(site)/layout.tsx` owns shared public-only chrome and
  runtime: Google Analytics and AdSense resources, the theme, font, and
  reading-background prepaint scripts, theme synchronization, route progress,
  offline navigation and status, header, footer, and the scoped site
  client-message provider. Those prepaint scripts remain site-wide for every
  public route. `MotionProvider` is not site-wide; only the Home and Gallery
  page entries mount it. Reader tools are not site-wide either;
  `ArticleReaderTools` is mounted only by the nested Blog and Notes article
  layouts.
- Source inventory permits scoped providers only at the public-site, home,
  Gallery, Blog collection/category, and Notes collection boundaries. Provider
  scopes must be direct string literals. Raw provider usage remains inside the
  scoped adapter, and provider-dependent locale navigation must resolve to a
  non-empty public scope. Collection providers wrap both populated and empty
  branches so the route contract does not depend on content cardinality.
- Studio remains at `src/app/[locale]/studio`, outside the public route group.
  It must not render, hydrate, or hide public-only chrome. A static local
  dependency graph starts from the Studio page and each Studio Client Component
  root, then rejects any transitive path to public providers, provider-dependent
  hooks, or locale-navigation runtime.
- The public footer enters Studio through a full-document navigation. The new
  Studio document replaces the public DOM and JavaScript realm, so it must not
  retain public Google Analytics or AdSense scripts, resource hints, account
  metadata, data-layer nodes, browser globals, or follow-up Google requests.
  Session storage may survive that document transition; in-memory public
  markers must not.
- Studio CSS ownership is measured in three explicit groups. Initial document
  CSS contains the local stylesheets and combined inline styles referenced
  directly by the Studio HTML and is capped at 3,072 Brotli bytes. Required
  Shadow CSS contains `studio/studio-shadow.css`, which the reachable Studio
  runtime applies inside the Shadow root, and is capped at 16,384 Brotli bytes.
  Total initial CSS combines both groups and is capped at 18,432 Brotli bytes.
  An external stylesheet is rejected unless its origin is explicitly
  allowlisted.
- Public CSS follows the same route ownership principle without changing the
  rendered document contract. `globals.css` contains only public base styles,
  shared chrome, accessibility defaults, and intentionally shared primitives.
  Home, About, Gallery, Apps, English practice, and the offline fallback each
  import a static route stylesheet from their Server Component page. Blog and
  Notes article layouts both import the same reader stylesheet; collection
  routes do not. The saved reading-font custom properties stay in `globals.css`
  because the public layout runs `FontScript` on every public route. CSS is
  never loaded through a client-side dynamic import. The source boundary only
  accepts dynamic module specifiers that can be reduced from literals at review
  time; unresolved `import()` and `require()` expressions fail closed.
- Route ownership is a transfer optimization, not permission to alter the
  current rendered-document policy. Static HTML headings, landmarks, canonical
  metadata, JSON-LD, locale behavior, and analytics wiring must remain stable
  while CSS is extracted. Shared selectors such as `eyebrow`, `eyebrow-dot`,
  `page-back`, and the base `tech-chip` stay global so extracting an owner cannot
  silently break another route.
- Static parameters, metadata routes, analytics event names, and static export
  behavior remain unchanged by CSS extraction. Canonical, `hreflang`, locale
  fallback, and sitemap behavior must continue to match the current
  route-specific SEO contracts. `static-page-seo-localization.md` is the
  authority for About, Apps, and Gallery and supersedes this specification's
  older blanket description of their historical SEO policy.

## Measured artifact impact

The pathless `(site)` route group adds one App Router segment to each public
route without changing its URL. Next.js consequently emits about 2,144
additional route-group RSC segment files. This remains an intentional cost of
isolating Studio from public-site runtime code, but it no longer justifies a
special compatibility ceiling. The optimized artifact uses the repository-wide
limits in `config/static-artifact-budgets.json`: 600 MiB and 20,000 files, with
warnings beginning at 75 percent of either limit.

SEO verification has no fixed sitemap-count floor. The sitemap URL set must
exactly equal the exported, indexable, self-canonical HTML URL set in both
directions after `status`, `date`, `publishAt`, and `CONTENT_BUILD_DATE` have
resolved the published corpus. This permits intentional draft or scheduled
content changes without allowing orphaned sitemap URLs or published pages that
are missing from the sitemap.

## Non-goals

- Redesigning public navigation, footer, Home or Gallery motion, Blog or Notes
  article reader tools, or Studio.
- Removing the site-wide theme, font, or reading-background prepaint scripts
  from public routes.
- Using CSS ownership work itself to change URLs, route-specific locale
  fallbacks, sitemap policy, or content schemas.
- Replacing PostHog, Google Analytics, or AdSense, or changing existing event
  names.
- Changing Studio's existing feature-level lazy-loading boundaries; those are
  governed by the Studio static runtime and performance-budget specifications.

## Acceptance criteria

Acceptance criteria IDs are append-only. New criteria must receive a new ID;
existing IDs must not be renamed or renumbered.

- **AC-SRB-001:** Every localized non-Studio route entry is nested under the
  `(site)` route group and resolves to the same URL as before the move.
- **AC-SRB-002:** The normalized route-entry inventory has no missing or
  duplicate URL paths after route-group segments are removed.
- **AC-SRB-003:** The locale root layout retains locale validation, static
  locale parameters, metadata, server internationalization context, the shared
  PostHog bootstrap, and Web Vitals reporting without loading public Google
  resources or serializing a client message catalog.
- **AC-SRB-004:** The public-site layout owns header, footer, route progress,
  offline runtime, theme synchronization, and site-wide theme, font, and
  reading-background prepaint scripts. `MotionProvider` is mounted only by Home
  and Gallery, while `ArticleReaderTools` is mounted only by nested Blog and
  Notes article layouts; neither runtime is mounted by the public-site layout or
  Studio.
- **AC-SRB-005:** Studio is outside `(site)` and neither renders nor hides
  public-site chrome through CSS selectors.
- **AC-SRB-006:** Public pages preserve the canonical paths, metadata, static
  parameters, localization, and analytics wiring required by their current
  route-specific contracts while CSS is extracted. The public Studio link uses
  full-document navigation and preserves its existing click event through
  `sendBeacon`; the resulting Studio document contains no public Google nodes,
  globals, or additional requests.
- **AC-SRB-007:** Source-contract tests follow the new route-group paths and
  enforce the public/Studio runtime boundary.
- **AC-SRB-008:** The locale root mounts exactly one Web Vitals reporter with
  locale and route context. Public routes and Studio share this reporter
  without pulling public-only chrome into Studio.
- **AC-SRB-009:** Public route artifacts contain only the declared scoped site
  and surface client-message providers; Studio contains none.
- **AC-SRB-010:** Every localized RSC route with a sibling HTML page is checked
  against its derived provider contract, including article and pagination paths;
  source-level provider placement and locale-navigation imports cannot bypass
  the public/Studio boundary.
- **AC-SRB-011:** Empty collection branches retain their declared scoped
  provider, and Studio cannot reach provider-dependent internationalization
  through alias or relative imports, value re-exports, literal dynamic imports,
  or CommonJS loading.
- **AC-SRB-012:** Every extracted public stylesheet has its declared static page
  or nested-layout importers, route-owned selectors are absent from
  `globals.css`, and shared public chrome and primitives remain global.
- **AC-SRB-013:** Blog and Notes article layouts statically import the shared
  reader stylesheet before their page-owned Blog or Notes styles enter the
  route tree; collection routes do not load reader controls or reader-material
  rules.
- **AC-SRB-014:** The CSS split preserves generated semantic HTML, the current
  route-specific canonical metadata, JSON-LD, locale behavior, analytics, and
  static-export URLs.
- **AC-SRB-015:** The complete `src/app/**/*.{ts,tsx}` CSS import graph matches
  the declared importer sets. Dynamic CSS imports and any additional route that
  imports an owner stylesheet fail the source contract; reader CSS has exactly
  the Blog and Notes nested article layouts as importers.
- **AC-SRB-016:** A persisted non-default reading font has the same computed
  body font on direct Home, direct article, Article-to-Home client navigation,
  and reloaded Home. Every first visible frame and sampled navigation frame has
  the persisted font attribute and computed stack.
- **AC-SRB-017:** CSS with no source, content, test, or emitted runtime consumer
  is removed only after literal and dynamic class-construction audit. Confirmed
  dynamic consumers, including English result states, retain their rules.
- **AC-SRB-018:** Every `import()` and `require()` module specifier in the App
  Router source graph must be statically reducible from literals, static
  template interpolations, or literal `+` concatenations. An unresolved
  identifier, call, or template interpolation fails the CSS source boundary.
- **AC-SRB-019:** Public CSS owner detection uses a standards parser and exact
  selector class tokens. Nested rules and `@scope` roots and limits are visible
  to the boundary; custom-property values and keyframe frames are not treated as
  rules owned by a route.
- **AC-SRB-020:** Type-only CSS imports fail the source boundary and do not count
  as runtime stylesheet importers; type-only non-CSS imports remain valid.

## Verification

- Compare normalized route-entry inventories before and after the move.
- Run the static runtime boundary test and path-sensitive public route tests.
- Run `npm run verify:artifact` against the complete export and confirm the
  20,000-file and 600 MiB limits, 75-percent warning threshold, and exact
  bidirectional sitemap-to-published-HTML parity.
- Run `npm run verify:performance-artifact` and confirm the Studio initial
  document, required Shadow, and combined initial CSS stay within 3,072,
  16,384, and 18,432 Brotli bytes respectively.
- Confirm representative public routes remain within their configured initial
  stylesheet-request and Brotli budgets and expose only their required
  normalized route-owner selectors.
- Run `npm run typecheck` and `npm run lint`.
- Do not require a runtime backend or server-only route for this boundary.

### Browser verification

Run `npm run verify:runtime-boundaries` against the complete export. The browser
check first proves that Google Analytics and AdSense mount on a public page. It
then follows the footer's Studio link and requires a new document navigation,
the existing `cv_nav_click` event with `sendBeacon`, preserved session storage,
and a reset in-memory marker. The Studio document must expose zero public Google
scripts, hints, metadata, data-layer nodes, globals, new Google requests, or
browser errors. The same check also verifies that article reader tools remount
cleanly across Blog article path changes without forcing a document reload. It
also persists Lora before document execution and checks direct Home, direct
article, Article-to-Home client navigation, and Home reload across first-visible
and navigation animation frames so a route transition cannot hide a font flash.
