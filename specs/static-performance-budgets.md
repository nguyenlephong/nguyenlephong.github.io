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
- Keep heavy Studio dashboards, ReactFlow, Recharts, and Firebase/Firestore
  markers out of the initial Studio scripts. Require stable Studio shell and
  analytics markers so an accidental empty or unrelated bundle cannot pass.
- Allow only the documented analytics and advertising origins in Studio
  preconnect or DNS-prefetch markup. This is an allowlist, not a requirement to
  keep every current provider; later runtime work may remove an origin and
  tighten the contract.
- Use one `artifact-index` inventory for HTML and JavaScript reads. File sizes
  use metadata reads so verifying roughly 200 MiB of RSC data does not retain
  the whole corpus in Node.js memory.
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
  build gate.
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

## Verification

- Run mocked artifact fixtures for compressed growth, advisory total RSC
  growth, average and single-route RSC growth, duplicate or missing samples,
  aliased initial routes, Studio markers, missing artifacts, and third-party
  origin drift.
- Run `npm run verify:performance-artifact` against the fixed-date production
  export.
- Run `npm run analyze` when investigating a bundle regression; the interactive
  output is local evidence and is not deployed.
- Run type-check, strict lint, and the full unit suite before committing.

Official command reference:
https://nextjs.org/docs/app/api-reference/cli/next#next-experimental-analyze
