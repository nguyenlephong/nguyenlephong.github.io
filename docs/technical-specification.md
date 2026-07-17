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

The application has seven public-facing surfaces and one private/noindex surface.

| Surface           | Main route                               | Purpose                                                                                                             |
|-------------------|------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| Profile / CV home | `/{locale}`                              | Recruiter-focused personal profile, experience, projects, and contact CTA.                                          |
| About             | `/{locale}/about`                        | Skills, strengths, and engineering principles.                                                                      |
| Gallery           | `/{locale}/gallery`                      | Certificates, awards, project snapshots, and activity images.                                                       |
| Apps              | `/{locale}/apps`                         | Showcase for small tools such as Glance and E-Slang.                                                                |
| Blog              | `/{locale}/blog` and nested post routes  | Engineering articles with SEO metadata, categories, related posts, and engagement widgets.                          |
| Notes             | `/{locale}/notes` and nested note routes | Personal notes and book reflections with bilingual content behavior.                                                |
| Studio            | `/{locale}/studio`                       | Shadow-DOM admin-style workbench for learning notes and engineering setup.                                          |
| Heartbeats        | `/{locale}/heartbeats`                   | Private family-time visualization. It is blocked from search indexing and uses placeholder data in the public repo. |

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
| Motion                  | `framer-motion` with `LazyMotion`         | Lightweight reveal/count/progress animations.                                                            |
| Icons                   | `react-icons`                             | Navigation, cards, controls, app visuals.                                                                |
| Graph/visual tools      | D3 packages                               | Thought graph components exist in the repo, although no active App Router thoughts route is present now. |
| Dates                   | `dayjs`                                   | Heartbeats age and countdown calculations.                                                               |
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
| `src/lib/firebase`     | Client-only Firebase initialization and Firestore post engagement access.                   |
| `src/lib/og`           | OpenGraph image cache and build-target filtering.                                           |
| `messages`             | Locale message files for UI copy.                                                           |
| `public/blog-data`     | Canonical blog metadata/posts and locale overrides.                                         |
| `public/notes-data`    | Canonical notes metadata/posts and Vietnamese overrides.                                    |
| `public/thoughts-data` | Thought graph/content data used by thought components, currently without an active route.   |
| `public/og-cache`      | Cached generated OpenGraph PNGs.                                                            |
| `scripts`              | Build helpers for OG generation, post-build rewriting, version bumping, favicon generation. |
| `tests`                | Node test-runner tests for schemas, route/UI contracts, privacy rules, and OG targeting.    |
| `.github/workflows`    | CI and GitHub Pages deployment workflows.                                                   |

## 6. Routing and Page Behavior

### Locale and public-site shells

`src/app/[locale]/layout.tsx` is the shared locale document boundary. It
validates and sets the locale, provides `next-intl`, owns shared locale
metadata, and loads global analytics.

`src/app/[locale]/(site)/layout.tsx` is the public-site boundary. It initializes
theme, font, and reading-background preferences, then mounts the header,
footer, motion and route progress, offline support, Web Vitals reporting, and
reader tools. The pathless `(site)` segment does not appear in public URLs.
Studio remains outside this route group, so it does not render or hydrate the
public-site shell.

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
| `/{locale}/blog/{category}`        | `src/app/[locale]/(site)/blog/[category]/page.tsx`        | Category landing page.                                                                    |
| `/{locale}/blog/{category}/{slug}` | `src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx` | Article page with schema, related posts, reading tracker, reactions, share dock, and TOC. |
| `/{locale}/notes`                  | `src/app/[locale]/(site)/notes/page.tsx`                  | Notes index with topic filters and CollectionPage JSON-LD.                                |
| `/{locale}/studio`                 | `src/app/[locale]/studio/page.tsx`                 | Shadow-DOM admin workbench, route-isolated from the main profile shell.                   |
| `/{locale}/notes/{slug}`           | `src/app/[locale]/(site)/notes/[slug]/page.tsx`           | Note article page, source-book card, topic breadcrumb, FAQ support, engagement widgets.   |
| `/{locale}/heartbeats`             | `src/app/[locale]/(site)/heartbeats/page.tsx`             | Private/noindex family time visualization with placeholder public data.                   |

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

Canonical blog content lives under `public/blog-data`:

```text
public/blog-data/_index.json
public/blog-data/posts/<slug>.json
```

Per-locale overrides live under:

```text
public/blog-data/<locale>/_index.json
public/blog-data/<locale>/posts/<slug>.json
```

Important behavior:

- English is the canonical/default content.
- `_index.json` holds category metadata and post metadata.
- `posts/<slug>.json` holds the full HTML article body.
- `src/lib/blog/data.ts` overlays translated fields on top of canonical entries.
- Missing translated fields fall back to English instead of creating blank cards
  or missing metadata.
- Canonical blog index and post files are validated by Zod during build.

### Notes Content

Canonical notes content lives under `public/notes-data`:

```text
public/notes-data/_index.json
public/notes-data/posts/<slug>.json
```

Vietnamese overrides live under:

```text
public/notes-data/vi/_index.json
public/notes-data/vi/posts/<slug>.json
```

Important behavior:

- Notes collapse supported UI locales into two content locales.
- `vi` serves Vietnamese content.
- Every other locale serves the English/international content.
- A note can define `locales`, such as `["en", "vi"]`, to decide where it is
  visible.
- Vietnamese-only notes are included in the sitemap only as `/vi/notes/...`.
- Bilingual notes get a full hreflang cluster.

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
| Robots                 | `src/app/robots.ts`                 | Allows public pages, blocks `/private`, `/api`, and localized `/heartbeats`.                  |
| OpenGraph image routes | `src/app/**/opengraph-image.tsx`    | Dynamic social images rendered during static export.                                          |
| Artifact SEO verifier  | `scripts/verify-static-artifact.mjs`| Checks exported sitemap URLs, canonicals, titles, descriptions, language metadata, and robots. |

The artifact verifier works against the generated `out/` directory rather than
source-code patterns. Every sitemap URL must resolve to exported HTML, use the
configured HTTPS origin, have one matching canonical URL, remain indexable, and
include a title, description, and document language. Sitemap alternates must
also point to an indexable URL in the same sitemap.

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
5. `scripts/postbuild-og.mjs` renames extensionless `opengraph-image` files to
   `opengraph-image.png`.
6. The post-build script rewrites emitted HTML so social crawlers see `.png`
   URLs.
7. In fast or targeted builds, missing dynamic OG files can be restored from the
   cache.

This exists because GitHub Pages can serve extensionless image files with a
generic content type. Some social scrapers reject those files, so the project
renames them to explicit PNG paths.

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
- `WebVitalsReporter` for web vitals

PostHog, Google Analytics, and AdSense scripts are loaded from
`src/app/[locale]/layout.tsx`.

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

- Firebase is imported dynamically only on the client.
- If Firebase environment variables are missing, engagement quietly no-ops.
- One view is recorded per browser session through `sessionStorage`.
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
NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY
```

`firestore.rules` allows anyone to read `postStats` and allows constrained
counter writes. The rules constrain ids, exact fields, types, reaction keys,
nonnegative values, affected fields, and deltas, but do not make counters
audit-grade. A determined valid client can still loop allowed increments.

When the App Check site key is configured, reCAPTCHA Enterprise App Check is
initialized before Firestore. Roll out with enforcement disabled, monitor valid
and invalid request metrics across a representative traffic cycle, fix legitimate
invalid traffic, then enable Firestore enforcement. Never ship App Check debug
tokens in the static artifact. See `specs/engagement-provider-boundary.md` for
the monitor-to-enforce and rollback runbook.

## 11. Client UX Systems

| System             | Files                                                  | Behavior                                                                            |
|--------------------|--------------------------------------------------------|-------------------------------------------------------------------------------------|
| Theme              | `ThemeScript`, `ThemeSync`, `useThemeSetting`          | Applies `data-theme` early to avoid flashes, persists dark/light/system preference. |
| Fonts              | `FontScript`, `FontSwitcher`                           | Lets readers change reading font preferences.                                       |
| Reading background | `ReadingBackgroundScript`, `ReadingBackgroundSwitcher` | Applies optional material-style reading backgrounds for long-form pages.            |
| Reader tools       | `BlogReaderTools`                                      | Floating toolbar for scroll controls, font, background, and language switching.     |
| Route progress     | `RouteProgressBar`                                     | Click/popstate-aware progress bar for internal navigation.                          |
| Motion             | `MotionProvider`                                       | Uses `framer-motion` `LazyMotion` with the smaller DOM animation bundle.            |
| Explorer filters   | `ExplorerShell`, `useExplorer`, blog/notes explorers   | Search, filter, tag, and topic/category exploration on content indexes.             |

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
npm run verify:artifact
```

| Command      | Meaning                                                               |
|--------------|-----------------------------------------------------------------------|
| `build`      | Full static export with full OG generation.                           |
| `build:fast` | Static export with dynamic OG generation skipped/restored from cache. |
| `build:og`   | Targeted OG build helper.                                             |
| `verify:artifact` | Verifies output size, route assets, SEO output, and public-secret guardrails without rebuilding. |

`config/static-artifact-budgets.json` contains the static artifact limits. The
limits deliberately sit close to the measured export so new growth is visible
while route and content duplication are reduced:

| Budget | Current limit |
|--------|---------------|
| Total artifact | 850 MiB |
| Total files | 27,500 |
| Largest HTML file | 430 KiB |
| Largest JavaScript file | 1.35 MiB |
| Largest CSS file | 210 KiB |
| JavaScript referenced by one route | 2.2 MiB |
| CSS referenced by one route | 220 KiB |
| Sitemap URL floor | 904 |

The pathless `(site)` route group intentionally adds about 2,144 Next.js RSC
segment files so public pages and Studio can have separate runtime boundaries
without changing public URLs. The complete export measures 26,463 files and
673.7 MiB: the route-group isolation adds only about 6.5 MiB, but its file
inventory requires the 27,500-file ceiling. That cap leaves only 1,037 files,
or about 3.9 percent, of headroom. The 850 MiB byte ceiling remains unchanged;
the adjustment is a measured compatibility allowance rather than permission
for general artifact growth.

The verifier warns at 90 percent of the total-byte and file-count limits. These
are temporary ceilings, not performance targets. Tighten them after the
locale-route and Studio bundle work reduces the baseline. All recognized public
text formats, including exported HTML and Next RSC `.txt` payloads, are scanned
with bounded concurrency for high-confidence private keys and provider tokens.
A PEM finding requires a complete header, credible base64 payload, and matching
footer; a documentation-only header is not treated as a leak. Route-asset
budgets sample the home, blog, notes, and Studio entry points across English,
Vietnamese, Chinese, Japanese, Korean, and French routes. Individual file limits
still cover every emitted HTML, JavaScript, and CSS file.

The SEO gate keeps the current 904-URL sitemap baseline, requires core public
routes for every supported locale, validates every sitemap URL against its
exported canonical HTML, and performs the reverse check for self-canonical,
indexable HTML. Firebase web configuration remains allowed because it is a
public client identifier; authorization still belongs in Firebase Rules and
App Check.

### Deploy Commands

After the control-plane migration below, the authoritative deployment path is
`.github/workflows/nextjs.yml`. A push to `main` runs source checks, performs one
full production build, verifies the artifact, uploads it with the supported
GitHub Pages artifact action, and then deploys that exact verified artifact.
The repository's Pages source must be set to **GitHub Actions** for that deploy
job to become authoritative.

The old branch publisher remains available only as an explicit emergency
fallback:

```bash
npm run build
npm run deploy:legacy
```

`deploy:legacy` requires the opt-in set by its npm script and force-with-lease
publishes the existing `out/` directory to `gh-pages`. After its final cleanup,
the publisher always runs `verify:artifact` on that exact tree before staging
and pushing it. The target branch is fixed: any `PAGES_BRANCH` environment
override is rejected. It is not a normal release path.
`deploy:legacy:build` additionally bumps `app-version.json` and performs the
full build. `npm run fb-deploy` uses the same fixed artifact verifier immediately
before publishing `out/` to Firebase Hosting. CI and deployment both use npm
and Node 22 (minimum 22.18.0).

Merging this change does **not** mutate the repository's live Pages setting. At
the time of this migration, GitHub Pages still uses the legacy branch source.
Perform the control-plane migration after the PR is merged:

1. Leave the existing `gh-pages` deployment serving traffic while the PR lands.
2. Open **Settings → Environments → github-pages → Deployment branches and
   tags**, choose **Selected branches and tags**, and allow only `main`. The
   workflow also checks `github.ref == 'refs/heads/main'`, including manual
   dispatches, but the environment policy is the independent deployment guard.
3. Change **Settings → Pages → Build and deployment → Source** to
   **GitHub Actions** (API `build_type: workflow`).
4. Manually dispatch `nextjs.yml` from `main`, wait for its verified artifact to deploy,
   and validate the public canonical URLs and `sitemap.xml`.
5. If deployment fails, switch the Pages source back to the `gh-pages` branch;
   the guarded legacy publisher remains available until the migration is
   confirmed.
6. After the rollback window, remove the `gh-pages` branch deliberately. The
   source switch does not delete that branch or its last published tree, so it
   remains a live legacy residual until this explicit cleanup is completed.

### GitHub Actions

| Workflow                            | Trigger                           | Responsibility                                                      |
|-------------------------------------|-----------------------------------|---------------------------------------------------------------------|
| `.github/workflows/ci-frontend.yml` | Pull requests and pushes to `dev` | Type-check, lint, tests, one fast smoke build, artifact/SEO verification, and offline browser verification. |
| `.github/workflows/nextjs.yml`      | Pushes to `main` or manual dispatch from `main` | Source checks, one full build, artifact/SEO/offline verification, official Pages artifact upload and deployment. |

## 13. Deployment View

See [C4 Deployment Diagram](./diagrams/c4-deployment.puml).

Main deployment path:

1. Developer commits source and content.
2. GitHub Actions installs dependencies with Node 22 (minimum 22.18.0).
3. Source quality checks run before publication.
4. Next.js performs one full static export into `out/`.
5. OG images are generated, cached, renamed, and linked as `.png`.
6. Architecture, SEO, and public-secret budgets verify the generated artifact.
7. GitHub Actions uploads and deploys that exact artifact to GitHub Pages.
8. Visitor browsers load static files and optional external scripts.
9. Browser-side engagement calls go to Firebase Firestore.

`firebase.json` also points hosting at `out/`, so Firebase Hosting can serve the
same static export if used.

The root `Dockerfile` and `devops/Dockerfile.local` exist, but the active public
deployment story is static export and GitHub Pages. Because `next.config.mjs`
uses `output: "export"`, any server-style Docker deployment should be reviewed
before relying on it as the primary production path.

## 14. Privacy and Security Notes

- The public repository contains placeholder Heartbeats family dates and aliases,
  not real private family data.
- `/{locale}/heartbeats` is noindex and blocked in `robots.ts`.
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
- Heartbeats privacy boundary and placeholder public data.
- Static export compatibility.

## 16. Common Change Recipes

### Add a Blog Post

1. Add canonical metadata to `public/blog-data/_index.json`.
2. Add canonical body to `public/blog-data/posts/<slug>.json`.
3. Add locale override files only for translated fields that exist.
4. Run `npm test` to validate schema assumptions.
5. Run a build or targeted OG build so social images are generated or restored.

### Add a Note

1. Add metadata to `public/notes-data/_index.json`.
2. Add canonical body to `public/notes-data/posts/<slug>.json`.
3. Set `locales` intentionally.
4. Add Vietnamese override under `public/notes-data/vi` if needed.
5. Check sitemap behavior if the note is Vietnamese-only.

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
