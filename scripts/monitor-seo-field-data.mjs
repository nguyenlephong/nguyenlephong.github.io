#!/usr/bin/env node

import { createSign } from "node:crypto";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ENDPOINTS = Object.freeze({
  oauthToken: "https://oauth2.googleapis.com/token",
  searchConsole: "https://www.googleapis.com/webmasters/v3",
  urlInspection:
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
  cruxHistory:
    "https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord"
});

const CONFIG_PATH = path.resolve("config/seo-field-monitoring.json");
const SEARCH_CONSOLE_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";
const REQUEST_TIMEOUT_MS = 15_000;
const CRUX_METRIC_KEYS = Object.freeze({
  largest_contentful_paint: "lcp",
  interaction_to_next_paint: "inp",
  cumulative_layout_shift: "cls"
});

class MonitorError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function finiteNumber(value, digits = 3) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value !== "string" && typeof value !== "number")
  ) {
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
}

function nonNegativeInteger(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value !== "string" && typeof value !== "number")
  ) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.trunc(number) : null;
}

function safeText(value, maxLength = 100) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function safeIsoDateTime(value) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function requestReason(error) {
  return error instanceof MonitorError ? error.reason : "request_failed";
}

function combineAvailability(statuses) {
  if (statuses.length === 0) return "unknown";
  if (statuses.every((status) => status === "observed")) return "observed";
  if (
    statuses.some((status) => status === "observed" || status === "partial")
  ) {
    return "partial";
  }
  if (statuses.every((status) => status === "skipped")) return "skipped";
  return "unknown";
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function searchDateRange(now, windowDays, finalDataLagDays) {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  end.setUTCDate(end.getUTCDate() - finalDataLagDays);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - windowDays + 1);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

function priorDateRange(currentRange, windowDays) {
  const end = new Date(`${currentRange.startDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - windowDays + 1);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function requestJson(fetchImpl, url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  timer.unref?.();

  try {
    const response = await fetchImpl(url, {
      ...init,
      signal: controller.signal
    });
    if (!response.ok) throw new MonitorError(`http_${response.status}`);
    try {
      return await response.json();
    } catch {
      throw new MonitorError("invalid_json");
    }
  } catch (error) {
    if (error instanceof MonitorError) throw error;
    if (error?.name === "AbortError") throw new MonitorError("timeout");
    throw new MonitorError("request_failed");
  } finally {
    clearTimeout(timer);
  }
}

function parseServiceAccount(raw) {
  if (!raw) throw new MonitorError("credentials_missing");
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new MonitorError("credentials_invalid");
  }

  if (
    typeof value?.client_email !== "string" ||
    typeof value?.private_key !== "string"
  ) {
    throw new MonitorError("credentials_invalid");
  }
  return value;
}

export async function exchangeServiceAccountToken(
  serviceAccountJson,
  { fetchImpl = fetch, now = new Date() } = {}
) {
  const serviceAccount = parseServiceAccount(serviceAccountJson);
  const issuedAt = Math.floor(now.getTime() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: ENDPOINTS.oauthToken,
      iat: issuedAt,
      exp: issuedAt + 3600
    })
  );
  const unsigned = `${header}.${payload}`;
  let signature;
  try {
    signature = createSign("RSA-SHA256")
      .update(unsigned)
      .end()
      .sign(serviceAccount.private_key, "base64url");
  } catch {
    throw new MonitorError("credentials_invalid");
  }

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: `${unsigned}.${signature}`
  });
  const response = await requestJson(fetchImpl, ENDPOINTS.oauthToken, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  if (typeof response?.access_token !== "string" || !response.access_token) {
    throw new MonitorError("token_missing");
  }
  return response.access_token;
}

function sanitizeSearchAnalytics(response, dateRange) {
  const row = Array.isArray(response?.rows) ? response.rows[0] : null;
  if (!row) {
    return {
      availability: "observed",
      ...dateRange,
      clicks: 0,
      impressions: 0,
      ctr: null,
      position: null,
      aggregation: safeText(response?.responseAggregationType, 30),
      empty: true
    };
  }

  return {
    availability: "observed",
    ...dateRange,
    clicks: finiteNumber(row.clicks),
    impressions: finiteNumber(row.impressions),
    ctr: finiteNumber(row.ctr, 5),
    position: finiteNumber(row.position),
    aggregation: safeText(response.responseAggregationType, 30)
  };
}

export function compareSearchAnalytics(current, prior, config) {
  const comparison = {
    status: "unknown",
    minimumPriorImpressions: config.minimumPriorImpressions,
    dropThresholdPercent: config.impressionDropThresholdPercent,
    impressionChangePercent: null,
    impressionDropPercent: null
  };

  if (
    current.availability !== "observed" ||
    prior.availability !== "observed" ||
    current.impressions === null ||
    prior.impressions === null
  ) {
    return { ...comparison, reason: "window_unavailable" };
  }
  if (prior.impressions < config.minimumPriorImpressions) {
    return { ...comparison, status: "insufficient_baseline" };
  }

  const changePercent = finiteNumber(
    ((current.impressions - prior.impressions) / prior.impressions) * 100,
    1
  );
  const dropPercent = finiteNumber(Math.max(0, -changePercent), 1);
  return {
    ...comparison,
    status:
      dropPercent >= config.impressionDropThresholdPercent
        ? "drop_detected"
        : "within_threshold",
    impressionChangePercent: changePercent,
    impressionDropPercent: dropPercent
  };
}

function sanitizeSitemap(response, sitemapUrl) {
  const sitemap = Array.isArray(response?.sitemap)
    ? response.sitemap.find((entry) => entry?.path === sitemapUrl)
    : null;
  if (!sitemap) return { availability: "unknown", reason: "not_reported" };

  return {
    availability: "observed",
    pending: sitemap.isPending === true,
    errors: nonNegativeInteger(sitemap.errors),
    warnings: nonNegativeInteger(sitemap.warnings),
    lastSubmitted: safeIsoDateTime(sitemap.lastSubmitted),
    lastDownloaded: safeIsoDateTime(sitemap.lastDownloaded),
    contents: Array.isArray(sitemap.contents)
      ? sitemap.contents.map((content) => ({
          type: safeText(content?.type, 30),
          submitted: nonNegativeInteger(content?.submitted),
          indexed: nonNegativeInteger(content?.indexed)
        }))
      : []
  };
}

function sanitizeInspection(response, canary) {
  const result = response?.inspectionResult?.indexStatusResult;
  if (!result) {
    return {
      label: canary.label,
      availability: "unknown",
      reason: "no_data"
    };
  }
  const googleCanonical = safeText(result.googleCanonical, 500);
  const userCanonical = safeText(result.userCanonical, 500);

  return {
    label: canary.label,
    availability: "observed",
    verdict: safeText(result.verdict, 40),
    coverageState: safeText(result.coverageState, 100),
    indexingState: safeText(result.indexingState, 40),
    pageFetchState: safeText(result.pageFetchState, 40),
    robotsTxtState: safeText(result.robotsTxtState, 40),
    lastCrawlTime: safeIsoDateTime(result.lastCrawlTime),
    canonicalMatches:
      googleCanonical && userCanonical
        ? googleCanonical === userCanonical
        : null
  };
}

async function observedOrUnknown(task) {
  try {
    return await task();
  } catch (error) {
    return { availability: "unknown", reason: requestReason(error) };
  }
}

function collectSearchAnalyticsWindow(
  fetchImpl,
  url,
  authorization,
  dateRange
) {
  return observedOrUnknown(async () => {
    const response = await requestJson(fetchImpl, url, {
      method: "POST",
      headers: { ...authorization, "content-type": "application/json" },
      body: JSON.stringify({
        ...dateRange,
        type: "web",
        dataState: "final",
        aggregationType: "byProperty",
        rowLimit: 1
      })
    });
    return sanitizeSearchAnalytics(response, dateRange);
  });
}

export async function collectSearchConsole(
  config,
  { fetchImpl = fetch, now = new Date(), serviceAccountJson, accessToken } = {}
) {
  let token = accessToken;
  if (!token) {
    if (!serviceAccountJson) {
      return { availability: "skipped", reason: "credentials_missing" };
    }
    try {
      token = await exchangeServiceAccountToken(serviceAccountJson, {
        fetchImpl,
        now
      });
    } catch (error) {
      return { availability: "unknown", reason: requestReason(error) };
    }
  }

  const authorization = { authorization: `Bearer ${token}` };
  const propertyPath = encodeURIComponent(config.property);
  const currentRange = searchDateRange(
    now,
    config.windowDays,
    config.finalDataLagDays
  );
  const priorRange = priorDateRange(currentRange, config.windowDays);
  const analyticsUrl = `${ENDPOINTS.searchConsole}/sites/${propertyPath}/searchAnalytics/query`;
  const [current, prior] = await Promise.all([
    collectSearchAnalyticsWindow(
      fetchImpl,
      analyticsUrl,
      authorization,
      currentRange
    ),
    collectSearchAnalyticsWindow(
      fetchImpl,
      analyticsUrl,
      authorization,
      priorRange
    )
  ]);
  const analytics = {
    availability: combineAvailability([
      current.availability,
      prior.availability
    ]),
    current,
    prior,
    comparison: compareSearchAnalytics(current, prior, config)
  };

  const sitemap = await observedOrUnknown(async () => {
    const response = await requestJson(
      fetchImpl,
      `${ENDPOINTS.searchConsole}/sites/${propertyPath}/sitemaps`,
      { headers: authorization }
    );
    return sanitizeSitemap(response, config.sitemapUrl);
  });

  const inspections = [];
  for (const canary of config.inspectionCanaries) {
    const inspection = await observedOrUnknown(async () => {
      const response = await requestJson(fetchImpl, ENDPOINTS.urlInspection, {
        method: "POST",
        headers: { ...authorization, "content-type": "application/json" },
        body: JSON.stringify({
          inspectionUrl: canary.url,
          siteUrl: config.property,
          languageCode: "en-US"
        })
      });
      return sanitizeInspection(response, canary);
    });
    inspections.push(
      inspection.label ? inspection : { ...inspection, label: canary.label }
    );
  }

  const availability = combineAvailability([
    analytics.availability,
    sitemap.availability,
    ...inspections.map((inspection) => inspection.availability)
  ]);
  return { availability, analytics, sitemap, inspections };
}

function dateObject(value) {
  const year = nonNegativeInteger(value?.year);
  const month = nonNegativeInteger(value?.month);
  const day = nonNegativeInteger(value?.day);
  if (!year || !month || !day) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function metricRating(key, value) {
  if (value === null) return "unknown";
  const thresholds = {
    lcp: [2500, 4000],
    inp: [200, 500],
    cls: [0.1, 0.25]
  }[key];
  if (!thresholds) return "unknown";
  if (value <= thresholds[0]) return "good";
  if (value <= thresholds[1]) return "needs_improvement";
  return "poor";
}

function sanitizeCruxRecord(response, target, metricNames) {
  const record = response?.record;
  if (!record?.metrics) {
    return {
      label: target.label,
      kind: target.kind,
      availability: "unknown",
      reason: "no_data"
    };
  }

  const metrics = {};
  for (const metricName of metricNames) {
    const key = CRUX_METRIC_KEYS[metricName];
    if (!key) continue;
    const p75s = record.metrics[metricName]?.percentilesTimeseries?.p75s;
    const value = Array.isArray(p75s)
      ? finiteNumber(p75s.at(-1), key === "cls" ? 4 : 0)
      : null;
    metrics[key] = { p75: value, rating: metricRating(key, value) };
  }

  const metricStatuses = Object.values(metrics).map((metric) =>
    metric.p75 === null ? "unknown" : "observed"
  );
  const latestPeriod = Array.isArray(record.collectionPeriods)
    ? record.collectionPeriods.at(-1)
    : null;

  return {
    label: target.label,
    kind: target.kind,
    availability: combineAvailability(metricStatuses),
    period: latestPeriod
      ? {
          firstDate: dateObject(latestPeriod.firstDate),
          lastDate: dateObject(latestPeriod.lastDate)
        }
      : null,
    metrics
  };
}

export async function collectCrux(config, { fetchImpl = fetch, apiKey } = {}) {
  if (!apiKey) {
    return { availability: "skipped", reason: "api_key_missing" };
  }

  const targets = [
    { label: "origin", kind: "origin", value: config.origin },
    ...config.pages.map((page) => ({
      label: page.label,
      kind: "url",
      value: page.url
    }))
  ];
  const results = [];
  const endpoint = new URL(ENDPOINTS.cruxHistory);
  endpoint.searchParams.set("key", apiKey);

  for (const target of targets) {
    const result = await observedOrUnknown(async () => {
      const body = {
        formFactor: config.formFactor,
        metrics: config.metrics,
        collectionPeriodCount: config.collectionPeriodCount,
        [target.kind]: target.value
      };
      const response = await requestJson(fetchImpl, endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      return sanitizeCruxRecord(response, target, config.metrics);
    });
    const normalized =
      result.reason === "http_404" ? { ...result, reason: "no_data" } : result;
    results.push(
      normalized.label
        ? normalized
        : { ...normalized, label: target.label, kind: target.kind }
    );
  }

  return {
    availability: combineAvailability(
      results.map((result) => result.availability)
    ),
    formFactor: config.formFactor,
    targets: results
  };
}

function healthCode(...parts) {
  return parts
    .filter(Boolean)
    .map((part) =>
      String(part)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
    )
    .filter(Boolean)
    .join("_")
    .slice(0, 120);
}

function unique(values) {
  return [...new Set(values)];
}

export function evaluateSeoHealth(searchConsole, crux) {
  const issues = [];
  const unknowns = [];
  const attention = [];

  if (!searchConsole.analytics) {
    issues.push(
      healthCode("search_console", searchConsole.reason ?? "unavailable")
    );
  } else {
    for (const windowName of ["current", "prior"]) {
      const window = searchConsole.analytics[windowName];
      if (window?.availability !== "observed") {
        issues.push(
          healthCode(
            "search_analytics",
            windowName,
            window?.reason ?? "unavailable"
          )
        );
      }
    }

    const comparison = searchConsole.analytics.comparison;
    if (comparison?.status === "drop_detected") {
      issues.push("search_analytics_impressions_drop");
    } else if (comparison?.status === "insufficient_baseline") {
      unknowns.push("search_analytics_insufficient_baseline");
    } else if (comparison?.status !== "within_threshold") {
      unknowns.push("search_analytics_comparison_unknown");
    }
  }

  const sitemap = searchConsole.sitemap;
  if (!sitemap || sitemap.availability !== "observed") {
    issues.push(
      healthCode(
        "sitemap",
        sitemap?.reason ?? searchConsole.reason ?? "unavailable"
      )
    );
  } else {
    if (sitemap.errors === null) unknowns.push("sitemap_errors_unknown");
    else if (sitemap.errors > 0) issues.push("sitemap_errors_present");
    if (sitemap.warnings === null) unknowns.push("sitemap_warnings_unknown");
    else if (sitemap.warnings > 0) issues.push("sitemap_warnings_present");
    if (sitemap.pending) attention.push("sitemap_pending");
  }

  if (!Array.isArray(searchConsole.inspections)) {
    issues.push(
      healthCode("url_inspection", searchConsole.reason ?? "unavailable")
    );
  } else {
    for (const inspection of searchConsole.inspections) {
      const prefix = healthCode("url_inspection", inspection.label);
      if (inspection.availability !== "observed") {
        issues.push(healthCode(prefix, inspection.reason ?? "unavailable"));
        continue;
      }
      if (inspection.verdict !== "PASS") {
        issues.push(healthCode(prefix, "index_verdict"));
      }
      if (inspection.pageFetchState !== "SUCCESSFUL") {
        issues.push(healthCode(prefix, "fetch"));
      }
      if (inspection.indexingState !== "INDEXING_ALLOWED") {
        issues.push(healthCode(prefix, "indexing"));
      }
      if (inspection.robotsTxtState !== "ALLOWED") {
        issues.push(healthCode(prefix, "robots"));
      }
      if (inspection.canonicalMatches !== true) {
        issues.push(healthCode(prefix, "canonical_mismatch"));
      }
    }
  }

  if (!Array.isArray(crux.targets)) {
    issues.push(healthCode("crux", crux.reason ?? "unavailable"));
  } else {
    for (const target of crux.targets) {
      const prefix = healthCode(
        "crux",
        target.kind,
        target.label === target.kind ? null : target.label
      );
      if (target.availability === "unknown" && target.reason === "no_data") {
        unknowns.push(healthCode(prefix, "no_data"));
        continue;
      }
      if (target.availability === "unknown") {
        issues.push(healthCode(prefix, target.reason ?? "unavailable"));
        continue;
      }
      for (const [metric, result] of Object.entries(target.metrics ?? {})) {
        if (result.rating === "poor") {
          issues.push(healthCode(prefix, metric, "poor"));
        } else if (result.rating === "needs_improvement") {
          attention.push(healthCode(prefix, metric, "needs_improvement"));
        } else if (result.rating !== "good") {
          unknowns.push(healthCode(prefix, metric, "unknown"));
        }
      }
    }
  }

  const sanitizedIssues = unique(issues);
  const sanitizedUnknowns = unique(unknowns);
  const sanitizedAttention = unique(attention);
  const status = sanitizedIssues.length
    ? "action_required"
    : sanitizedAttention.length
      ? "needs_attention"
      : sanitizedUnknowns.length
        ? "unknown"
        : "healthy";

  return {
    status,
    actionRequired: sanitizedIssues.length > 0,
    issues: sanitizedIssues,
    attention: sanitizedAttention,
    unknowns: sanitizedUnknowns
  };
}

function validateConfig(config) {
  if (config?.schemaVersion !== 1) throw new MonitorError("config_invalid");
  const search = config.searchConsole;
  const crux = config.crux;
  if (
    !search ||
    !crux ||
    typeof search.property !== "string" ||
    typeof search.sitemapUrl !== "string" ||
    !Array.isArray(search.inspectionCanaries) ||
    search.inspectionCanaries.some(
      (canary) =>
        typeof canary?.label !== "string" || typeof canary?.url !== "string"
    ) ||
    !Number.isInteger(search.windowDays) ||
    search.windowDays < 1 ||
    !Number.isInteger(search.finalDataLagDays) ||
    search.finalDataLagDays < 0 ||
    !Number.isInteger(search.minimumPriorImpressions) ||
    search.minimumPriorImpressions < 1 ||
    !Number.isFinite(search.impressionDropThresholdPercent) ||
    search.impressionDropThresholdPercent <= 0 ||
    search.impressionDropThresholdPercent > 100 ||
    typeof crux.origin !== "string" ||
    !Array.isArray(crux.pages) ||
    crux.pages.some(
      (page) => typeof page?.label !== "string" || typeof page?.url !== "string"
    ) ||
    !Array.isArray(crux.metrics) ||
    !["PHONE", "DESKTOP", "TABLET"].includes(crux.formFactor) ||
    !Number.isInteger(crux.collectionPeriodCount) ||
    crux.collectionPeriodCount < 1 ||
    crux.collectionPeriodCount > 40
  ) {
    throw new MonitorError("config_invalid");
  }

  const publicUrls = [
    search.sitemapUrl,
    ...search.inspectionCanaries.map((canary) => canary.url),
    ...crux.pages.map((page) => page.url)
  ];
  let origin;
  try {
    origin = new URL(crux.origin).origin;
    if (
      new URL(search.property).origin !== origin ||
      publicUrls.some((value) => new URL(value).origin !== origin)
    ) {
      throw new MonitorError("config_invalid");
    }
  } catch {
    throw new MonitorError("config_invalid");
  }
  if (
    !search.property.startsWith("https://") ||
    search.inspectionCanaries.length < 1 ||
    search.inspectionCanaries.length > 10 ||
    crux.pages.length < 1 ||
    crux.pages.length > 10 ||
    crux.metrics.length < 1 ||
    crux.metrics.some((metric) => !Object.hasOwn(CRUX_METRIC_KEYS, metric))
  ) {
    throw new MonitorError("config_invalid");
  }
  return config;
}

export async function collectSeoFieldData(
  config,
  { fetchImpl = fetch, now = new Date(), env = process.env } = {}
) {
  const validConfig = validateConfig(config);
  const [searchConsole, crux] = await Promise.all([
    collectSearchConsole(validConfig.searchConsole, {
      fetchImpl,
      now,
      serviceAccountJson: env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON
    }),
    collectCrux(validConfig.crux, {
      fetchImpl,
      apiKey: env.CRUX_API_KEY
    })
  ]);

  const sourceAvailability = combineAvailability([
    searchConsole.availability,
    crux.availability
  ]);
  const availability =
    sourceAvailability === "skipped" ? "unknown" : sourceAvailability;
  const health = evaluateSeoHealth(searchConsole, crux);
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    availability,
    health,
    note: "Availability reports whether field data was observed; health reports whether action is required.",
    searchConsole,
    crux
  };
}

function markdownCell(value) {
  if (value === null || value === undefined || value === "") return "unknown";
  return String(value)
    .replace(/[|\r\n]/g, " ")
    .slice(0, 120);
}

function metricCell(metric) {
  if (!metric || metric.p75 === null) return "unknown";
  return `${metric.p75} (${metric.rating})`;
}

export function renderMarkdown(report) {
  const lines = [
    "# SEO field-data monitor",
    "",
    `Availability: **${markdownCell(report.availability)}**`,
    "",
    `SEO health: **${markdownCell(report.health.status)}**`,
    "",
    `Action required: **${report.health.actionRequired ? "yes" : "no"}**`,
    "",
    "> Availability and health are separate. Unknown data is never reported as healthy."
  ];

  if (report.health.issues.length) {
    lines.push("", "## Action required", "");
    for (const issue of report.health.issues) {
      lines.push(`- ${markdownCell(issue)}`);
    }
  }
  if (report.health.attention.length) {
    lines.push("", "## Needs attention", "");
    for (const item of report.health.attention) {
      lines.push(`- ${markdownCell(item)}`);
    }
  }
  if (report.health.unknowns.length) {
    lines.push("", "## Unknown observations", "");
    for (const item of report.health.unknowns) {
      lines.push(`- ${markdownCell(item)}`);
    }
  }

  lines.push(
    "",
    "## Search Console",
    "",
    `Availability: **${markdownCell(report.searchConsole.availability)}**`
  );

  const analytics = report.searchConsole.analytics;
  if (analytics) {
    lines.push(
      "",
      "| Window | Clicks | Impressions | CTR | Position |",
      "| --- | ---: | ---: | ---: | ---: |",
      `| Current: ${markdownCell(analytics.current.startDate)} to ${markdownCell(analytics.current.endDate)} | ${markdownCell(analytics.current.clicks)} | ${markdownCell(analytics.current.impressions)} | ${markdownCell(analytics.current.ctr)} | ${markdownCell(analytics.current.position)} |`,
      `| Prior: ${markdownCell(analytics.prior.startDate)} to ${markdownCell(analytics.prior.endDate)} | ${markdownCell(analytics.prior.clicks)} | ${markdownCell(analytics.prior.impressions)} | ${markdownCell(analytics.prior.ctr)} | ${markdownCell(analytics.prior.position)} |`,
      "",
      `Impression trend: **${markdownCell(analytics.comparison.status)}**; change=${markdownCell(analytics.comparison.impressionChangePercent)}%; alert at drop >=${markdownCell(analytics.comparison.dropThresholdPercent)}% when prior impressions >=${markdownCell(analytics.comparison.minimumPriorImpressions)}`
    );
  } else if (report.searchConsole.reason) {
    lines.push("", `Reason: ${markdownCell(report.searchConsole.reason)}`);
  }

  if (report.searchConsole.sitemap) {
    const sitemap = report.searchConsole.sitemap;
    lines.push(
      "",
      `Sitemap availability: **${markdownCell(sitemap.availability)}**; errors=${markdownCell(sitemap.errors)}, warnings=${markdownCell(sitemap.warnings)}, pending=${markdownCell(sitemap.pending)}`
    );
  }

  if (Array.isArray(report.searchConsole.inspections)) {
    lines.push(
      "",
      "| Canary | Availability | Verdict | Fetch | Canonical match |",
      "| --- | --- | --- | --- | --- |"
    );
    for (const item of report.searchConsole.inspections) {
      lines.push(
        `| ${markdownCell(item.label)} | ${markdownCell(item.availability)} | ${markdownCell(item.verdict ?? item.reason)} | ${markdownCell(item.pageFetchState)} | ${markdownCell(item.canonicalMatches)} |`
      );
    }
  }

  lines.push(
    "",
    "## CrUX History",
    "",
    `Availability: **${markdownCell(report.crux.availability)}**`
  );
  if (report.crux.reason) {
    lines.push("", `Reason: ${markdownCell(report.crux.reason)}`);
  }
  if (Array.isArray(report.crux.targets)) {
    lines.push(
      "",
      "| Target | Availability | LCP p75 | INP p75 | CLS p75 | Period end |",
      "| --- | --- | ---: | ---: | ---: | --- |"
    );
    for (const target of report.crux.targets) {
      lines.push(
        `| ${markdownCell(target.label)} | ${markdownCell(target.availability)} | ${metricCell(target.metrics?.lcp)} | ${metricCell(target.metrics?.inp)} | ${metricCell(target.metrics?.cls)} | ${markdownCell(target.period?.lastDate)} |`
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

async function emitReport(report, env) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (env.GITHUB_STEP_SUMMARY) {
    await appendFile(env.GITHUB_STEP_SUMMARY, renderMarkdown(report), "utf8");
  }
}

async function main() {
  const now = new Date();
  try {
    const config = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
    const report = await collectSeoFieldData(config, { now });
    await emitReport(report, process.env);
    process.exitCode = report.health.actionRequired ? 1 : 0;
  } catch (error) {
    const reason =
      error instanceof MonitorError
        ? error.reason
        : error instanceof SyntaxError
          ? "config_invalid"
          : "monitor_internal_error";
    await emitReport(
      {
        schemaVersion: 1,
        generatedAt: now.toISOString(),
        availability: "unknown",
        health: {
          status: "action_required",
          actionRequired: true,
          issues: [reason],
          attention: [],
          unknowns: []
        },
        note: "Monitoring could not produce a sanitized report.",
        searchConsole: {
          availability: "unknown",
          reason
        },
        crux: {
          availability: "unknown",
          reason
        }
      },
      process.env
    );
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
