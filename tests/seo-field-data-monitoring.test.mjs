import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  ENDPOINTS,
  collectCrux,
  collectSearchConsole,
  collectSeoFieldData,
  compareCanonicalUrls,
  compareSearchAnalytics,
  evaluateSeoHealth,
  exchangeServiceAccountToken,
  missingSeoFieldCredentials,
  renderMarkdown,
  searchDateRange
} from "../scripts/monitor-seo-field-data.mjs";

const config = JSON.parse(
  await readFile("config/seo-field-monitoring.json", "utf8")
);

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function historyRecord({ lcp = "2400", inp = "180", cls = "0.08" } = {}) {
  return {
    record: {
      collectionPeriods: [
        {
          firstDate: { year: 2026, month: 6, day: 12 },
          lastDate: { year: 2026, month: 7, day: 9 }
        }
      ],
      metrics: {
        largest_contentful_paint: {
          percentilesTimeseries: { p75s: [lcp] }
        },
        interaction_to_next_paint: {
          percentilesTimeseries: { p75s: [inp] }
        },
        cumulative_layout_shift: {
          percentilesTimeseries: { p75s: [cls] }
        }
      }
    }
  };
}

function healthyObservedData() {
  return {
    searchConsole: {
      availability: "observed",
      analytics: {
        availability: "observed",
        current: { availability: "observed", impressions: 900 },
        prior: { availability: "observed", impressions: 1_000 },
        comparison: { status: "within_threshold" }
      },
      sitemap: {
        availability: "observed",
        errors: 0,
        warnings: 0,
        pending: false
      },
      inspections: [
        {
          label: "home",
          availability: "observed",
          verdict: "PASS",
          pageFetchState: "SUCCESSFUL",
          indexingState: "INDEXING_ALLOWED",
          robotsTxtState: "ALLOWED",
          canonicalMatches: true
        }
      ]
    },
    crux: {
      availability: "observed",
      targets: [
        {
          label: "origin",
          kind: "origin",
          availability: "observed",
          metrics: {
            lcp: { p75: 2_400, rating: "good" },
            inp: { p75: 180, rating: "good" },
            cls: { p75: 0.08, rating: "good" }
          }
        }
      ]
    }
  };
}

test("Search Console requests stay aggregate and reports discard sensitive dimensions", async () => {
  const calls = [];
  const fetchImpl = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });

    if (url.endsWith("/searchAnalytics/query")) {
      const body = JSON.parse(init.body);
      const currentWindow = body.endDate === "2026-07-14";
      return jsonResponse({
        rows: [
          {
            keys: ["private-query-that-must-not-survive"],
            clicks: currentWindow ? 42 : 60,
            impressions: currentWindow ? 900 : 1_400,
            ctr: currentWindow ? 0.0467 : 0.0429,
            position: currentWindow ? 8.25 : 7.8
          }
        ],
        responseAggregationType: "byProperty"
      });
    }
    if (url.endsWith("/sitemaps")) {
      return jsonResponse({
        sitemap: [
          {
            path: config.searchConsole.sitemapUrl,
            isPending: false,
            errors: null,
            warnings: "1",
            lastSubmitted: "2026-07-10T01:02:03Z",
            lastDownloaded: "2026-07-11T01:02:03Z",
            contents: [{ type: "web", submitted: "904", indexed: "700" }]
          }
        ]
      });
    }
    if (url === ENDPOINTS.urlInspection) {
      const { inspectionUrl } = JSON.parse(init.body);
      return jsonResponse({
        inspectionResult: {
          indexStatusResult: {
            verdict: "PASS",
            coverageState: "Submitted and indexed",
            indexingState: "INDEXING_ALLOWED",
            pageFetchState: "SUCCESSFUL",
            robotsTxtState: "ALLOWED",
            lastCrawlTime: "2026-07-12T01:02:03Z",
            googleCanonical: inspectionUrl,
            userCanonical: inspectionUrl,
            referringUrls: ["https://private.example/referrer"]
          }
        }
      });
    }
    throw new Error(`Unexpected mocked URL: ${url}`);
  };

  const report = await collectSearchConsole(config.searchConsole, {
    fetchImpl,
    accessToken: "access-token-secret",
    now: new Date("2026-07-17T05:17:00Z")
  });

  assert.equal(report.availability, "observed");
  assert.deepEqual(
    {
      startDate: report.analytics.current.startDate,
      endDate: report.analytics.current.endDate
    },
    { startDate: "2026-06-17", endDate: "2026-07-14" }
  );
  assert.deepEqual(
    {
      startDate: report.analytics.prior.startDate,
      endDate: report.analytics.prior.endDate
    },
    { startDate: "2026-05-20", endDate: "2026-06-16" }
  );
  assert.equal(report.analytics.current.impressions, 900);
  assert.equal(report.analytics.prior.impressions, 1_400);
  assert.equal(report.analytics.comparison.status, "drop_detected");
  assert.equal(report.analytics.comparison.impressionDropPercent, 35.7);
  assert.equal(report.sitemap.errors, null);
  assert.equal(report.sitemap.warnings, 1);
  assert.equal(report.inspections.length, 6);
  assert.equal(
    report.inspections.every((item) => item.canonicalMatches),
    true
  );
  assert.equal(
    report.inspections.every(
      (item) =>
        item.canonicalAgreement &&
        item.googleMatchesExpected &&
        item.userMatchesExpected
    ),
    true
  );

  const analyticsCalls = calls.filter((call) =>
    call.url.endsWith("/searchAnalytics/query")
  );
  assert.equal(analyticsCalls.length, 2);
  assert.deepEqual(
    analyticsCalls
      .map((call) => JSON.parse(call.init.body))
      .map((body) => ({
        startDate: body.startDate,
        endDate: body.endDate
      })),
    [
      { startDate: "2026-06-17", endDate: "2026-07-14" },
      { startDate: "2026-05-20", endDate: "2026-06-16" }
    ]
  );
  for (const analyticsCall of analyticsCalls) {
    assert.equal(
      analyticsCall.url,
      `${ENDPOINTS.searchConsole}/sites/${encodeURIComponent(config.searchConsole.property)}/searchAnalytics/query`
    );
    const analyticsBody = JSON.parse(analyticsCall.init.body);
    assert.deepEqual(
      {
        type: analyticsBody.type,
        dataState: analyticsBody.dataState,
        aggregationType: analyticsBody.aggregationType,
        rowLimit: analyticsBody.rowLimit
      },
      {
        type: "web",
        dataState: "final",
        aggregationType: "byProperty",
        rowLimit: 1
      }
    );
    assert.equal(Object.hasOwn(analyticsBody, "dimensions"), false);
    assert.equal(Object.hasOwn(analyticsBody, "dimensionFilterGroups"), false);
    assert.equal(
      analyticsCall.init.headers.authorization,
      "Bearer access-token-secret"
    );
  }

  const serialized = JSON.stringify(report);
  assert.doesNotMatch(
    serialized,
    /private-query|private\.example|access-token-secret/
  );
  assert.doesNotMatch(
    serialized,
    /googleCanonical|userCanonical|referringUrls/
  );
});

test("CrUX History observes origin and pages while preserving missing data as unknown", async () => {
  const apiKey = "crux-api-key-secret";
  const calls = [];
  const fetchImpl = async (input, init = {}) => {
    const url = String(input);
    const body = JSON.parse(init.body);
    calls.push({ url, body });
    if (body.url === config.crux.pages[1].url) {
      return jsonResponse({ error: { message: "not found" } }, 404);
    }
    if (body.url === config.crux.pages[0].url) {
      return jsonResponse(historyRecord({ inp: null }));
    }
    return jsonResponse(historyRecord());
  };

  const report = await collectCrux(config.crux, { fetchImpl, apiKey });

  assert.equal(report.availability, "partial");
  assert.equal(report.targets.length, 1 + config.crux.pages.length);
  assert.equal(report.targets[0].kind, "origin");
  assert.equal(report.targets[0].metrics.lcp.rating, "good");
  assert.equal(report.targets[0].metrics.inp.rating, "good");
  assert.equal(report.targets[0].metrics.cls.rating, "good");
  assert.deepEqual(report.targets[1].metrics.inp, {
    p75: null,
    rating: "unknown"
  });
  assert.equal(report.targets[1].availability, "partial");
  assert.equal(report.targets[2].availability, "unknown");
  assert.equal(report.targets[2].reason, "no_data");

  for (const call of calls) {
    const url = new URL(call.url);
    assert.equal(url.origin + url.pathname, ENDPOINTS.cruxHistory);
    assert.equal(url.searchParams.get("key"), apiKey);
    assert.equal(call.body.formFactor, "PHONE");
    assert.equal(call.body.collectionPeriodCount, 8);
    assert.deepEqual(call.body.metrics, config.crux.metrics);
    assert.equal(
      Object.hasOwn(call.body, "origin") !== Object.hasOwn(call.body, "url"),
      true
    );
  }
  assert.doesNotMatch(JSON.stringify(report), new RegExp(apiKey));
});

test("service-account exchange uses readonly JWT OAuth without exposing credentials", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const serviceAccountJson = JSON.stringify({
    client_email: "seo-monitor@example.iam.gserviceaccount.com",
    private_key: privateKey.export({ format: "pem", type: "pkcs8" })
  });
  let tokenRequest;
  const fetchImpl = async (input, init) => {
    tokenRequest = { url: String(input), init };
    return jsonResponse({ access_token: "short-lived-token" });
  };

  const token = await exchangeServiceAccountToken(serviceAccountJson, {
    fetchImpl,
    now: new Date("2026-07-17T05:17:00Z")
  });

  assert.equal(token, "short-lived-token");
  assert.equal(tokenRequest.url, ENDPOINTS.oauthToken);
  const form = new URLSearchParams(tokenRequest.init.body);
  assert.equal(
    form.get("grant_type"),
    "urn:ietf:params:oauth:grant-type:jwt-bearer"
  );
  const assertion = form.get("assertion");
  assert.equal(assertion.split(".").length, 3);
  const claims = JSON.parse(
    Buffer.from(assertion.split(".")[1], "base64url").toString("utf8")
  );
  assert.equal(
    claims.scope,
    "https://www.googleapis.com/auth/webmasters.readonly"
  );
  assert.equal(claims.aud, ENDPOINTS.oauthToken);
  assert.equal(claims.exp - claims.iat, 3600);
});

test("health is action-required for aggregate drops, sitemap defects, URL failures, and poor CWV", () => {
  const { searchConsole, crux } = healthyObservedData();
  searchConsole.analytics.comparison.status = "drop_detected";
  searchConsole.sitemap.errors = 2;
  searchConsole.sitemap.warnings = 1;
  Object.assign(searchConsole.inspections[0], {
    verdict: "FAIL",
    pageFetchState: "SERVER_ERROR",
    indexingState: "BLOCKED_BY_META_TAG",
    canonicalMatches: false
  });
  crux.targets[0].metrics.lcp = { p75: 4_500, rating: "poor" };

  const health = evaluateSeoHealth(searchConsole, crux);

  assert.equal(health.status, "action_required");
  assert.equal(health.actionRequired, true);
  assert.deepEqual(
    [
      "search_analytics_impressions_drop",
      "sitemap_errors_present",
      "sitemap_warnings_present",
      "url_inspection_home_index_verdict",
      "url_inspection_home_fetch",
      "url_inspection_home_indexing",
      "url_inspection_home_canonical_mismatch",
      "crux_origin_lcp_poor"
    ].every((issue) => health.issues.includes(issue)),
    true
  );
});

test("matching Google and user canonicals still fail when they target the wrong page", () => {
  assert.deepEqual(
    compareCanonicalUrls(
      "https://nguyenlephong.github.io/en",
      "https://nguyenlephong.github.io/en/",
      "https://nguyenlephong.github.io/en/blog"
    ),
    {
      canonicalAgreement: true,
      googleMatchesExpected: false,
      userMatchesExpected: false,
      canonicalMatches: false
    }
  );
});

test("missing page-level CrUX stays unknown without becoming healthy or actionable", () => {
  const { searchConsole, crux } = healthyObservedData();
  crux.availability = "partial";
  crux.targets.push({
    label: "studio",
    kind: "url",
    availability: "unknown",
    reason: "no_data"
  });

  const health = evaluateSeoHealth(searchConsole, crux);

  assert.equal(health.status, "unknown");
  assert.equal(health.actionRequired, false);
  assert.deepEqual(health.issues, []);
  assert.deepEqual(health.unknowns, ["crux_url_studio_no_data"]);
});

test("CrUX authentication or API failures are action-required and sanitized", async () => {
  const apiKey = "must-not-survive";
  const { searchConsole } = healthyObservedData();
  const crux = await collectCrux(config.crux, {
    apiKey,
    fetchImpl: async () => jsonResponse({ error: "credential detail" }, 403)
  });

  const health = evaluateSeoHealth(searchConsole, crux);

  assert.equal(health.status, "action_required");
  assert.equal(health.actionRequired, true);
  assert.equal(
    health.issues.some((issue) => issue.endsWith("http_403")),
    true
  );
  assert.doesNotMatch(
    JSON.stringify({ crux, health }),
    /must-not-survive|credential detail/
  );
});

test("impression drops below the documented prior-volume baseline are not alerts", () => {
  const comparison = compareSearchAnalytics(
    { availability: "observed", impressions: 0 },
    { availability: "observed", impressions: 199 },
    config.searchConsole
  );

  assert.equal(comparison.status, "insufficient_baseline");
  assert.equal(comparison.impressionChangePercent, null);
  assert.equal(comparison.minimumPriorImpressions, 200);

  const boundary = compareSearchAnalytics(
    { availability: "observed", impressions: 700 },
    { availability: "observed", impressions: 1_000 },
    config.searchConsole
  );
  assert.equal(boundary.impressionDropPercent, 30);
  assert.equal(boundary.status, "drop_detected");
});

test("missing required credentials are action-required without making requests", async () => {
  let requested = false;
  const report = await collectSeoFieldData(config, {
    env: {},
    now: new Date("2026-07-17T05:17:00Z"),
    fetchImpl: async () => {
      requested = true;
      throw new Error("should not be called");
    }
  });

  assert.equal(requested, false);
  assert.equal(report.availability, "unknown");
  assert.equal(report.health.status, "action_required");
  assert.equal(report.health.actionRequired, true);
  assert.equal(
    report.health.issues.includes("search_console_credentials_missing"),
    true
  );
  assert.equal(report.health.issues.includes("crux_api_key_missing"), true);
  assert.deepEqual(report.searchConsole, {
    availability: "skipped",
    reason: "credentials_missing"
  });
  assert.deepEqual(report.crux, {
    availability: "skipped",
    reason: "api_key_missing"
  });
  assert.match(renderMarkdown(report), /SEO health: \*\*action_required\*\*/);
  assert.match(renderMarkdown(report), /Action required: \*\*yes\*\*/);
});

test("credential preflight names only missing variables", () => {
  assert.deepEqual(missingSeoFieldCredentials({}), [
    "GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON",
    "CRUX_API_KEY"
  ]);
  assert.deepEqual(
    missingSeoFieldCredentials({
      GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON: "configured",
      CRUX_API_KEY: "configured"
    }),
    []
  );

  const env = { ...process.env };
  delete env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON;
  delete env.CRUX_API_KEY;
  const run = spawnSync(
    process.execPath,
    ["scripts/monitor-seo-field-data.mjs", "--check-credentials"],
    { cwd: process.cwd(), env, encoding: "utf8" }
  );

  assert.equal(run.status, 1);
  assert.equal(run.stdout, "");
  assert.match(run.stderr, /missing required repository secret\(s\)/);
  assert.match(run.stderr, /GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON/);
  assert.match(run.stderr, /CRUX_API_KEY/);
  assert.doesNotMatch(run.stderr, /private_key|BEGIN PRIVATE KEY/i);
});

test("CLI exits non-zero with a sanitized action-required report when secrets are missing", () => {
  const env = { ...process.env };
  delete env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON;
  delete env.CRUX_API_KEY;
  delete env.GITHUB_STEP_SUMMARY;

  const run = spawnSync(
    process.execPath,
    ["scripts/monitor-seo-field-data.mjs"],
    {
      cwd: process.cwd(),
      env,
      encoding: "utf8"
    }
  );
  const report = JSON.parse(run.stdout);

  assert.equal(run.status, 1);
  assert.equal(run.stderr, "");
  assert.equal(report.availability, "unknown");
  assert.equal(report.health.status, "action_required");
  assert.doesNotMatch(
    run.stdout,
    /private_key|client_email|BEGIN PRIVATE KEY/i
  );
});

test("workflow is standalone, weekly, manual, read-only, and action-requiring", async () => {
  const workflow = await readFile(
    ".github/workflows/seo-field-monitoring.yml",
    "utf8"
  );

  assert.match(workflow, /schedule:/);
  assert.match(workflow, /cron: '17 5 \* \* 2'/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.match(workflow, /persist-credentials: false/);
  assert.doesNotMatch(workflow, /continue-on-error/);
  assert.match(workflow, /GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON:/);
  assert.match(workflow, /CRUX_API_KEY:/);
  assert.match(
    workflow,
    /node scripts\/monitor-seo-field-data\.mjs --check-credentials/
  );
  assert.match(workflow, /node scripts\/monitor-seo-field-data\.mjs/);
  assert.doesNotMatch(workflow, /report-search-opportunities/);
  assert.doesNotMatch(workflow, /upload-artifact|upload-pages-artifact/);
  assert.doesNotMatch(
    workflow,
    /contents: write|issues: write|pull-requests: write/
  );
  assert.doesNotMatch(workflow, /^\s*(push|pull_request):/m);
});

test("date range keeps an inclusive finalized window", () => {
  assert.deepEqual(searchDateRange(new Date("2026-07-17T23:59:00Z"), 28, 3), {
    startDate: "2026-06-17",
    endDate: "2026-07-14"
  });
});
