import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildOpportunityRequest,
  collectSearchOpportunities,
  writePrivateOpportunityReport
} from "../scripts/report-search-opportunities.mjs";
import { ENDPOINTS } from "../scripts/monitor-seo-field-data.mjs";

const config = JSON.parse(
  await readFile("config/seo-field-monitoring.json", "utf8")
);

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" }
  });
}

test("uses the official read-only page/query Search Analytics contract", async () => {
  let request;
  const report = await collectSearchOpportunities(config, {
    accessToken: "private-access-token",
    now: new Date("2026-07-18T08:00:00Z"),
    startDate: "2026-06-01",
    endDate: "2026-06-28",
    rowLimit: 2_000,
    fetchImpl: async (input, init) => {
      request = { url: String(input), init };
      return jsonResponse({
        rows: [
          {
            keys: [
              "https://nguyenlephong.github.io/en/blog/architecture/ports-and-adapters",
              "ports and adapters"
            ],
            clicks: 3,
            impressions: 120,
            ctr: 0.025,
            position: 8.4
          },
          {
            keys: ["https://foreign.example/page", "must be discarded"],
            clicks: 1,
            impressions: 1,
            ctr: 1,
            position: 1
          },
          {
            keys: [
              "https://nguyenlephong.github.io/en/blog/null-metric",
              "null metric"
            ],
            clicks: null,
            impressions: 10,
            ctr: 0.1,
            position: 2
          },
          {
            keys: [
              "https://nguyenlephong.github.io/en/blog/boolean-metric",
              "boolean metric"
            ],
            clicks: 1,
            impressions: true,
            ctr: 0.1,
            position: 2
          },
          {
            keys: [
              "https://nguyenlephong.github.io/en/blog/array-metric",
              "array metric"
            ],
            clicks: 1,
            impressions: 10,
            ctr: [0.1],
            position: 2
          },
          {
            keys: [
              "https://nguyenlephong.github.io/en/blog/empty-metric",
              "empty metric"
            ],
            clicks: 1,
            impressions: 10,
            ctr: 0.1,
            position: ""
          },
          {
            keys: [
              "https://nguyenlephong.github.io/en/blog/string-metric",
              "string metric"
            ],
            clicks: "1",
            impressions: 10,
            ctr: 0.1,
            position: 2
          }
        ]
      });
    }
  });

  assert.equal(
    request.url,
    `${ENDPOINTS.searchConsole}/sites/${encodeURIComponent(config.searchConsole.property)}/searchAnalytics/query`
  );
  assert.equal(request.init.method, "POST");
  assert.equal(
    request.init.headers.authorization,
    "Bearer private-access-token"
  );
  assert.deepEqual(JSON.parse(request.init.body), {
    startDate: "2026-06-01",
    endDate: "2026-06-28",
    dimensions: ["page", "query"],
    type: "web",
    dataState: "final",
    aggregationType: "auto",
    rowLimit: 2_000,
    startRow: 0
  });
  assert.equal(report.rowCount, 1);
  assert.deepEqual(report.rows[0].opportunityTypes, [
    "low_ctr",
    "striking_distance"
  ]);
  assert.doesNotMatch(JSON.stringify(report), /private-access-token/);
  assert.doesNotMatch(
    JSON.stringify(report),
    /null metric|boolean metric|array metric|empty metric|string metric/
  );
});

test("validates Search Analytics dates and row limits", () => {
  assert.deepEqual(
    buildOpportunityRequest({
      startDate: "2026-06-01",
      endDate: "2026-06-28",
      rowLimit: 25_000
    }).dimensions,
    ["page", "query"]
  );
  assert.throws(
    () =>
      buildOpportunityRequest({
        startDate: "2026-06-31",
        endDate: "2026-07-01",
        rowLimit: 1
      }),
    /date_range_invalid/
  );
  assert.throws(
    () =>
      buildOpportunityRequest({
        startDate: "2026-06-01",
        endDate: "2026-07-01",
        rowLimit: 25_001
      }),
    /row_limit_invalid/
  );
});

test("writes private data only inside the ignored directory with owner-only permissions", async (t) => {
  const rootDir = mkdtempSync(path.join(tmpdir(), "seo-opportunities-"));
  t.after(() => rmSync(rootDir, { recursive: true, force: true }));
  const report = {
    dateRange: { startDate: "2026-06-01", endDate: "2026-06-28" },
    rows: [{ page: "https://example.com/private", query: "private query" }]
  };
  const outputPath = await writePrivateOpportunityReport({
    rootDir,
    outputDirectory: ".private/seo",
    requestedPath: ".private/seo/nested/reports/opportunities.json",
    report
  });

  assert.equal(
    path.relative(rootDir, outputPath),
    ".private/seo/nested/reports/opportunities.json"
  );
  assert.match(readFileSync(outputPath, "utf8"), /private query/);
  assert.equal(statSync(outputPath).mode & 0o777, 0o600);
  for (const directory of [
    ".private",
    ".private/seo",
    ".private/seo/nested",
    ".private/seo/nested/reports"
  ]) {
    assert.equal(statSync(path.join(rootDir, directory)).mode & 0o777, 0o700);
  }
  await assert.rejects(
    writePrivateOpportunityReport({
      rootDir,
      outputDirectory: ".private/seo",
      requestedPath: "public-report.json",
      report
    }),
    /output_path_outside_private_directory/
  );
  assert.match(readFileSync(".gitignore", "utf8"), /^\/\.private\/seo\/$/m);
});

test("rejects a symlinked private output root without writing outside the repository", async (t) => {
  const rootDir = mkdtempSync(path.join(tmpdir(), "seo-opportunities-root-"));
  const outside = mkdtempSync(
    path.join(tmpdir(), "seo-opportunities-outside-")
  );
  t.after(() => {
    rmSync(rootDir, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });
  mkdirSync(path.join(rootDir, ".private"), { recursive: true });
  symlinkSync(outside, path.join(rootDir, ".private/seo"));

  await assert.rejects(
    writePrivateOpportunityReport({
      rootDir,
      outputDirectory: ".private/seo",
      report: {
        dateRange: { startDate: "2026-06-01", endDate: "2026-06-28" },
        rows: [{ query: "must stay private" }]
      }
    }),
    /output_directory_symlink_or_invalid/
  );
  assert.deepEqual(readdirSync(outside), []);
});

test("rejects a nested symlink parent before creating a private report", async (t) => {
  const rootDir = mkdtempSync(path.join(tmpdir(), "seo-opportunities-nested-"));
  const outside = mkdtempSync(
    path.join(tmpdir(), "seo-opportunities-outside-")
  );
  t.after(() => {
    rmSync(rootDir, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });
  mkdirSync(path.join(rootDir, ".private/seo"), { recursive: true });
  symlinkSync(outside, path.join(rootDir, ".private/seo/nested"));

  await assert.rejects(
    writePrivateOpportunityReport({
      rootDir,
      outputDirectory: ".private/seo",
      requestedPath: ".private/seo/nested/report.json",
      report: {
        dateRange: { startDate: "2026-06-01", endDate: "2026-06-28" },
        rows: [{ query: "must stay private" }]
      }
    }),
    /output_directory_symlink_or_invalid/
  );
  assert.deepEqual(readdirSync(outside), []);
});

test("refuses query/page reporting inside GitHub Actions before reading credentials", () => {
  const env = {
    ...process.env,
    GITHUB_ACTIONS: "true",
    GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON:
      '{"private_key":"must-not-leak","client_email":"private@example.com"}'
  };
  const run = spawnSync(
    process.execPath,
    ["scripts/report-search-opportunities.mjs"],
    { cwd: process.cwd(), env, encoding: "utf8" }
  );

  assert.equal(run.status, 1);
  assert.equal(run.stdout, "");
  assert.match(run.stderr, /private_report_forbidden_in_github_actions/);
  assert.doesNotMatch(run.stderr, /must-not-leak|private@example\.com/);
});
