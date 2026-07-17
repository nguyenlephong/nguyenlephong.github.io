# Static runtime boundaries

## Context

The localized root layout currently mounts the public navigation, footer,
offline runtime, motion runtime, route progress, and reader controls for every
route. Studio then hides those elements with CSS even though their client code,
effects, event listeners, and markup still load and hydrate.

This change keeps every public URL stable while using a pathless App Router
route group to give public pages and Studio different runtime boundaries.

## Decision

- `src/app/[locale]/layout.tsx` remains the locale document boundary. It owns
  locale validation, static locale parameters, shared metadata, the
  internationalization provider, and global analytics scripts.
- All localized routes except Studio live under
  `src/app/[locale]/(site)`. Route groups are omitted from generated URLs.
- `src/app/[locale]/(site)/layout.tsx` owns public-only chrome and runtime:
  theme and reading-preference scripts, motion, route progress, offline
  navigation and status, Web Vitals reporting, header, footer, and reader
  tools.
- Studio remains at `src/app/[locale]/studio`, outside the public route group.
  It must not render, hydrate, or hide public-only chrome.
- Canonicals, `hreflang`, static parameters, metadata routes, analytics event
  names, and static export behavior remain unchanged.

## Measured artifact impact

The pathless `(site)` route group adds one App Router segment to each public
route without changing its URL. Next.js consequently emits about 2,144
additional route-group RSC segment files. In the complete production artifact,
that isolation costs only about 6.5 MiB but raises the inventory to 26,463
files and 673.7 MiB.

The file-count ceiling is therefore 27,500. This is a compatibility allowance
for the measured runtime-isolation cost, not a new growth target: it leaves
only 1,037 files (about 3.9 percent) of headroom. The 850 MiB byte ceiling and
904-URL sitemap floor remain unchanged so unrelated output growth or SEO
regressions still fail verification.

## Non-goals

- Redesigning public navigation, footer, reader tools, or Studio.
- Changing URLs, locale fallbacks, sitemap policy, or content schemas.
- Replacing global analytics or changing existing event names.
- Splitting the Studio feature bundle; that is a separate runtime optimization.

## Acceptance criteria

Acceptance criteria IDs are append-only. New criteria must receive a new ID;
existing IDs must not be renamed or renumbered.

- **AC-SRB-001:** Every localized non-Studio route entry is nested under the
  `(site)` route group and resolves to the same URL as before the move.
- **AC-SRB-002:** The normalized route-entry inventory has no missing or
  duplicate URL paths after route-group segments are removed.
- **AC-SRB-003:** The locale root layout retains locale validation, static
  locale parameters, metadata, internationalization, and global analytics.
- **AC-SRB-004:** Header, footer, motion, route progress, offline runtime, Web
  Vitals reporting, and reader tools are mounted only by the public-site
  layout.
- **AC-SRB-005:** Studio is outside `(site)` and neither renders nor hides
  public-site chrome through CSS selectors.
- **AC-SRB-006:** Public pages preserve their canonical paths, metadata,
  static parameters, localization, and analytics wiring.
- **AC-SRB-007:** Source-contract tests follow the new route-group paths and
  enforce the public/Studio runtime boundary.

## Verification

- Compare normalized route-entry inventories before and after the move.
- Run the static runtime boundary test and path-sensitive public route tests.
- Run `npm run verify:artifact` against the complete export and confirm the
  27,500-file, 850 MiB, and 904-sitemap-URL budgets.
- Run `npm run typecheck` and `npm run lint`.
- Do not require a runtime backend or server-only route for this boundary.
