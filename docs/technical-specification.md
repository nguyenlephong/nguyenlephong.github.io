# Technical Specification

## 1. Plain English Summary

This repository powers `nguyenlephong.github.io`, a multilingual personal
profile, CV, blog, notes, gallery, and small-app showcase.

The site is mostly pre-built before visitors arrive. During a build, Next.js
turns React pages and local JSON content into static HTML, CSS, JavaScript, and
image files. GitHub Pages then serves those files like a very fast public folder.

Some browser-side features still run after the page loads:

- theme, font, and reading-background preferences
- article search and filtering
- page progress and small UI animations
- analytics events
- best-effort article engagement counters in Firebase Firestore

There is no custom backend server in the main deployment path. The closest thing
to runtime storage is Firestore, which stores public engagement counters such as
views, shares, and reactions.

## 2. Product Scope

The current application source has seven public-facing surfaces. Private family
data is excluded from the current source tree and every newly generated GitHub
Pages artifact.

| Surface           | Main route                               | Purpose                                                                                                             |
|-------------------|------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| Profile / CV home | `/{locale}`                              | Recruiter-focused personal profile, experience, projects, and contact CTA.                                          |
| About             | `/{locale}/about`                        | Skills, strengths, and engineering principles.                                                                      |
| Gallery           | `/{locale}/gallery`                      | Certificates, awards, project snapshots, and activity images.                                                       |
| Apps              | `/{locale}/apps`                         | Showcase for small tools such as Glance and E-Slang.                                                                |
| Blog              | `/{locale}/blog` and nested post routes  | Engineering articles with SEO metadata, categories, related posts, and engagement widgets.                          |
| Notes             | `/{locale}/notes` and nested note routes | Personal notes and book reflections with bilingual content behavior.                                                |
| Studio            | `/{locale}/studio`                       | Shadow-DOM admin-style workbench for learning notes and engineering setup.                                          |

`/` is a static redirect page to `/en`. It still includes metadata so crawlers
can read the canonical profile information before following the redirect.

Supported locales are:

```text
en, vi, zh, ja, ko, fr
```

The locale prefix is always present in public URLs.

## 3. Tech Stack

| Area                    | Technology                                | How it is used                                                                                           |
|-------------------------|-------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Application framework   | Next.js 16 App Router                     | Static export, localized routes, metadata generation, OpenGraph image routes.                            |
| UI runtime              | React 19                                  | Server components for page assembly, client components for interaction.                                  |
| Language                | TypeScript 5                              | Strict typing, app components, data contracts, scripts.                                                  |
| Internationalization    | `next-intl`                               | Locale routing, translated messages, locale-aware links and metadata.                                    |
| Content validation      | Zod                                       | Build-time validation for canonical blog and notes JSON files.                                           |
| SEO structured data     | `schema-dts` and manual JSON-LD           | Person, WebSite, Blog, BlogPosting, Article, BreadcrumbList, FAQPage, ImageGallery, ItemList.            |
| Social images           | `next/og`, `ImageResponse`, Node scripts  | Generates and caches OpenGraph images for profile, blog, notes, apps, and gallery pages.                 |
| Styling                 | Global CSS, CSS variables, `next/font`    | Theme system, reading backgrounds, responsive layout, typography.                                        |
| Motion                  | `MotionProvider` on Home and Gallery      | Uses `framer-motion` `LazyMotion` only on the two public surfaces that animate.                         |
| Icons                   | `react-icons`                             | Navigation, cards, controls, app visuals.                                                                |
| Graph/visual tools      | D3 packages                               | Thought graph components exist in the repo, although no active App Router thoughts route is present now. |
| Analytics               | PostHog, Google Analytics, Google AdSense | Page views, scroll depth, read time, outbound clicks, app interactions, ads script.                      |
| Engagement storage      | Firebase Firestore                        | Public article counters for views, shares, and reactions.                                                |
| Static hosting          | GitHub Pages                              | Main deployment target for the `out/` static export.                                                     |
| Optional hosting config | Firebase Hosting                          | `firebase.json` also points hosting at `out/`.                                                           |
| Quality gates           | ESLint 9, TypeScript, Node test runner    | CI type-checks, lints, runs tests, and smoke-builds.                                                     |
| Package tooling         | npm, Bun scripts                          | npm is used for install and CI. Some deploy scripts call `bun run`.                                      |

## 4. High-Level Architecture

See [C4 System Context](./diagrams/c4-context.puml) and
[C4 Container Diagram](./diagrams/c4-container.puml).

At a high level:

1. A visitor opens a localized URL such as `/en/blog`.
2. GitHub Pages serves static files from `out/`.
3. The page was produced by Next.js during build time.
4. Server components read local JSON content and translated messages while
   building pages.
5. Client components add interaction after hydration.
6. Analytics scripts and Firestore engagement calls run only in the browser.

This means the important engineering constraint is simple: anything that must be
known at request time cannot depend on a server in the current deployment model.
It must either be built ahead of time or handled by client-side JavaScript.

## 5. Repository Map

| Path                   | Responsibility                                                                              |
|------------------------|---------------------------------------------------------------------------------------------|
| `src/app`              | Next.js App Router pages, layouts, metadata, sitemap, robots, OpenGraph image routes.       |
| `src/app/[locale]`     | Main localized route tree. Every public route except `/` lives here.                        |
| `src/components`       | Reusable UI components, analytics widgets, reader tools, blog/notes widgets, CV sections.   |
| `src/content`          | Profile, experience, project, gallery, and media data used by CV-style pages.               |
| `src/i18n`             | `next-intl` routing, navigation helpers, request-time message loading.                      |
| `src/lib/blog`         | Blog data loading, schema validation, SEO helpers, related-post logic.                      |
| `src/lib/notes`        | Notes data loading, schema validation, topic URL helpers.                                   |
| `src/lib/content`      | Shared JSON IO, Zod validation wrapper, locale overlay helpers, search helpers.             |
| `src/lib/engagement`   | Provider-neutral counter domain, repository port, id bounding, and Firebase adapter.        |
| `src/lib/firebase`     | Lazy compatibility facade, client-only Firebase initialization, and App Check bootstrap.    |
| `src/lib/og`           | OpenGraph image cache and build-target filtering.                                           |
| `messages`             | Locale message files for UI copy.                                                           |
| `content/blog-data`    | Build-only canonical blog metadata/posts and locale overrides.                              |
| `content/notes-data`   | Build-only canonical notes metadata/posts and Vietnamese overrides.                         |
| `content/thoughts-data` | Thought graph/content data used by thought components, currently without an active route.   |
| `public/og-cache`      | Cached generated OpenGraph PNGs.                                                            |
| `scripts`              | Build helpers for OG generation, post-build rewriting, version bumping, favicon generation. |
| `tests`                | Node test-runner tests for schemas, route/UI contracts, privacy rules, and OG targeting.    |
| `.github/workflows`    | CI and GitHub Pages deployment workflows.                                                   |

## 6. Routing and Page Behavior

### Locale and public-site shells

`src/app/[locale]/layout.tsx` is the shared locale document boundary. It
validates and sets the server request locale, owns shared locale metadata,
loads the shared PostHog bootstrap, and mounts the shared Web Vitals reporter.
It does not load Google Analytics or AdSense, mount
`NextIntlClientProvider`, or serialize a client message catalog.

`src/app/[locale]/(site)/layout.tsx` is the public-site boundary. It runs the
theme, font, and reading-background prepaint scripts on every public route,
then mounts Google Analytics and AdSense resources, the scoped site message
provider, header, footer, route progress, and offline support.
`MotionProvider` is narrower: only the Home and Gallery page entries mount it.
`ArticleReaderTools` is mounted only by the nested Blog and Notes article
layouts. Home, Blog, Notes, and Gallery add a second provider only around their
message-consuming client subtree. The pathless `(site)` segment does not appear
in public URLs. Studio remains outside this route group, so it does not render
or hydrate the public-site shell and receives no client message catalog.

The footer's public-to-Studio link deliberately performs a full-document
navigation. Session storage survives, but the public DOM and JavaScript realm
do not: the Studio document has no Google Analytics or AdSense scripts,
resource hints, account metadata, data-layer node, browser globals, or new
Google requests left from the public page.

### Route Table

| Route                              | File                                               | Rendering notes                                                                           |
|------------------------------------|----------------------------------------------------|-------------------------------------------------------------------------------------------|
| `/`                                | `src/app/page.tsx`                                 | Static redirect to `/en` with crawler-readable metadata.                                  |
| `/{locale}`                        | `src/app/[locale]/(site)/page.tsx`                        | Main CV/profile page, built from `profileInfo` and translated section labels.             |
| `/{locale}/about`                  | `src/app/[locale]/(site)/about/page.tsx`                  | Translated about sections from `messages`.                                                |
| `/{locale}/gallery`                | `src/app/[locale]/(site)/gallery/page.tsx`                | Gallery from `profileInfo.gallery`, with ImageGallery JSON-LD.                            |
| `/{locale}/apps`                   | `src/app/[locale]/(site)/apps/page.tsx`                   | Static app showcase from `apps.data.ts`.                                                  |
| `/{locale}/apps/english`           | `src/app/[locale]/(site)/apps/english/page.tsx`           | Private/noindex E-Slang practice app.                                                     |
| `/{locale}/blog`                   | `src/app/[locale]/(site)/blog/page.tsx`                   | Blog index with categories, quick filters, and Blog JSON-LD.                              |
| `/{locale}/blog/page/{page}`                 | `src/app/[locale]/(site)/blog/page/[page]/page.tsx`                 | Static Blog archive pagination; page one remains at `/blog`.                              |
| `/{locale}/blog/{category}`        | `src/app/[locale]/(site)/blog/[category]/page.tsx`        | Category landing page.                                                                    |
| `/{locale}/blog/{category}/{slug}` | `src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx` | Article page with schema, related posts, reading tracker, reactions, share dock, and TOC. |
| `/{en\|vi}/blog/series/{series}`             | `src/app/[locale]/(site)/blog/series/[series]/page.tsx`             | Curated Blog series page one with static cards and collection schema.                     |
| `/{en\|vi}/blog/series/{series}/page/{page}` | `src/app/[locale]/(site)/blog/series/[series]/page/[page]/page.tsx` | Later curated series pages; `/page/1` is not generated.                                   |
| `/{locale}/notes`                  | `src/app/[locale]/(site)/notes/page.tsx`                  | Notes index with topic filters and CollectionPage JSON-LD.                                |
| `/{locale}/notes/page/{page}`                | `src/app/[locale]/(site)/notes/page/[page]/page.tsx`                | Static Notes archive pagination; page one remains at `/notes`.                            |
| `/{en\|vi}/notes/topics/{topic}`             | `src/app/[locale]/(site)/notes/topics/[topic]/page.tsx`             | Curated Notes topic page one with static cards and collection schema.                     |
| `/{en\|vi}/notes/topics/{topic}/page/{page}` | `src/app/[locale]/(site)/notes/topics/[topic]/page/[page]/page.tsx` | Later curated topic pages; `/page/1` is not generated.                                    |
| `/{locale}/studio`                 | `src/app/[locale]/studio/page.tsx`                 | Shadow-DOM admin workbench, route-isolated from the main profile shell.                   |
| `/{locale}/notes/{slug}`           | `src/app/[locale]/(site)/notes/[slug]/page.tsx`           | Note article page, source-book card, topic breadcrumb, FAQ support, engagement widgets.   |

Most routes expose `generateStaticParams()`, which lets Next.js enumerate every
static localized page during build.

## 7. Content Model

See [C4 Content Component Diagram](./diagrams/c4-component-content.puml).

### Profile Content

Profile-style pages use TypeScript modules under `src/content`:

- `profile.ts` for contact, skills, achievements, education, and references
- `experience.ts` for career experience
- `projects.ts` for selected project history
- `gallery.ts` for certificates, awards, projects, and activities
- `media.ts` for video/media data

`src/app/app.const.ts` reassembles those modules into `profileInfo`, preserving
existing imports across the app.

### Blog Content

Canonical blog content lives under `content/blog-data`:

```text
content/blog-data/_index.json
content/blog-data/posts/<slug>.json
```

Per-locale overrides live under:

```text
content/blog-data/<locale>/_index.json
content/blog-data/<locale>/posts/<slug>.json
```

Important behavior:

- English is the canonical/default content.
- `_index.json` holds category metadata, the explicit ordered series catalog,
  and post metadata. Series membership and `seriesOrder` are authored data;
  they are not inferred from tags or dates.
- `posts/<slug>.json` holds the full HTML article body.
- `src/lib/blog/data.ts` overlays translated fields on top of canonical entries.
- Missing translated fields fall back to English instead of creating blank cards
  or missing metadata.
- Canonical blog index and post files are validated by Zod during build.
- Seven promoted series generate static collection routes only for `en` and
  `vi`; see [the curated content hub specification](../specs/curated-content-hubs.md)
  for the exact catalog and snapshot.
- The source directory is outside `public/`; readers receive generated static
  routes and `/search/blog.json`, never the raw authoring corpus.

### Notes Content

Canonical notes content lives under `content/notes-data`:

```text
content/notes-data/_index.json
content/notes-data/posts/<slug>.json
```

Vietnamese overrides live under:

```text
content/notes-data/vi/_index.json
content/notes-data/vi/posts/<slug>.json
```

Important behavior:

- Notes collapse supported UI locales into two content locales.
- `vi` serves Vietnamese content.
- Every other locale serves the English/international content.
- A note can define `locales`, such as `["en", "vi"]`, to decide where it is
  visible.
- `_index.json` contains an explicit ordered `hubs` catalog. Its six promoted
  topics generate EN/VI-only routes under `/notes/topics/{topic}`; `mua-xe`
  remains a normal filter topic and is deliberately not a curated hub.
- Vietnamese-only notes are included in the sitemap only as `/vi/notes/...`.
- Bilingual notes get a full hreflang cluster.
- The source directory is outside `public/`; readers receive generated static
  routes and `/search/notes.json`, never the raw authoring corpus.

### Shared Editorial Metadata

Blog and Notes entries may define `contentMode`, `seoTitle`, `seoDescription`,
and `reviewedAt`. The SEO fields can specialize search metadata without
changing the visible title or summary. `reviewedAt` records an accuracy review
and emits `WebPage.lastReviewed`; it is never an edit timestamp and must not be
used as `dateModified`. The existing `updated` field remains the source for
`dateModified`. These fields stay optional and are added only after an
individual editorial review.

The Notes author-quality contract backfills 24 confirmed canonical authors and
keeps `chi-phi-mua-nha-toan-bo-nhung-khoan-can-biet` as the one exact unresolved
slug. Index and body author values must agree; the unresolved value must not be
inferred from neighboring content.

### Trusted HTML Boundary

Blog and notes bodies are stored as HTML strings and rendered as trusted
repository-authored content. This is acceptable while content is committed by
the site owner. If the project later accepts user-generated content or pulls
from an external CMS, the HTML must be sanitized before rendering.

## 8. Internationalization

`src/i18n/routing.ts` defines the locale contract:

```ts
locales: ['en', 'vi', 'zh', 'ja', 'ko', 'fr']
defaultLocale: 'en'
localePrefix: 'always'
```

`src/i18n/request.ts` loads default English messages and deep-merges locale
messages on top. This keeps partially translated locale files usable: missing
keys fall back to English instead of breaking the page.

Server Components read this merged catalog through `getTranslations` without
shipping it to the browser. `src/i18n/client-message-scopes.ts` is the
fail-closed contract for Client Components: the public shell and each
interactive surface receive only their declared namespace branches. A
TypeScript-AST inventory scans `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, and `.mts`
modules, maps every provider-dependent `next-intl` hook and locale-navigation
import to an allowed route scope, and requires `useTranslations` namespaces to
be static string literals. It reserves raw `NextIntlClientProvider` usage for
the scoped adapter and `next-intl/navigation` for the canonical navigation
adapter, rejects direct `use-intl` imports, and locks each
`ScopedIntlProvider` to its declared route boundary and literal scope. A
transitive local dependency graph also prevents Studio entry and Client
Component roots from reaching those provider-dependent runtimes through shared
modules. Artifact tests compare the complete message structure, including empty
object and array branches, and reject missing, duplicate, overlapping, or
undeclared scopes.

Navigation uses `createNavigation(routing)` from `next-intl`, which keeps links
locale-aware.

Do not change locale behavior casually. It affects:

- page URLs
- sitemap output
- canonical URLs
- hreflang alternates
- OpenGraph URLs
- locale-specific content fallback
- analytics page context

## 9. SEO and Social Sharing

SEO is a first-class part of the app.

| Mechanism              | Where it lives                      | Purpose                                                                                       |
|------------------------|-------------------------------------|-----------------------------------------------------------------------------------------------|
| Global site constants  | `src/app/seo.config.ts`             | Site URL, page SEO defaults, absolute URL helper.                                             |
| Page metadata          | `generateMetadata()` in route files | Title, description, canonical, OpenGraph, Twitter cards, robots.                              |
| Structured data        | Layout and page files               | Person, WebSite, Blog, BlogPosting, Article, FAQPage, BreadcrumbList, ImageGallery, ItemList. |
| Sitemap                | `src/app/sitemap.ts`                | Locale-aware static route, blog, and notes URL generation.                                    |
| Robots                 | `src/app/robots.ts`                 | Allows public and removed routes to be crawled while retaining `/private` and `/api` blocks.                 |
| OpenGraph image routes | `src/app/**/opengraph-image.tsx`    | Dynamic social images rendered during static export.                                          |
| Artifact SEO verifier  | `scripts/verify-static-artifact.mjs`| Checks exported sitemap URLs, canonicals, titles, descriptions, language metadata, and robots. |

About, Apps, and Gallery use
`src/lib/seo/static-page-localization.ts` to separate route locale from authored
content locale. Their current contract is:

| Page | Authored/indexable locales | Other emitted locale routes |
|---|---|---|
| About | `en`, `vi` | English content boundary, `noindex, follow`, canonical `/en/about` |
| Apps | `en`, `vi` | English content boundary, `noindex, follow`, canonical `/en/apps` |
| Gallery | `en`, `vi`, `zh`, `ja`, `ko`, `fr` | None; every locale is authored and self-canonical |

Only authored variants enter sitemap and `hreflang`. Each of the 18 emitted
routes has exact title/description parity across HTML, Open Graph, Twitter, and
its route-owned JSON-LD object. The JSON-LD language follows the content rather
than blindly copying the route prefix. These focused pages explicitly clear the
locale layout's broad keyword meta instead of inheriting it. The artifact
verifier also requires generic and Googlebot robots directives to agree and
rejects even an empty keyword tag. A source test keeps policy configuration
equal to the runtime definition and requires every Gallery locale to own the
same complete 71-leaf visible message shape.

The artifact verifier works against the generated `out/` directory rather than
source-code patterns. Its sitemap URL set must exactly equal the exported,
indexable, self-canonical HTML URL set in both directions after the publication
lifecycle has applied `status`, `date`, `publishAt`, and the build-wide
`CONTENT_BUILD_DATE`. Every sitemap URL must therefore resolve to exported HTML,
use the configured HTTPS origin, have one matching canonical URL, remain
indexable, and include a title, description, and document language. Sitemap
alternates must also point to an indexable URL in the same sitemap. Any emitted
file whose path contains a `heartbeats` segment fails the build. The same
fail-closed check scans public text artifacts, including HTML, route payloads,
manifests, and service workers, so they cannot retain a reference to the removed
route.

The independent SEO field-data observer reads aggregate Search Console data,
fixed URL Inspection canaries, and CrUX History for the origin plus Home, Blog,
Notes, Gallery, and Studio phone targets. A missing page sample remains
`unknown`; configuration is not evidence of real traffic. Its separate local
operator report may retain raw `page`/`query` rows only under the ignored
owner-only `.private/seo/` directory. That report deterministically groups an
exact query only when at least two distinct pages total at least 50 impressions
and presents the result as a competing-page review queue, not as proof of a
canonical conflict. The command is rejected in GitHub Actions and the public
workflow never invokes it.

Curated Blog series and Notes topic pages are first-class indexable collections.
They use self-canonicals, localized descriptions, `CollectionPage`, page-local
`ItemList` entries with global positions, `BreadcrumbList`, and static parent,
pagination, and article links. Their hreflang clusters contain only `en`, `vi`,
and an English `x-default`; no other locale exports those routes. With
`CONTENT_BUILD_DATE=2026-07-19`, the 16 Blog series URLs and 36 Notes hub URLs
add exactly 52 entries. The valid pre-hub baseline is 895 URLs after removing
one mislabeled English article variant. Omitting eight un-authored About and
Apps fallback variants leaves 887 canonical pre-hub URLs, so the fixed-date
sitemap contains 939 unique URLs. The former English article URL remains only as a `noindex` compatibility
artifact that canonical/meta-refreshes to its authored Vietnamese variant and
is absent from sitemap and hreflang output. This total is a fixed-date
regression assertion, not a permanent sitemap floor; artifact parity remains
the general rule as content changes.

### OpenGraph Build Flow

The normal build script is:

```bash
npm run build
```

That runs:

```bash
node scripts/build-og.mjs --full
```

The flow:

1. `scripts/build-og.mjs` sets OG-related environment flags.
2. `next build --turbopack` performs a static export.
3. OpenGraph routes generate images with `ImageResponse`.
4. `src/lib/og/cache.ts` stores generated PNGs in `public/og-cache`.
5. `scripts/postbuild-og.mjs` reads concrete social-image ownership from
   `.next/prerender-manifest.json`, requires exactly one regular emitted form
   for each declared route, and leaves filename lookalikes outside that
   inventory untouched.
6. It groups only byte-identical declared images by SHA-256, preferring the root
   `/opengraph-image.png`, then the shortest and lexical URL. Exact root-relative
   and same-origin aliases are Unicode/percent-normalized only when they are a
   complete URL token in a relevant HTML/HTM attribute, source-set candidate,
   inline style attribute or style block parsed as CSS, JSON/Web Manifest string
   value, structural RSC/TXT quoted value, or CSS `url(...)` argument. Source
   sets support positive `x` and `w` descriptors, including comma-adjacent
   candidates, without splitting commas inside `data:` URLs; malformed
   descriptors fail before mutation. Density uses the complete positive HTML
   valid-floating-point grammar, including exponent notation; width remains a
   positive integer, and descriptor kinds cannot be mixed. Density uses exactly
   `(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?` before the `x` suffix, followed
   by a finite, greater-than-zero check; forms such as `1.` and `1.e2` are not
   accepted. Before parsing any URL-bearing HTML attribute, the build-time
   transformer uses the direct dev-only `entities` dependency to decode the
   complete value in HTML attribute context. This covers the full named table,
   decimal/hexadecimal replacement rules, multi-code-point references, and the
   browser's legacy semicolon rules. A reference that does not decode in that
   context remains literal. Unchanged values retain their original bytes;
   changed values are safely re-encoded only inside the original quote or
   unquoted context and parse back to the transformed decoded value.
   Query strings, fragments, escaped slash
   form, quote style, and surrounding formatting are preserved. JavaScript files,
   arbitrary HTML script bodies, CSS strings/comments, protocol-relative
   values, non-HTTP values, prose, substrings, and external origins are not
   rewritten. The only script-body exception is a TypeScript-AST-recognized
   `self.__next_f.push(...)` call: its JavaScript string literals are decoded,
   structurally transformed as Flight data, and re-encoded through byte-local
   source spans. A malformed recognized payload fails before mutation.
7. An independent consumer-context alias-absence proof completes before an in-output
   same-filesystem transaction promotes normalized images and consumers and
   moves duplicates into its backup tree. Consumers are read uncached and only
   changed bodies are spooled, so planning memory is bounded by concurrency
   rather than corpus size. The final preflight rechecks byte length and SHA-256
   before the journal enters `applying`; prepared failures do not mutate output.
   An incomplete `applying` rollback retains its reported journal, backup, and
   moved-file workspace for the next locked recovery attempt. The official build
   wrapper acquires an exclusive PID/token lock before invalidating state or
   deleting the prior output and holds it through Next export, recovery, social
   image normalization, and offline derivation. Its owned postbuild call avoids
   nested acquisition, while direct postbuild invocations acquire the same lock.
   A manifest-plus-output-identity committed route map proves intentional
   missing aliases only on idempotent same-tree reruns. The official build
   wrapper invalidates that state before deleting the prior export.
8. Offline manifest generation runs after that canonicalization, so page
   versions and owned files describe the final export rather than removed
   social-image paths.
9. In fast or targeted builds, missing dynamic OG files can be restored from the
   cache.

The wrapper accepts a terminated `next build` only when the same wrapper
actually sent the observed signal after reading a fresh successful
`.next/export-detail.json` whose `outDirectory` resolves to the current `out/`
tree. A stale detail file must be removed before the previous output is
deleted; an unlink failure aborts the build. Exported HTML is diagnostic
evidence only; it never authorizes termination or converts a non-zero exit into
success. A build that does not exit cleanly is failed after 20 minutes by
default. The local timeout can be changed explicitly, for example:

```bash
OG_BUILD_TIMEOUT_MS=900000 npm run build:fast
```

This exists because GitHub Pages can serve extensionless image files with a
generic content type. Some social scrapers reject those files, so the project
renames them to explicit PNG paths. The artifact gate independently tokenizes
the same supported consumer contexts and requires each complete same-origin
route social-image URL to resolve to a remaining local file. This includes
AST-recognized inline Next Flight metadata payloads but excludes arbitrary
script code. Alias-like text inside a non-HTTP value, CSS string/comment,
arbitrary script, or prose is not interpreted as a deployable URL; only CSS
`url(...)` tokens in style bodies or attributes are interpreted.

Article OG images use a separate cross-repository flow. Generated PNG inputs
under ignored `public/og/{blog,notes}` paths are converted to JPEG by
`scripts/publish-og-assets.mjs` and installed into the exact managed
`dom-pub/icdn/og/{blogs,notes}` namespaces. Scheduled entries must be generated
against their effective future `CONTENT_BUILD_DATE` and published before the
site change is accepted. This makes the reserved JPEG publicly reachable at a
guessable CDN URL before the article route exists, but avoids a failed daily
release build. No page links to that JPEG until the article is released.

## 10. Analytics and Engagement

See [C4 Engagement Component Diagram](./diagrams/c4-component-engagement.puml).

### Analytics Events

Analytics helpers live in `src/lib/analytics.ts`.

The helper:

- runs only in the browser
- respects browser Do-Not-Track
- adds timestamp and current path
- fails silently so analytics never breaks the page
- sends events through `window.posthog.capture`

Main event sources:

- `PageTracker` for general page view, scroll depth, visibility, and time on page
- `PageViewTracker` for legacy CV tracking
- `BlogReadingTracker` for article view, scroll depth, read complete, and read
  time
- app/gallery/blog/notes components for clicks, filters, share actions, and
  reader tools
- curated hub catalogs, pages, and article hierarchy links for hub views,
  source-aware hub/archive navigation, article clicks, and page changes with
  stable hub ID, page, destination, content slug, and global position
- `WebVitalsReporter` for web vitals

Curated hubs emit `content_hub_view`, `content_hub_click`,
`content_hub_archive_click`, `content_hub_article_click`, and
`content_hub_page_change`. Article hierarchy links reuse `content_hub_click`
with a stable source and destination. They also preserve the existing
`blog_card_click` or `notes_card_click` event on article selection and
`explorer_page_change` on pagination so established dashboards do not lose
their current taxonomy.

PostHog is loaded by the shared locale document in
`src/app/[locale]/layout.tsx`. Google Analytics and AdSense belong to
`src/app/[locale]/(site)/layout.tsx`, so Studio does not request or retain their
public runtime. The public footer uses a full-document Studio link; its existing
`cv_nav_click` event is sent with `sendBeacon` before navigation.

### Firebase Engagement

Firestore is used for public article counters:

```text
postStats/{category}__{slug}
  views: number
  shares: number
  reactions:
    like: number
    love: number
    insightful: number
    clap: number
```

Important behavior:

- The stable `firebase/postStats` facade imports no provider value eagerly. It
  memoizes a dynamic repository import on the client, and provider import
  failure resolves to empty reads or failed writes.
- Blog and Notes archives defer their visible-card reads until first scroll,
  search/filter interaction, or restoration of a bookmarked query/filter.
  One `CONTENT_PAGE_SIZE` provider batch can run while one replaceable
  latest-visible queue waits, keeping no more than two pages outstanding.
  Resolved and active ids are deduplicated, failure releases the scheduler, the
  mounted resolved cache is capped at four visible pages, and `Save-Data` skips
  archive counters. Hovering a card or category is navigation intent only and
  does not load Firebase.
- If Firebase environment variables are missing, engagement quietly no-ops.
- One view is recorded per browser session through `sessionStorage`. The marker
  is committed only after Firestore confirms the increment. A failed write is
  never retried immediately because atomic increments are not idempotent; one
  later mount may retry, capped at two attempts per page runtime.
- Reactions are remembered per browser through `localStorage`.
- Views and shares use Firestore atomic increments. Reaction toggles and
  switches use one transaction so old/new counters cannot partially apply.
- Failed writes roll back optimistic UI updates where needed.
- UI code targets the provider-neutral `EngagementRepository`; the Firebase
  adapter remains lazy and client-only.

Required public build-time variables:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Optional variables:

```text
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APPCHECK_MODE
NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY
```

`NEXT_PUBLIC_FIREBASE_APPCHECK_MODE` defaults to `optional`. Runtime App Check
status explicitly distinguishes `not-configured`, `pending`, `active`, and
`failed`, including invalid-mode, missing-key, and bootstrap-failure reasons.
An unknown non-empty mode is invalid and fails closed. In `optional`
mode, engagement retains its legacy fail-soft reads and writes. In `required`
mode, reads remain fail-soft but all view, share, and reaction writes are
disabled unless App Check bootstrap is active. A missing site key or bootstrap
failure therefore cannot silently fall through to an unprotected write.

`firestore.rules` allows anyone to read `postStats` and allows constrained
counter writes. The rules constrain ids, exact fields, types, reaction keys,
nonnegative values, affected fields, and deltas, but do not make counters
audit-grade. A determined valid client can still loop allowed increments.

When the App Check site key is configured, reCAPTCHA Enterprise App Check is
initialized before Firestore. An `active` client status means initial App Check
token acquisition succeeded; it does not mean backend enforcement is enabled or
that future token refreshes will succeed. Token bootstrap has a bounded timeout
so optional reads cannot remain stuck behind a blocked provider. Enforcement remains
an external Firebase Console setting. Roll out with enforcement disabled,
monitor valid and invalid request metrics across a representative traffic
cycle, fix legitimate invalid traffic, then enable Firestore enforcement in the
console. Never ship App Check debug tokens in the static artifact. See
`specs/engagement-provider-boundary.md` for the monitor-to-enforce and rollback
runbook.

## 11. Client UX Systems

| System             | Files                                                          | Behavior                                                                                                              |
|--------------------|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Theme              | `ThemeScript`, `ThemeSync`, `ThemeToggle`, `theme-preference` | Applies `data-theme` before paint on every public route and shares one parser/resolver for the persisted preference.  |
| Fonts              | `FontScript`, `FontSwitcher`                                   | Applies the saved font before paint site-wide; interactive switching remains available where the UI exposes it.       |
| Reading background | `ReadingBackgroundScript`, `ReadingBackgroundSwitcher`         | Applies the saved reading background before paint on every public route.                                               |
| Reader tools       | `ArticleReaderTools`, `BlogReaderTools`                         | Mounts the floating toolbar only in nested Blog and Notes article layouts.                                             |
| Route progress     | `RouteProgressBar`                                             | Provides click/popstate-aware progress on every public route.                                                          |
| Motion             | `MotionProvider`                                               | Mounts `LazyMotion` only on Home and Gallery, not in the shared public-site layout.                                    |
| Explorer filters   | `ExplorerShell`, `useExplorer`, blog/notes explorers             | Provides search, filter, tag, and topic/category exploration on content indexes.                                      |
| Archive counters   | `useDeferredPostStats`, deferred stats store, `postStats` facade   | Loads one visible-page batch after intent, retains one latest-view queue, caps its mounted cache, skips on `Save-Data`, and fails soft.          |

## 12. Build, Test, and Deploy

### Local Development

```bash
npm install
npm run dev
```

The dev server listens on port `10505`.

### Quality Commands

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` uses Node's built-in test runner over `tests/*.test.mjs`.

Current test focus:

- content schemas
- OpenGraph build target filtering
- note breadcrumb URL behavior
- family privacy guardrails
- reader background behavior
- route progress contract
- reader-control CSS/markup contract

### Build Commands

```bash
npm run build
npm run build:fast
npm run build:og
npm run analyze
npm run verify:artifact
npm run verify:performance-artifact
npm run verify:og-publication
npm run verify:og-publication:live -- --include-scheduled
```

| Command      | Meaning                                                               |
|--------------|-----------------------------------------------------------------------|
| `build`      | Full static export with full OG generation.                           |
| `build:fast` | Static export with dynamic OG generation skipped/restored from cache. |
| `build:og`   | Targeted OG build helper.                                             |
| `analyze`    | Writes the official Next.js bundle analysis to `.next/diagnostics/analyze` without starting a server. |
| `verify:artifact` | Verifies output size, route assets, SEO output, and public-secret guardrails without rebuilding. |
| `verify:performance-artifact` | Verifies route Brotli, RSC payload, scoped client messages, Studio runtime, and third-party connection budgets without rebuilding. |
| `verify:og-publication` | Verifies that every currently released article has its declared managed OG asset. `--include-scheduled` expands the required set to released plus non-draft future entries. |

Raw authored JSON is a build input, not a deployable API. The artifact verifier
fails if `blog-data`, `notes-data`, or `thoughts-data` paths, browser references,
or scheduled/draft article records appear in `out/`.

`scripts/publish-og-assets.mjs` is the only owner of generated article JPEGs in
`dom-pub/icdn/og/blogs` and `dom-pub/icdn/og/notes`. Stale pruning requires both
`--prune-stale` and the explicit `--apply-prune` flag; `--dry-run` reports the
same inventory without mutation. Only current-index canonical slugs with
explicit `status: "draft"` are managed deletion candidates. Scheduled entries
are reservations, while unknown or removed-source files, manual media, and
other extensions are preserved. Each local transaction pins and reports the
previous clean `dom-pub` HEAD, quarantines deletions, rolls the complete tree
back after partial failure, and enforces the contract's count and percentage
caps. The tool does not commit or push the cross-repository change.

PR CI and Pages run the live verifier with `--include-scheduled` before
building. It requests bytes zero through three and uses a BYOB reader in the
supported Node 22+ runtime to retain and inspect at most four decoded body
bytes before cancelling the stream. This is not a four-byte network-transfer
guarantee: a CDN that ignores `Range` and returns `200` may place additional
bytes in socket or Undici buffers before cancellation. A declared `200`
`Content-Length` must be a safe integer no larger than 5 MiB; an absent length
remains compatible with chunked CDN responses. Missing responses, redirects,
non-BYOB bodies, wrong MIME types, invalid JPEG signatures, timeouts, and
exhausted retries fail before the expensive export. The Pages post-build live verifier
intentionally omits that flag and repeats the fail-closed check for released
entries before artifact upload. Both jobs persist no checkout credentials,
invoke no publisher, and receive no cross-repository write credential.

`--remote-tree` remains an operator-only inventory mode. It accepts only exact
expected paths represented as `100644` Git blobs of at least four bytes, but
does not prove that the public CDN serves those bytes with the required status,
MIME type, and JPEG signature; workflows therefore never use it as release
readiness.

`config/static-artifact-budgets.json` contains the static artifact limits. The
limits deliberately sit close to the measured export so new growth is visible
while route and content duplication are reduced:

| Budget | Current limit |
|--------|---------------|
| Total artifact | 600 MiB |
| Total files | 20,000 |
| Total-size and file-count warning threshold | 75 percent |
| Largest HTML file | 430 KiB |
| Largest JavaScript file | 1.35 MiB |
| Largest CSS file | 210 KiB |
| JavaScript referenced by one route | 2.2 MiB |
| CSS referenced by one route | 220 KiB |
| Sitemap coverage | Exact bidirectional parity with published, indexable, self-canonical HTML |

The pathless `(site)` route group intentionally adds about 2,144 Next.js RSC
segment files so public pages and Studio can have separate runtime boundaries
without changing public URLs. The current 600 MiB and 20,000-file limits are
repository-wide post-optimization guardrails, not performance targets or a
route-group growth allowance. The verifier warns at 75 percent of the total-byte
and file-count limits so growth is visible before either hard ceiling is close.

All recognized public text formats, including exported HTML and Next RSC `.txt`
payloads, are scanned with bounded concurrency for high-confidence private keys
and provider tokens. A PEM finding requires a complete header, credible base64
payload, and matching footer; a documentation-only header is not treated as a
leak. Route-asset budgets sample the home, blog, notes, and Studio entry points
across English, Vietnamese, Chinese, Japanese, Korean, and French routes. They
also include the nested curated routes
`en/blog/series/foundations/page/2.html` and
`vi/notes/topics/thoughts/page/5.html`. Individual file limits still cover every
emitted HTML, JavaScript, and CSS file.

`verify:performance-artifact` adds compressed and route-level RSC regression
budgets without replacing those raw ceilings. Total RSC size is an advisory
capacity signal because valid content growth increases it; average and
per-surface route payloads remain hard gates. The current configured gates are:

| Surface or payload | Current gate |
|--------------------|-------------:|
| Home initial JavaScript, Brotli | Hard limit: 238,592 bytes |
| Blog initial JavaScript, Brotli | Hard limit: 217,088 bytes |
| Notes initial JavaScript, Brotli | Hard limit: 217,088 bytes |
| Studio direct initial JavaScript, Brotli | Hard limit: 176,128 bytes |
| Studio English default route, Brotli | Hard limit: 204,800 bytes |
| Studio initial document CSS, Brotli | Hard limit: 3,072 bytes |
| Studio required Shadow CSS, Brotli | Hard limit: 16,384 bytes |
| Studio total initial CSS, Brotli | Hard limit: 18,432 bytes |
| All exported RSC `.txt` payloads | Advisory warning: 157,286,400 bytes |
| Average of 24 localized Home/Blog/Notes/Studio RSC samples | Hard limit: 47,104 bytes |
| Largest localized Home RSC sample | Hard limit: 67,584 bytes |
| Largest localized Blog RSC sample | Hard limit: 50,176 bytes |
| Largest localized Notes RSC sample | Hard limit: 43,008 bytes |
| Largest localized Studio RSC sample | Hard limit: 30,720 bytes |

The 2026-07-20 complete export measured Blog at 213,534 bytes and Notes at
213,444 bytes Brotli after the deferred engagement boundary. The 217,088-byte
limits retain narrow build variance while locking in that verified reduction.

The same complete export records public initial CSS by route. Before the split,
all non-content routes loaded 122,511 raw / 19,439 Brotli bytes in two files;
Blog loaded 172,786 / 27,474 in three, and Notes loaded 187,507 / 30,800 in
four. Route ownership produces the following current measurements and hard
gates:

| Public route | Stylesheets | Measured raw | Measured Brotli | Brotli gate |
|--------------|-------------:|-------------:|----------------:|-------------:|
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

The stylesheet-count column is also the hard per-route maximum. The extra file
on route-owned pages and articles is accepted only with the measured transfer
reduction; future request or Brotli growth fails the artifact gate.

The Blog and Notes entry graphs also carry a structural gate. Their direct
scripts must contain `data-deferred-post-stats` and must not contain configured
Firebase/Firestore provider markers. The complete-export browser verifier then
checks behavior rather than bundle size: an untouched Blog archive makes zero
same-origin RSC or provider-chunk requests; category hover may prefetch only
its target; first scroll enables deferred stats; direct Blog and Notes queries
retain URL state while loading their static index and deferred provider; and a
`Save-Data` Notes query loads its static index without loading that provider.
This gate uses observable state and requests, not fixed delays or transfer-size
estimates.

These values are configuration gates, not frozen measurements. The verifier
prints the observed values from each checked export. The aggregate RSC warning
leaves room for legitimate content growth. Client messages are
checked on every localized route-level `.txt` payload that has a sibling HTML
page. The locale root layout injects no global catalog. Every public route
contains exactly one scoped site provider; only home, Gallery, Blog
collection/category/pagination, and Notes collection/pagination add their
surface provider. Article and other static pages keep the site provider only,
as do curated series and topic hubs, while Studio serializes zero client
message providers. Hub grouping and nine-card slicing stay server-side; those
pages do not mount Explorer or ship a full search index. Every serialized
`messages` occurrence is counted, including null, malformed, primitive, or
empty values, and must match a recognized non-empty scope. Each public Client
Component boundary receives only its declared namespace allowlist. The Studio
contract rejects transitive provider-dependent internationalization as well as
eagerly loaded heavy dashboard, ReactFlow, Recharts, and Firebase markers, and
rejects new third-party connection origins unless they are explicitly reviewed
in `config/static-artifact-budgets.json`.

Search-index ownership follows authored content rather than interface locale.
Blog has authored archives in all six supported locales and exports six
`/[locale]/search/blog.json` files. Notes has authored archives only in English
and Vietnamese, so it exports only `/en/search/notes.json` and
`/vi/search/notes.json`; French, Chinese, Japanese, and Korean Notes landing
pages reuse the English index selected by their existing `archiveLocale`
fallback. The pagination verifier checks this inventory exactly and fails if a
fallback duplicate is emitted.

Studio CSS accounting follows actual runtime ownership. Initial document CSS is
the set of local stylesheets plus combined inline style blocks referenced by
the Studio HTML. Required Shadow CSS is `studio/studio-shadow.css`, referenced
by reachable Studio JavaScript and applied inside the Shadow root. Total initial
CSS combines both measured groups, so Shadow CSS is neither mislabeled as a
document stylesheet nor omitted from the initial cost. The three Brotli caps
are 3,072, 16,384, and 18,432 bytes respectively; external stylesheets fail the
gate unless their origins are explicitly allowlisted.

Public document CSS is route-owned. `src/app/globals.css` keeps the shared
public base, header, footer, offline banner, accessibility behavior, and shared
primitives, including the saved reading-font custom properties applied by the
site-wide prepaint script. Home, About, Gallery, Apps, English practice, and offline fallback
styles are imported statically by their Server Component pages. The Blog and
Notes article layouts share `blog/reader.css`; archives do not download reader
materials or controls. The source gate inventories the complete App Router CSS
import graph and fixes the reader importer set to the two nested article
layouts. It resolves only literal module specifiers, statically reducible
template expressions, and literal `+` concatenations; every unresolved
`import()` or `require()` specifier fails closed before CSS ownership is
evaluated. A type-only CSS import is also rejected because TypeScript erases it
and therefore it cannot satisfy a runtime stylesheet owner. Unconsumed legacy Notes chamber, entry, and
chamber-navigation rules are absent; English result-state rules remain because
the practice workspace constructs those classes dynamically. This changes only stylesheet ownership: rendered
headings, landmarks, metadata, JSON-LD, analytics, locale behavior, and static
URLs remain unchanged. The artifact verifier uses PostCSS and a selector AST
instead of matching minifier-specific text or hashed filenames. It includes
`@scope` roots and limits, ignores keyframe frames and declaration value blocks,
matches exact owner class tokens, and applies route-specific stylesheet-count
and Brotli limits from the latest complete export.

The Studio artifact gate additionally reports the Brotli/raw totals for every
JavaScript chunk transitively reachable from the English Studio entry. Its
direct entry retains the 176,128-byte ceiling. The default-route hard gate
parses Turbopack `Promise.all` loaders and counts every sibling chunk needed by
the selected English locale and Welcome route; the full reachable async total
remains visible separately. Mail, AI Skills, Delivery Checklists, auxiliary
dashboards, ReactFlow, and Recharts must remain reachable lazy chunks and are
forbidden from that default path. Stable sentinels verify isolated loaders for
English, Vietnamese, Chinese, Japanese, Korean, and French and reject
cross-locale copy from the selected English entry.

`npm run analyze` uses the official Next.js 16
`next experimental-analyze --output` command and adds no package. The generated
analysis remains below the ignored `.next/` directory and is diagnostic input,
not a deploy artifact.

The SEO gate requires core public routes for every supported locale and exact
bidirectional parity between sitemap URLs and the published, indexable,
self-canonical HTML set. It deliberately has no fixed URL-count floor because
scheduled and draft content can change the valid corpus. Firebase web
configuration remains allowed because it is a public client identifier;
authorization still belongs in Firebase Rules and App Check.

### Deploy Commands

The authoritative deployment path is
`.github/workflows/nextjs.yml`. A push to `main` runs source checks, performs one
full production build, verifies the artifact, uploads it with the supported
GitHub Pages artifact action, and then deploys that exact verified artifact.
The live Pages API reports `build_type: workflow`, so GitHub Actions is already
the active control-plane source. The API may still expose `gh-pages` under its
legacy `source` field; that residual branch is retained only for rollback and
does not replace the workflow deployment path.

The old branch publisher remains available only as an explicit emergency
fallback:

```bash
npm run build
npm run deploy:legacy
```

`deploy:legacy` requires the opt-in set by its npm script and force-with-lease
publishes the existing `out/` directory to `gh-pages`. After its final cleanup,
the publisher runs both `verify:artifact` and
`verify:performance-artifact` on that exact tree before staging and pushing it.
The target branch is fixed: any `PAGES_BRANCH` environment override is
rejected. It is not a normal release path.
`deploy:legacy:build` additionally bumps `app-version.json` and performs the
full build. `npm run fb-deploy` runs both verifiers immediately before
publishing `out/` to Firebase Hosting. CI and deployment both use npm and Node
22 (minimum 22.18.0).

An emergency rollback is an explicit control-plane operation:

1. Build and inspect `out/`, then run the guarded `deploy:legacy` publisher.
2. Its lease pins the observed remote `gh-pages` SHA, or an empty expected SHA
   when the branch does not exist, so a concurrent branch update is not silently
   overwritten.
3. Change **Settings → Pages → Build and deployment → Source** from
   **GitHub Actions** to the `gh-pages` branch only when the rollback is required.
4. Validate canonical URLs and `sitemap.xml`, then restore **GitHub Actions**
   after the incident is resolved.
5. Keep or delete `gh-pages` only through a deliberate rollback-policy change;
   deleting it removes this recovery option.

### GitHub Actions

| Workflow                            | Trigger                           | Responsibility                                                      |
|-------------------------------------|-----------------------------------|---------------------------------------------------------------------|
| `.github/workflows/ci-frontend.yml` | Pull requests and pushes to `dev` | Type-check, lint, tests, public live released-plus-scheduled OG readiness, one fast smoke build, artifact/SEO verification, and offline browser verification. |
| `.github/workflows/nextjs.yml`      | Pushes, daily schedule, or manual dispatch on `main` | Source checks, public live released-plus-scheduled OG readiness, one full build, released-only live OG and artifact/SEO/offline verification, official Pages artifact upload and deployment. |

## 13. Deployment View

See [C4 Deployment Diagram](./diagrams/c4-deployment.puml).

Main deployment path:

1. Developer commits source and content.
2. GitHub Actions installs dependencies with Node 22 (minimum 22.18.0).
3. Source quality checks and public live released-plus-scheduled article OG
   readiness run before publication.
4. Next.js performs one full static export into `out/`.
5. Route OG images are generated, cached, renamed, and linked as `.png`.
6. Released article JPEGs are verified live without including scheduled-only
   reservations.
7. Architecture, SEO, public-secret, compressed JavaScript, RSC, and Studio
   runtime budgets verify the generated artifact.
8. GitHub Actions uploads and deploys that exact artifact to GitHub Pages.
9. Visitor browsers load static files and optional external scripts.
10. Browser-side engagement calls go to Firebase Firestore.

`firebase.json` also points hosting at `out/`, so Firebase Hosting can serve the
same static export if used.

The root `Dockerfile` and `devops/Dockerfile.local` exist, but the active public
deployment story is static export and GitHub Pages. Because `next.config.mjs`
uses `output: "export"`, any server-style Docker deployment should be reviewed
before relying on it as the primary production path.

## 14. Privacy and Security Notes

- The current public source tree contains no Heartbeats route or family seed
  data. The artifact gate keeps those routes and references out of new builds.
- Removed `/{locale}/heartbeats` URLs are deliberately not blocked by
  `robots.ts`, allowing crawlers to observe the deployed `404`. A Search Console
  temporary removal request is a separate operational follow-up, not access
  control.
- A future private implementation must follow
  [the private Heartbeats boundary](../specs/private-heartbeats-boundary.md).
- Source removal only protects future artifacts. Older Git history, remote
  branches, clones or caches, and an already published Pages artifact can still
  retain the data. Purge, deployment, and post-deploy `404` verification are
  separate, explicitly approved operations.
- Analytics respects Do-Not-Track in the local `track()` helper.
- Firebase engagement uses public client config by design. Firestore rules
  restrict the shape of writes.
- Blog and notes HTML is trusted because it is repo-authored. Sanitize it before
  accepting external or user-generated HTML.
- There are no API routes in the current static deployment model.
- AdSense, Google Analytics, PostHog, Firebase, and remote media/CDN calls are
  external dependencies that can fail without bringing down the static site.

## 15. Engineering Rules to Preserve

When changing this project, preserve these behaviors unless there is an explicit
decision to change them:

- Locale-prefixed URLs and `next-intl` routing.
- English canonical content with locale overlays for blog.
- Two-content-locale behavior for notes: `vi` and `en`.
- Sitemap and hreflang behavior for localized and Vietnamese-only notes.
- SEO metadata and JSON-LD on public pages.
- OpenGraph `.png` post-build rewrite behavior for GitHub Pages.
- PostHog and Google tracking behavior, including Do-Not-Track handling.
- Firebase engagement no-op behavior when env vars are missing.
- The private Heartbeats boundary stays outside the public static artifact.
- Static export compatibility.

## 16. Common Change Recipes

### Add a Blog Post

1. Add canonical metadata to `content/blog-data/_index.json`.
2. Add canonical body to `content/blog-data/posts/<slug>.json`.
3. Add locale override files only for translated fields that exist.
4. For scheduled content, generate its ignored PNG against the effective future
   `CONTENT_BUILD_DATE`, publish the JPEG to `dom-pub`, and run live verification
   with `--include-scheduled` before opening the content PR.
5. Run `npm test` to validate schema assumptions.
6. Run a build or targeted OG build so route social images are generated or restored.

### Add a Note

1. Add metadata to `content/notes-data/_index.json`.
2. Add canonical body to `content/notes-data/posts/<slug>.json`.
3. Set `locales` intentionally.
4. Add Vietnamese override under `content/notes-data/vi` if needed.
5. Reserve a scheduled note's article JPEG through the same reviewed
   `dom-pub` flow before opening the site PR.
6. Check sitemap behavior if the note is Vietnamese-only.

### Add a New Public Page

1. Add a route under `src/app/[locale]`.
2. Add `generateStaticParams()` for all supported locales.
3. Add `generateMetadata()` with canonical and OpenGraph data.
4. Add sitemap and robots behavior if needed.
5. Add tracking with `PageTracker` if it is a meaningful surface.
6. Add an OpenGraph route if the page should have a custom social card.

### Add a New Locale

1. Add the locale to `src/i18n/routing.ts`.
2. Add `messages/<locale>.json`.
3. Update `LOCALE_LABELS`.
4. Update OpenGraph locale maps.
5. Review sitemap, static params, OG generation, and notes content-locale logic.
6. Add tests for labels and route behavior where possible.
