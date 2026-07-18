# Static not-found recovery

## Why

Old links and untranslated article URLs should end in a useful place without
turning every possible missing URL into another generated route. The site is a
static export, so the hosting layer must keep returning the shared `404.html`
artifact with an HTTP 404 status.

The application has a top-level dynamic locale layout. Next.js 16.2.10's
experimental `globalNotFound` convention is therefore the narrowest way to
render one custom fallback outside that layout. It is enabled only after the
installed Next.js config schema, build entry, production export, and browser
behavior are verified by this change.

## Behavior

- The build emits one custom `out/404.html`; it does not generate fallback
  pages for the 1,272 localized content routes.
- The raw HTML is a complete, useful English recovery page. It has one `h1`,
  stable links to the English home, blog, and notes pages, and home links for
  every supported language.
- After hydration, the first supported locale segment in the requested path
  selects the copy and updates the document language and title. A missing blog
  or notes URL keeps that surface as the primary recovery link.
- Unsupported or absent locale segments fall back to English. The page never
  redirects and never reconstructs an unknown content URL.
- Recovery links point only to generated `/{locale}`, `/{locale}/blog`, and
  `/{locale}/notes` routes. They use ordinary anchors and do not prefetch.
- The static 404 stays in the offline shell so an already cached site has the
  same recovery document.

## SEO and accessibility

- The response remains a real HTTP 404 when served by the host.
- Next.js emits its automatic `noindex` for the 404 response. The page does not
  add a second robots directive, `nofollow`, a canonical, or locale alternate
  links. Missing URLs must not compete with valid pages in search results.
- The document has exactly one visible `h1`, keyboard-visible focus states,
  labelled navigation, and a useful no-JavaScript experience.

## Analytics

- `not_found_view` is the surface-specific page event. It includes
  `page_type=not_found`, the detected locale, and the requested surface.
- `not_found_recovery_click` records the selected safe target and language.
- The 404 bootstrap disables PostHog's automatic page-view and page-leave
  capture. Explicit 404 events omit pathname, search, and referrer because a
  broken URL may contain an email address, reset token, or other secret.
- Existing event names and PostHog privacy settings remain unchanged. The main
  locale layout and the global 404 use the same bootstrap component, so the
  SDK host, DNT support, disabled autocapture, disabled session recording, and
  persistence configuration cannot drift. Only one root document is rendered
  for a request, so the bootstrap is not duplicated at runtime.
- A not-found `before_send` hook recursively removes SDK-added URL, path, and
  referrer properties, including session/initial and `$set`/`$set_once` data.
  Explicit analytics calls queue locally until the lazy SDK bootstrap is ready.

## Development boundary

- Production keeps `output: "export"` and emits the same static artifact.
- Production enables the custom global not-found document; development uses
  Next.js's built-in 404 so a missing-route compile cannot race valid first hits.
- `next dev` intentionally omits export mode. Next.js 16 can otherwise race
  concurrent first-route compilation while updating
  `.next/dev/prerender-manifest.json`, corrupting the manifest and poisoning the
  development server with 500 responses.
- Every route-level `generateStaticParams` returns an empty list in development,
  so routes render on demand instead of concurrently rewriting Next.js's shared
  prerender manifest. Production still enumerates the complete static route set.
- CI starts an isolated, clean-cache development server, requests representative
  public, Studio, and missing routes concurrently, and requires expected
  responses plus a parseable prerender manifest before the production build runs.

## Acceptance criteria

- **AC-404-001:** A production static export contains one custom `404.html`
  with an HTTP-hostable, useful no-JavaScript fallback.
- **AC-404-002:** `/zh/blog/...` and `/fr/notes/...` hydrate with the matching
  language, surface-first safe links, one `h1`, and no hydration errors.
- **AC-404-003:** Unsupported paths recover in English without a redirect.
- **AC-404-004:** The artifact is `noindex`, has no canonical, and is served
  with status 404 for missing URLs.
- **AC-404-005:** View and recovery events use the dedicated not-found
  taxonomy without renaming existing events.
- **AC-404-006:** `404.html` remains part of the offline shared shell.
- **AC-404-007:** Production remains a static export while clean-cache concurrent
  first hits in development return valid responses without corrupting the
  prerender manifest.
