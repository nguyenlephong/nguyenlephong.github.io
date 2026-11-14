# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary: hiring managers and recruiters for Staff/Principal Engineer, Lead Fullstack/Product Engineer and Engineering Manager roles, at Vietnam product companies and international remote employers. They arrive from a CV link, LinkedIn or search, often on a phone, and decide in minutes whether the owner is worth an interview.
- Secondary: engineers and leads who read the blog, notes and Studio and take a checklist or idea back to their own team.

## Product Purpose

Personal CV and portfolio site of Nguyen Le Phong (Lead Software Engineer at Zalo PC, co-founder of BonBon Mobility). It shows evidence of how he works so the right teams reach out. Success: a hiring manager understands his level and way of working, and contacts him or downloads the résumé.

## Positioning

The site shows the work itself instead of claiming skills: real rollouts with numbers, the checklists and system maps he actually uses (Studio), and long-form writing in his own voice in English and Vietnamese.

## Operating Context

- Static Next.js export on GitHub Pages, six locales (en, vi native; fr, ja, ko, zh), offline service worker, per-page CSP, PostHog cookieless analytics.
- Studio (`/[locale]/studio`): the owner's engineering practice. Reading comes first, tools second. Three modules: delivery checklists (copy as Markdown), a system map (blueprint of a request path, explorable by zone), and AI agent setup notes.

## Capabilities and Constraints

- Every career claim must exist in the evidence ledger; one fact keeps one number across surfaces and locales (see `AI/skills/profile-voice/SKILL.md`, enforced by `scripts/verify-profile-voice.mjs`).
- Every interactive control is tracked through `src/lib/analytics.ts`.
- Performance and CSS/JS budgets are enforced by verifier scripts in CI.
- Owner decisions on Studio (2026-11-14): read-first; use the site header and footer, no separate admin shell; the system map is a viewer (zoom, pick a zone), not an editor; keep only the three modules, AI Skills folds into AI setup.

## Brand Commitments

- Voice: calm, impact-first, written like a senior engineer's own notes; no em dashes, no AI tells, Vietnamese written natively.
- No "part-time" labels on any role.

## Evidence on Hand

- Career facts: `src/content/{experience,projects,profile}.ts`, messages per locale.
- Studio content: `src/app/[locale]/(site)/studio/studio.data.ts` and localized content files.
- Do not invent metrics, testimonials, employers or tools the owner does not use.

## Product Principles

1. Show the work, then the claim.
2. Reading beats operating: a page must make sense without touching a control.
3. One site, one voice: every surface belongs to the same visual and verbal world.
4. Fast and private by default: static, small JS, no cookies.
