# English Learning App Design

Date: 2026-06-17

## Scope

Build a hidden English learning app at `/vi/apps/english`, available as an app entry from the existing `/apps` showroom and from a footer apps icon. The route stays out of the main navigation and sitemap. The page uses static content, with client-side study mechanics that make each session feel different.

## Product Shape

The first version is a slang practice console for the provided E-SLANG material. It should feel like a focused learning tool, not a marketing page. The primary workflow is: pick a slang item, read the meaning and examples, hear the sentence, then practice through lightweight modes.

The app includes:

- Slang index: `GHOST`, `SQUAD`, `SALTY`, `TBT`, and `TEA`.
- Warm-up phrases: "Let's be honest", "I am not going to lie", and related starter lines.
- Practice modes: flashcard, fill blank, multiple choice, and listen.
- Session controls: shuffle, next, reveal, mark hard, and reset.
- Text-to-speech through the browser Web Speech API, with graceful fallback when unsupported.

## Architecture

Add a new route under `src/app/[locale]/apps/english/page.tsx`. It renders a client component that owns the interactive learning state. Static slang content lives in a route-local `english.data.ts` file so future lessons can be added without touching UI logic.

The `/apps` data model gains an internal app link field so the E-Slang card can route to `/apps/english` without opening a new tab. The app page reuses the current layout, theme tokens, and analytics conventions.

## Hidden Route Behavior

The app is intentionally discoverable from `/apps` and the footer apps icon, but not from the main header. It is not added to `sitemap.ts`. Page metadata uses `robots: { index: false, follow: false }` to avoid indexing the hidden practice route.

## UX Principles

The app should optimize short, repeatable sessions. Static data becomes dynamic through shuffle order, random examples, randomized quiz choices, reveal states, and in-session hard-card tracking. No persistence or backend is needed for V1.

The interface should stay dense but readable: an index rail, a main study card, and a practice panel on desktop; stacked sections on mobile. Controls must use native buttons and inputs with clear focus states, stable dimensions, and accessible labels.

## Tracking

Keep existing analytics behavior intact. Use the existing page tracker with `page="apps"` and a distinct `section="english_practice"`. Add lightweight client-side tracking for study actions using string event names so the global analytics type does not need broad changes.

## Validation

Run lint and build after implementation. Start the dev server and inspect the page at `/vi/apps/english` and `/vi/apps` for layout, route, footer link, and interaction regressions.
