# Claude Instructions

For content and copywriting tasks in this repository, use the project skill at `AI/skills/calm-content-writer/SKILL.md`.

Apply it before drafting or editing blog posts, notes, book reflections, technical explainers, life-experience essays, SEO summaries, and article metadata.

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
