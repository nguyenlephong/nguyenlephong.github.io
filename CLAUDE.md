# Claude Instructions

For content and copywriting tasks in this repository, use the project skill at `AI/skills/calm-content-writer/SKILL.md`.

Apply it before drafting or editing blog posts, notes, book reflections, technical explainers, life-experience essays, SEO summaries, and article metadata.

## Profile and CV copy

For anything that presents Nguyen Le Phong as a candidate (homepage CV sections, /about, SEO title/description, JSON-LD, OG images, README profile lines, `src/content/{experience,projects,profile}.ts`, the resume PDF generator, and the `Hero`, `Sections`, `Summary`, `Experience`, `Projects`, `CTA`, `About`, `SEO` message namespaces), read and follow `AI/skills/profile-voice/SKILL.md` in addition to the calm-content-writer skill. Its non-negotiables are binding: every claim must exist in the evidence ledger, one fact keeps one number across all surfaces and locales, EN and VI are written natively (VI is never a translation), and `node scripts/verify-profile-voice.mjs` must pass. Do not weaken that script or its test to make copy pass; fix the copy.

## Analytics and Event Tracking

- Keep PostHog initialization current with official JavaScript/Next.js SDK guidance while preserving the repository privacy choices.
- When adding or changing routes, navigation, CTAs, filters, search, share/reaction controls, reader tools, Studio preferences, sidebar/layout controls, or outbound links, update `src/lib/analytics.ts` and the relevant `track(...)`/`PageTracker` calls in the same change.
- New public pages need a surface-specific `PageTracker` event. Studio changes should track route opens, command palette usage, profile navigation, preference changes/restores, and sidebar controls.
- Preserve existing event names used by dashboards; add new events deliberately and cover touched analytics wiring in tests where possible.

## Git and PR Rules

- Commit with Conventional Commits: `<type>(optional-scope): <imperative summary>`.
- Prefer these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Keep commits focused and review `git status --short` plus the staged diff before committing.
- Use `dev` as the normal working branch and open PRs into `main` unless instructed otherwise.
- Use the repository PR template. Include summary, verification, risk/deploy notes, and screenshots for UI changes.
- When creating PRs with GitHub CLI, include `--assignee nguyenlephong`.
