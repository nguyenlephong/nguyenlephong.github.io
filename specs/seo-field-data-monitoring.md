# SEO field-data monitoring

## What

A standalone, read-only GitHub Actions workflow observes SEO field data every
Tuesday and can also be started manually from `main`. It writes a sanitized job summary and
log entry; it does not commit reports, upload public artifacts, submit URLs, or
modify the Search Console property. The workflow has no `push` or pull-request
trigger, so a failed observation cannot gate a deployment or merge.

The monitor reads:

- two aggregate Search Analytics rows for adjacent final 28-day windows,
  without `query`, `page`, or any other grouping dimension;
- the configured sitemap's reported status;
- a small fixed set of URL Inspection canaries;
- CrUX History for the origin and representative public pages on phone traffic.

Availability and health are separate outputs. `observed` only means that an API
returned usable field data. Health is `action_required`, `needs_attention`,
`unknown`, or `healthy`. Missing credentials, insufficient permission, API
errors, sitemap errors or warnings, URL Inspection failures, material Search
Analytics regressions, and poor observed Core Web Vitals are action-required
and make the standalone workflow exit non-zero. A genuinely absent page-level
CrUX sample remains `unknown` and does not become either healthy or actionable.

A separate operator command can request Search Analytics grouped by `page` and
`query`. That data is intentionally private: the command refuses to run in
GitHub Actions, writes only below the ignored `.private/seo/` directory with
owner-only file permissions, and prints only a row count and relative output
path. It is never called by the public monitoring workflow.

## Configuration and access

The public targets live in `config/seo-field-monitoring.json`. Two repository
secrets are required for live observations:

1. `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON`: a Google service-account JSON
   key. Enable the Search Console API and add the service account email as a
   user of the exact `https://nguyenlephong.github.io/` URL-prefix property. The
   script requests only the
   `https://www.googleapis.com/auth/webmasters.readonly` OAuth scope.
2. `CRUX_API_KEY`: a Google Cloud API key with the Chrome UX Report API enabled.
   Restrict the key to that API and rotate it if it is exposed.

Never put either value in the config, source, workflow arguments, screenshots,
or issue comments. GitHub's step summary is public for a public repository, so
the script emits only aggregate metrics, fixed canary labels, sanitized status
fields, and Core Web Vitals percentiles.

The scheduled and manual workflow uses a fail-closed credential policy. A
preflight step names any missing repository secret and exits before network
collection. Partial monitoring is not treated as success. This failure remains
isolated from pull requests and deployment because the observer is a standalone
workflow.

Run the private opportunity report only from a trusted local shell:

```bash
GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON="$(< /secure/path/service-account.json)" \
  npm run seo:opportunities
```

Optional `--start-date`, `--end-date`, `--row-limit`, and `--output` arguments
are accepted. `--output` must remain below `.private/seo/` and use a `.json`
extension. The default final-data window matches the aggregate monitor.

Search Analytics compares the current final 28-day window with the immediately
preceding 28-day window. An impression drop is action-required at **30% or
more**, but only when the prior window has at least **200 impressions**. For this
small public site, 200 impressions is a deliberate noise floor: it requires an
absolute decline of at least 60 impressions before the percentage can alert.
Below that floor the trend is `insufficient_baseline`, health remains `unknown`,
and no drop alert is raised.

## API contracts

The implementation uses the current official endpoints:

- Search Analytics:
  `POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`
- Sitemap list:
  `GET https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps`
- URL Inspection:
  `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`
- CrUX History:
  `POST https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord`

References:

- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://developers.google.com/webmaster-tools/v1/sitemaps/list
- https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
- https://developer.chrome.com/docs/crux/history-api/
- https://web.dev/articles/defining-core-web-vitals-thresholds

The public request omits dimensions and uses `aggregationType: byProperty` so
only one aggregate row can reach public logs. The local report uses
`dimensions: [page, query]`, `aggregationType: auto`, `dataState: final`, and a
maximum `rowLimit` of 25,000, matching the official Search Analytics contract.
Google returns top rows rather than a guaranteed complete corpus; the local
file records that limitation and must not be treated as an exhaustive keyword
export.

## Failure and privacy behavior

- Missing secrets, invalid config, authentication failures, and API failures
  produce `action_required` and a non-zero exit. Because this is a separate
  scheduled/manual workflow, that failure does not gate deploys.
- API response bodies and OAuth errors are never echoed on failure; only a
  bounded reason such as `http_403`, `timeout`, or `no_data` is reported.
- Search Analytics row keys are discarded even if an upstream response includes
  them.
- URL Inspection referring URLs, discovered sitemaps, raw canonicals, rich
  results, and mobile-usability details are not retained.
- Each canary compares both the user and Google canonical with its configured
  expected canonical. Agreement on the same wrong URL is still a failure.
- CrUX API keys remain request-only and never appear in the sanitized report.
- A CrUX `404` for a configured target is treated as unavailable field data,
  not as a healthy value. Page-level absence stays `unknown`, which is expected
  before enough eligible real-user traffic exists.
- Observed Core Web Vitals use the official p75 poor thresholds: LCP over
  4,000 ms, INP over 500 ms, or CLS over 0.25 is action-required.
- The private opportunity command exits before credential parsing whenever
  `GITHUB_ACTIONS` or `GITHUB_STEP_SUMMARY` indicates a GitHub Actions runtime.
- Private output is written atomically with mode `0600`. Raw `page` and `query`
  values are never written to stdout, a step summary, or an uploaded artifact.

## Acceptance criteria

1. The standalone workflow supports weekly and `main`-only manual execution
   with read-only repository permission and no deploy or pull-request trigger.
2. Missing secrets, invalid permissions, and API failures produce a sanitized
   action-required summary and fail this observation workflow.
3. Current and prior Search Analytics requests contain no dimensions or
   query/page filters; a drop of at least 30% alerts only above the 200-impression
   prior-window baseline.
4. Sitemap errors or warnings and URL Inspection fetch, indexing, robots, or
   canonical failures are action-required.
5. Poor observed p75 Core Web Vitals are action-required. Missing page-level
   CrUX data stays unknown and cannot make overall health healthy.
6. Mocked-fetch tests pin request methods, endpoints, bodies, sanitization,
   availability/health separation, exit behavior, and workflow privacy.
7. Missing workflow credentials fail in a named preflight step; no secret value
   or Google response body is included in the error.
8. The local opportunity request pins `page`/`query`, `auto` aggregation, final
   data, and the official 25,000-row ceiling, while GitHub Actions execution is
   rejected before credentials are read.
