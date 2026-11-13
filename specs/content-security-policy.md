# Content Security Policy on a static GitHub Pages export

MEP-75 (audit SEC-9). Code: `scripts/lib/content-security-policy.mjs`, wired into
`scripts/postbuild.mjs`. Tests: `tests/content-security-policy.test.mjs` with real
exported pages in `tests/fixtures/csp/`.

## Context

The site is a Next.js static export served by GitHub Pages. Pages sends only
`strict-transport-security`, and a repository cannot add response headers: there is
no `_headers` file, no edge function, no config. A static export also cannot use a
nonce CSP, because a nonce must change per response. `experimental.sri` only adds
`integrity` to external chunks and does not cover the inline RSC scripts.

The practical XSS risk is low (every `dangerouslySetInnerHTML` renders repo content;
JSON-LD is escaped by `serializeJsonLd`). The CSP is defense in depth and a visible
signal for anyone who scans the headers.

## Decision

Postbuild injects one `<meta http-equiv="Content-Security-Policy">` into every
exported HTML page that has a `<head>`, right after `<meta charSet="utf-8"/>` and
before any script. Inline scripts are allowed by `sha256` hash only.

Order inside postbuild: OG normalization (it rewrites RSC flight strings), then CSP,
then the offline step (it fingerprints the final HTML for the service worker
manifest). Running CSP after the offline step would make every page version stale.

The transform is idempotent (an earlier meta is stripped and recomputed). Files with
no `<head>`, such as the Search Console token `google6e76e5becb7a4887.html`, are left
byte-exact. After injecting, postbuild re-verifies every page and fails the build if
any inline source lacks its hash or a script precedes the meta.

### Policy

```
default-src 'self';
script-src 'self' <page hashes> https://us-assets.i.posthog.com [build extras];
connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com [build extras];
img-src 'self' data: blob: https:;
style-src 'self' 'unsafe-inline';
font-src 'self' data:;
frame-src 'none' | [build extras];
worker-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self'
```

Build extras come from `cspBuildOptions()` in `scripts/postbuild.mjs`, which loads
`.env*` with `@next/env` exactly as `next build` does:

| Build input | Adds |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_PROJECT_ID`, `_APP_ID` set (Firestore Lite engagement) | `connect-src https://firestore.googleapis.com` |
| plus `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` (App Check, reCAPTCHA Enterprise) | `content-firebaseappcheck.googleapis.com`, and `https://www.google.com/recaptcha/`, `https://www.gstatic.com/recaptcha/` in script, connect, and frame |
| `GOOGLE_THIRD_PARTY=on` (GA4, AdSense; off since MEP-66) | GTM, `*.googlesyndication.com`, `*.adtrafficquality.google`, `fundingchoicesmessages.google.com` scripts; GA collect hosts; AdSense frames |

Firestore is allowed on every page, not only on articles. A meta policy belongs to
the document and does not change on client-side navigation, so a visitor who lands on
the home page and then opens an article through `next/link` is still under the home
page's policy. Blog and notes cards also read view counts. Restricting Firestore to
article HTML would silently drop engagement after a soft navigation.

`style-src` keeps `'unsafe-inline'`: React `style` attributes and the `<style>` tags
Next emits are inline styles. Style injection is a much smaller risk
than script injection and hashing every `style=""` is not possible.

`upgrade-insecure-requests` is left out. Pages already forces HTTPS with HSTS, and
the directive upgrades plain-HTTP local servers used by `verify:offline` and
`verify:not-found`.

### Inline script inventory and how each is hashed

| Source | Where it runs | How it is hashed |
| --- | --- | --- |
| `(self.__next_f=self.__next_f\|\|[]).push([0])` RSC bootstrap | every page, in HTML | hash of the tag body |
| `self.__next_f.push([1,"…"])` RSC chunks (about 20 to 40 per page) | every page, in HTML | adjacent chunks are merged into one `<script>` joined by `;`, then hashed once. Payload and order are unchanged (tested) |
| `ThemeScript` prepaint `(function(a,b,c,d){…})` | public pages and the global 404 | hash of the tag body |
| `FontScript`, `ReadingBackgroundScript` prepaint IIFEs | public pages | hash of the tag body |
| `window.location.replace("/en")` | root `index.html` | hash of the tag body |
| PostHog snippet, `next/script` `id="POSTHOG"`, `strategy="lazyOnload"` | every page, inserted after load | not a tag in the HTML. Its source is read from the RSC payload (`dangerouslySetInnerHTML.__html`, resolving `$<id>` text rows) and hashed. It differs per locale and for the 404 surface |
| GA4 config, `next/script` `id="GTM_datalayer"` | public pages when `GOOGLE_THIRD_PARTY=on` | same as PostHog. Because a soft navigation from Studio can mount it later, any page that lacks a `next/script` id also gets the hashes other pages use for that id |
| `application/ld+json` | articles, home, profile | not executed, not checked by CSP, not hashed |

Hashes are taken over the source after HTML newline normalization (`\r\n` to `\n`),
which is what the browser hashes. Per page this is at most 10 hashes, about 430 bytes
gzip on the budgeted routes.

## What a meta CSP cannot do

- `frame-ancestors`, `report-uri`/`report-to`, and `sandbox` are ignored in a meta
  policy. There is no clickjacking protection and no violation reporting.
- There is no report-only mode in a meta tag. A wrong hash blocks a script in
  production, which is why postbuild verifies every page and the browser check below
  must pass before deploy.
- The meta only governs content after it in the document. It is placed before every
  script; anything a browser extension or proxy inserts earlier is out of scope.
- Workers (`sw.js`, the particle workers) get their policy from their own response
  headers, so they run without a CSP on Pages.

## What GitHub Pages cannot do

Pages cannot send `X-Content-Type-Options: nosniff`, `X-Frame-Options` or
`frame-ancestors`, `Referrer-Policy` (a `<meta name="referrer">` covers part of it),
`Permissions-Policy`, `Cross-Origin-Opener-Policy`, a CSP header, or a stronger HSTS
(`max-age` is fixed by GitHub, no `preload`). A securityheaders.com scan stays low
whatever the page does.

The only way to close these gaps is to serve the site from a host that sets headers:
a custom domain behind Cloudflare (Transform Rules or a Worker add headers in front
of Pages), or moving to a host with a `_headers` file (Cloudflare Pages, Netlify) or
config (Firebase Hosting, already in `firebase.json` for `fb-deploy`). That is a
separate owner decision with an SEO migration cost: canonicals, sitemap, Search
Console property, and 301s from `nguyenlephong.github.io` (see MEP-62). Once headers
exist, move this policy to a header, add `frame-ancestors 'none'` and reporting, and
keep the hashes.

## Verification

- `node --test tests/content-security-policy.test.mjs`: fixtures from a real export
  (root redirect, global 404, Studio, a blog article) get exactly one meta, every
  inline and `next/script` source is hashed, JSON-LD is not, merge keeps the RSC
  payload, the transform is idempotent, verification catches a missing hash and a
  missing or duplicate meta, and origins follow the build options. When `out/` holds a
  CSP build (or `CSP_OUT_DIR` points at one), the last test sweeps every page.
- Browser check before enabling a deploy: serve the export, open home, about, blog,
  a blog article, notes, a note, apps, english, gallery, Studio, a Studio flow route,
  offline, a missing URL (404), and soft-navigate from home into an article. Expect
  zero `securitypolicyviolation` events, React hydrated, PostHog loaded, Firestore
  reads on articles.
- `GOOGLE_THIRD_PARTY=on` is best effort. AdSense loads from hosts that change over
  time and may inject inline scripts the hashes cannot know. Run the browser check on
  a flag-on build before turning the flag on in production.
