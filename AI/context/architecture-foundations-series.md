# Session: Architecture "Foundations" series — Tier 1 (distributed-systems arc)

## Objective
Continue the blog `architecture` category (series `foundations`) by completing the
distributed-systems arc that began with `monolith-to-microservices` (#5) and
`micro-frontends` (#6). Write 3 new posts (EN + VI), matching the existing
architecture post format exactly.

## Current State — DONE (built & verified)
Added foundations #7–#9 (all dated 2026-06-03, category `architecture`):
- **#7 `event-driven-architecture-and-messaging`** — sync vs async, command vs event,
  brokers (at-least-once not exactly-once), choreography vs orchestration, when NOT.
- **#8 `data-in-distributed-systems`** — db-per-service, ACID→eventual, dual-write +
  outbox, sagas/compensation, CQRS, event sourcing.
- **#9 `resilience-in-distributed-systems`** — fallacies, timeouts, retry/backoff/jitter,
  idempotency, circuit breaker, bulkhead, graceful degradation, observability.

Files (source of truth = `public/blog-data/`):
- `posts/<slug>.json` (EN) + `vi/posts/<slug>.json` (VI) for each — 6 files.
- Registered in `public/blog-data/_index.json` and `vi/_index.json`
  (series=`foundations`, seriesOrder 7/8/9). ja/ko/zh/fr indexes intentionally NOT
  touched (matches recent en+vi-only workflow, e.g. complexity / sdlc-to-adlc).
- `bun run build` PASSED; pages render with SVG diagrams, series prev/next nav,
  takeaways. Output at `out/{en,vi}/blog/architecture/<slug>.html`.

Generator scripts (re-runnable, idempotent): `/tmp/gen_eda.py`, `/tmp/gen_data.py`,
`/tmp/gen_resilience.py`, `/tmp/reg_foundations_tier1.py`.

## Update 2026-06-04 — Foundations #10 added & COMMITTED
- **#10 `scaling-the-database`** (date 2026-06-04, category `architecture`, series `foundations`
  seriesOrder 10): "Scaling the Database — Indexes, Read Replicas, Caching, and Sharding, In That
  Order". Thesis = a *ladder* (measure/index → scale up → read replicas → cache → shard), climb
  cheapest+reversible first. Complements #8 (data ownership) with the orthogonal axis of scaling
  the data layer itself. 3 inline SVG diagrams (ladder, primary+replicas w/ replication lag, shard
  router by key), cache-aside code, EXPLAIN/index code, decision table, by-company-size, takeaways.
  Cross-links to #8 and #9 via `/blog/architecture/<slug>` (matches existing internal-link convention).
- Generator: `/tmp/gen_dbscale.py` (writes both post files + inserts index entries; idempotent).
- `bun run build` PASSED; `out/{en,vi}/blog/architecture/scaling-the-database.html` render OK.
- Committed: `a32857f83 feat(blog): add Foundations #10 'Scaling the Database' ...`.
- ALSO committed the leftover Tái-Ông essay from prev session: `25d78e98a ... 'The Old Man Who Lost
  His Horse' ...` (was untracked + uncommitted index entry).
- NOT pushed (user did not ask). ja/ko/zh/fr indexes still untouched (en+vi-only workflow).

## Update 2026-06-04 (b) — Foundations #11 added & COMMITTED
- **#11 `observability-at-scale`** (date 2026-06-04, series `foundations` seriesOrder 11):
  "You Can't Fix What You Can't See — Logs, Metrics, Traces, and SLOs at Scale". Pairs with #9
  resilience (resilience = build to survive; observability = see it failing). Covers: monitoring vs
  observability, the 3 pillars (metrics/logs/traces + the question each answers), the propagated
  trace ID + OpenTelemetry, trace waterfall, RED/USE + cardinality trap, SLI/SLO/error budget,
  symptom-based alerting + alert fatigue, sampling/retention cost, decision table, by-company-size.
  3 SVG diagrams (3-pillars, trace waterfall, error-budget bar), 2 code blocks (structured log,
  burn-rate alert). Cross-links #9 and #8.
- Generator: `/tmp/gen_observability.py` (idempotent). `bun run build` PASSED (exit 0); both
  `out/{en,vi}/blog/architecture/observability-at-scale.html` render OK.
- Committed: `73667e94d feat(blog): add Foundations #11 'Observability at Scale' ...`. NOT pushed.
- Topic chosen by user via AskUserQuestion (over: API Gateway/BFF, Strategic DDD, Architecture in
  the Age of AI — all still open as future Tier-2/3 candidates).

## Decisions
- Post JSON schema = {slug,category,title,summary,date,readingMinutes,tags,author,html}.
  NO `featured`/`faqs` (those exist only on newer `perspectives` essays).
- `series`/`seriesOrder` live ONLY in the index entries, never in the post files.
- Feed sorts by date desc; category/series pages sort by seriesOrder (src/lib/blog/data.ts).
- HTML conventions reused from existing arch posts: `blog-figure` + inline `dgm-*` SVG,
  `blog-table-wrap`, `blog-callout--{note,tip,warn}`, `blog-takeaways`, `<pre><code>` with
  `.kw/.str/.cmt` spans. readingMinutes ~170 wpm.
- VI voice = Vietnamese prose, English technical terms kept inline (broker, event, saga…).

## Constraints
- Commit message: NO "Co-Authored-By" line.
- Keep diff limited to `public/blog-data/` (out/ & .next are gitignored).

## Next Steps (actionable)
- NOT yet committed. To commit: `git add public/blog-data` then conventional commit
  e.g. `feat(blog): add Foundations #7–9 distributed-systems arc (EDA, data, resilience) — en+vi`.
- Possible Tier 2 follow-ups (not started): API Gateway/BFF/contracts; Strategic DDD
  (bounded contexts, event storming); ADR & evolutionary architecture.
- High-differentiation Tier 3 idea: "Architecture in the Age of AI" (bridges architecture + AI/ADLC threads).
