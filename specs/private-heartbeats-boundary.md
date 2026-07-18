# Private Heartbeats Boundary

## Status

Heartbeats is intentionally absent from the current source tree and future
public artifacts. The live Pages site still requires a separate redeploy and
`404` verification. GitHub Pages serves a downloadable static artifact, so
`noindex` and `robots.txt` cannot protect family data.

## Public-site invariants

- The public App Router has no localized Heartbeats route.
- The current public source tree contains no family seed, birth date, private
  token, or generated private payload.
- The static artifact verifier rejects every emitted file whose path has a
  `heartbeats` segment and every reference retained by generated HTML, route
  payloads, manifests, or service workers.
- Removed localized `/heartbeats` paths stay crawlable so search engines can
  observe the deployed `404`. `robots.txt` is not a removal or access-control
  mechanism.

## Allowed future deployment

A future Heartbeats product must use a separate host and one of these
boundaries:

1. Cloudflare Access protects the whole host before any HTML, JavaScript, or
   data is returned.
2. Firebase Auth protects data loaded from Firestore, with Firestore Rules
   enforcing the authenticated subject's access. App Check may add abuse
   protection, but it does not replace authentication or authorization.

In either design:

- Family data is fetched only after authorization and is never bundled into
  static HTML or JavaScript.
- Analytics, advertising, session recording, and third-party marketing scripts
  are disabled.
- Private data and tokens stay outside every future public commit, fixture,
  log, screenshot, and build artifact.
- The private deployment has an explicit data-retention and deletion policy.

## Historical exposure

Removing the route prevents future builds from publishing it. It does not erase
older Git commits, remote branches, clones or caches, or an already deployed
Pages artifact. Purging history and replacing the live deployment are separate
operational actions that require explicit approval, recovery planning, and
post-change `404` verification. Search Console Removals may temporarily hide old
URLs while recrawling completes, but it does not remove the underlying content.

## Acceptance criteria for reintroduction

- A threat-model review proves the host, auth, authorization, and failure paths.
- An unauthenticated request cannot obtain the application shell containing
  private data or call the protected data source.
- Tests cover disabled users, expired sessions, direct object access, retries,
  and denied reads.
- The public GitHub Pages build continues to contain no Heartbeats route or
  family data.
