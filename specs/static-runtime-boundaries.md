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
- Canonicals, `hreflang`, static parameters, metadata routes, analytics event
  names, and static export behavior remain unchanged.

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
- Changing URLs, locale fallbacks, sitemap policy, or content schemas.
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
- **AC-SRB-006:** Public pages preserve their canonical paths, metadata, static
  parameters, localization, and analytics wiring. The public Studio link uses
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

## Verification

- Compare normalized route-entry inventories before and after the move.
- Run the static runtime boundary test and path-sensitive public route tests.
- Run `npm run verify:artifact` against the complete export and confirm the
  20,000-file and 600 MiB limits, 75-percent warning threshold, and exact
  bidirectional sitemap-to-published-HTML parity.
- Run `npm run verify:performance-artifact` and confirm the Studio initial
  document, required Shadow, and combined initial CSS stay within 3,072,
  16,384, and 18,432 Brotli bytes respectively.
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
cleanly across Blog article path changes without forcing a document reload.
