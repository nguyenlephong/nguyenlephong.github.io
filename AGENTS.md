# Agent Instructions

When writing or editing public-facing content, blog posts, notes, book reflections, technical explainers, SEO summaries, article metadata, or copy for this repository, read and follow `AI/skills/calm-content-writer/SKILL.md`.

Preserve the existing data model, locale behavior, SEO paths, and engagement/tracking behavior unless the user explicitly asks to change them.

## Analytics And Event Tracking

- Keep PostHog initialization current with the official JavaScript/Next.js SDK guidance while preserving privacy choices such as disabled autocapture/session recording and Do Not Track support unless the user asks otherwise.
- When adding or changing public routes, Studio routes, navigation links, CTAs, forms, command/search UIs, filters, pagination, share/reaction controls, reader tools, preferences, outbound links, or engagement surfaces, update `src/lib/analytics.ts` and add or adjust the relevant `track(...)`/`PageTracker` calls in the same change.
- New public pages should include a surface-specific `PageTracker` event instead of relying only on PostHog automatic `$pageview`.
- Studio changes must track meaningful workspace actions: route opens, command palette opens/results, profile navigation, preference changes/restores, and sidebar/layout controls.
- Preserve existing event names when they are already used by dashboards; if a new taxonomy is needed, add the new event alongside the old one or document the migration in the PR.
- Add or update tests that assert analytics wiring when a test already covers the touched surface.

## Git Workflow

- Work from `dev` for normal changes and open pull requests into `main`, unless the user explicitly requests another branch.
- Before committing, run `git status --short` and review the staged diff so generated files, local build output, secrets, and unrelated user changes are not included.
- Keep commits focused. Do not mix unrelated UI, content, build, and deployment changes in a single commit when they can be separated cleanly.
- Use Conventional Commits for every commit and PR title:
  - Format: `<type>(optional-scope): <imperative summary>`
  - Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
  - Keep the subject concise, lowercase after the type when natural, and without a trailing period.
  - Use `!` or a `BREAKING CHANGE:` footer only for intentional breaking changes.
  - Examples: `feat(studio): add layout density controls`, `fix(blog): preserve localized canonical paths`, `docs: tighten PR workflow rules`.

## Pull Requests

- Use the repository PR template and fill out the sections with concrete, reviewer-friendly details.
- Default PR command for agent-created PRs:
  `gh pr create --base main --head dev --assignee nguyenlephong`
- If a PR already exists for the branch, update it instead of opening a duplicate.
- PR descriptions must include what changed, how it was verified, and any deployment or content/SEO impact.
- For UI changes, include screenshots or clearly state why screenshots were not captured.
- Assign `nguyenlephong` by default. If GitHub rejects assignment, mention that explicitly in the handoff.
