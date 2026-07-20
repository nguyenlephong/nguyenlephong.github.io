#!/usr/bin/env node

import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ENDPOINTS,
  exchangeServiceAccountToken,
  searchDateRange
} from "./monitor-seo-field-data.mjs";

const CONFIG_PATH = path.resolve("config/seo-field-monitoring.json");
const REQUEST_TIMEOUT_MS = 15_000;
const PRIVATE_OUTPUT_DIRECTORY = ".private/seo";

class OpportunityError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function finiteNumber(value, digits = 3) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function safeDimension(value, maxLength) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    value.trim().length === 0
  ) {
    return null;
  }
  return value;
}

function validateOpportunityConfig(config) {
  const search = config?.searchConsole;
  const opportunities = config?.privateOpportunities;
  if (
    config?.schemaVersion !== 1 ||
    typeof search?.property !== "string" ||
    !Number.isInteger(search.windowDays) ||
    search.windowDays < 1 ||
    !Number.isInteger(search.finalDataLagDays) ||
    search.finalDataLagDays < 0 ||
    opportunities?.outputDirectory !== PRIVATE_OUTPUT_DIRECTORY ||
    !Number.isInteger(opportunities.rowLimit) ||
    opportunities.rowLimit < 1 ||
    opportunities.rowLimit > 25_000 ||
    !Number.isFinite(opportunities.minimumImpressions) ||
    opportunities.minimumImpressions < 0 ||
    !Number.isFinite(
      opportunities.competingPagesMinimumTotalImpressions
    ) ||
    opportunities.competingPagesMinimumTotalImpressions < 0 ||
    !Number.isFinite(opportunities.lowCtrThreshold) ||
    opportunities.lowCtrThreshold < 0 ||
    opportunities.lowCtrThreshold > 1 ||
    !Number.isFinite(opportunities.strikingDistanceMinimumPosition) ||
    !Number.isFinite(opportunities.strikingDistanceMaximumPosition) ||
    opportunities.strikingDistanceMinimumPosition >=
      opportunities.strikingDistanceMaximumPosition
  ) {
    throw new OpportunityError("config_invalid");
  }
  return { search, opportunities };
}

export function buildOpportunityRequest({ startDate, endDate, rowLimit }) {
  if (!isIsoDate(startDate) || !isIsoDate(endDate) || startDate > endDate) {
    throw new OpportunityError("date_range_invalid");
  }
  if (!Number.isInteger(rowLimit) || rowLimit < 1 || rowLimit > 25_000) {
    throw new OpportunityError("row_limit_invalid");
  }
  return {
    startDate,
    endDate,
    dimensions: ["page", "query"],
    type: "web",
    dataState: "final",
    aggregationType: "auto",
    rowLimit,
    startRow: 0
  };
}

export function groupCompetingPages(
  rows,
  { minimumTotalImpressions }
) {
  if (
    !Number.isFinite(minimumTotalImpressions) ||
    minimumTotalImpressions < 0
  ) {
    throw new OpportunityError("competing_pages_threshold_invalid");
  }

  const queries = new Map();
  for (const row of rows) {
    if (
      typeof row?.page !== "string" ||
      typeof row?.query !== "string" ||
      !Number.isFinite(row.clicks) ||
      !Number.isFinite(row.impressions) ||
      row.clicks < 0 ||
      row.impressions < 0
    ) {
      continue;
    }

    const pages = queries.get(row.query) ?? new Map();
    const existing = pages.get(row.page) ?? {
      page: row.page,
      clicks: 0,
      impressions: 0
    };
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    pages.set(row.page, existing);
    queries.set(row.query, pages);
  }

  return [...queries]
    .map(([query, pagesByUrl]) => {
      const pages = [...pagesByUrl.values()]
        .map((page) => ({
          ...page,
          clicks: finiteNumber(page.clicks),
          impressions: finiteNumber(page.impressions)
        }))
        .sort(
          (left, right) =>
            right.impressions - left.impressions ||
            left.page.localeCompare(right.page, "en")
        );
      return {
        query,
        pageCount: pages.length,
        totalClicks: finiteNumber(
          pages.reduce((total, page) => total + page.clicks, 0)
        ),
        totalImpressions: finiteNumber(
          pages.reduce((total, page) => total + page.impressions, 0)
        ),
        pages
      };
    })
    .filter(
      (group) =>
        group.pageCount >= 2 &&
        group.totalImpressions >= minimumTotalImpressions
    )
    .sort(
      (left, right) =>
        right.totalImpressions - left.totalImpressions ||
        left.query.localeCompare(right.query, "en")
    );
}

async function requestJson(fetchImpl, url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  timer.unref?.();
  try {
    const response = await fetchImpl(url, {
      ...init,
      signal: controller.signal
    });
    if (!response.ok) throw new OpportunityError(`http_${response.status}`);
    try {
      return await response.json();
    } catch {
      throw new OpportunityError("invalid_json");
    }
  } catch (error) {
    if (error instanceof OpportunityError) throw error;
    if (error?.name === "AbortError") throw new OpportunityError("timeout");
    throw new OpportunityError("request_failed");
  } finally {
    clearTimeout(timer);
  }
}

function normalizeOpportunityRow(row, property, config) {
  if (!Array.isArray(row?.keys) || row.keys.length !== 2) return null;
  const page = safeDimension(row.keys[0], 2_048);
  const query = safeDimension(row.keys[1], 500);
  if (!page || !query || !page.startsWith(property)) return null;
  const clicks = finiteNumber(row.clicks);
  const impressions = finiteNumber(row.impressions);
  const ctr = finiteNumber(row.ctr, 5);
  const position = finiteNumber(row.position);
  if ([clicks, impressions, ctr, position].some((value) => value === null)) {
    return null;
  }
  if (clicks < 0 || impressions < 0 || ctr < 0 || ctr > 1 || position < 0) {
    return null;
  }

  const opportunityTypes = [];
  if (
    impressions >= config.minimumImpressions &&
    ctr <= config.lowCtrThreshold
  ) {
    opportunityTypes.push("low_ctr");
  }
  if (
    impressions >= config.minimumImpressions &&
    position > config.strikingDistanceMinimumPosition &&
    position <= config.strikingDistanceMaximumPosition
  ) {
    opportunityTypes.push("striking_distance");
  }

  return {
    page,
    query,
    clicks,
    impressions,
    ctr,
    position,
    opportunityTypes
  };
}

export async function collectSearchOpportunities(
  config,
  {
    fetchImpl = fetch,
    now = new Date(),
    serviceAccountJson,
    accessToken,
    startDate,
    endDate,
    rowLimit
  } = {}
) {
  const { search, opportunities } = validateOpportunityConfig(config);
  const defaultRange = searchDateRange(
    now,
    search.windowDays,
    search.finalDataLagDays
  );
  const request = buildOpportunityRequest({
    startDate: startDate ?? defaultRange.startDate,
    endDate: endDate ?? defaultRange.endDate,
    rowLimit: rowLimit ?? opportunities.rowLimit
  });
  let token = accessToken;
  if (!token) {
    if (!serviceAccountJson) throw new OpportunityError("credentials_missing");
    try {
      token = await exchangeServiceAccountToken(serviceAccountJson, {
        fetchImpl,
        now
      });
    } catch (error) {
      throw new OpportunityError(error?.reason ?? "authentication_failed");
    }
  }

  const propertyPath = encodeURIComponent(search.property);
  const response = await requestJson(
    fetchImpl,
    `${ENDPOINTS.searchConsole}/sites/${propertyPath}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  const responseRows = Array.isArray(response?.rows) ? response.rows : [];
  const rows = responseRows
    .map((row) => normalizeOpportunityRow(row, search.property, opportunities))
    .filter(Boolean);
  const competingPages = groupCompetingPages(rows, {
    minimumTotalImpressions:
      opportunities.competingPagesMinimumTotalImpressions
  });

  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    property: search.property,
    dateRange: {
      startDate: request.startDate,
      endDate: request.endDate,
      dataState: request.dataState
    },
    dimensions: request.dimensions,
    rowLimit: request.rowLimit,
    rowCount: rows.length,
    truncated: responseRows.length === request.rowLimit,
    note: "Private local data. Search Console returns top rows and does not guarantee every query/page pair.",
    competingPages,
    rows
  };
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (
      !["--start-date", "--end-date", "--row-limit", "--output"].includes(
        argument
      )
    ) {
      throw new OpportunityError("arguments_invalid");
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new OpportunityError("arguments_invalid");
    }
    values[argument.slice(2).replaceAll("-", "_")] = value;
    index += 1;
  }
  return values;
}

function privateOutputPath(rootDir, outputDirectory, requestedPath, dateRange) {
  const absoluteRoot = path.resolve(rootDir);
  const privateDirectory = path.resolve(absoluteRoot, outputDirectory);
  const privateDirectoryRelation = path.relative(
    absoluteRoot,
    privateDirectory
  );
  if (
    outputDirectory !== PRIVATE_OUTPUT_DIRECTORY ||
    privateDirectoryRelation.startsWith("..") ||
    path.isAbsolute(privateDirectoryRelation)
  ) {
    throw new OpportunityError("output_directory_invalid");
  }
  const defaultName = `search-opportunities-${dateRange.startDate}-${dateRange.endDate}.json`;
  const relativeRequest =
    requestedPath ?? path.join(outputDirectory, defaultName);
  if (
    path.isAbsolute(relativeRequest) ||
    path.extname(relativeRequest) !== ".json"
  ) {
    throw new OpportunityError("output_path_invalid");
  }
  const outputPath = path.resolve(absoluteRoot, relativeRequest);
  const relation = path.relative(privateDirectory, outputPath);
  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    throw new OpportunityError("output_path_outside_private_directory");
  }
  return { absoluteRoot, privateDirectory, outputPath };
}

function isPathContained(parent, candidate) {
  const relation = path.relative(parent, candidate);
  return (
    relation === "" ||
    (!relation.startsWith("..") && !path.isAbsolute(relation))
  );
}

async function lstatOrNull(candidate) {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function ensurePrivateDirectoryChain({
  absoluteRoot,
  privateDirectory,
  targetParent
}) {
  const rootRealPath = await realpath(absoluteRoot);
  if (!isPathContained(absoluteRoot, privateDirectory)) {
    throw new OpportunityError("output_directory_invalid");
  }
  if (!isPathContained(privateDirectory, targetParent)) {
    throw new OpportunityError("output_path_outside_private_directory");
  }

  const relativeTarget = path.relative(absoluteRoot, targetParent);
  const components = relativeTarget.split(path.sep).filter(Boolean);
  let current = absoluteRoot;
  let privateRealPath = null;

  for (const component of components) {
    current = path.join(current, component);
    let status = await lstatOrNull(current);
    if (!status) {
      try {
        await mkdir(current, { mode: 0o700 });
      } catch (error) {
        if (error?.code !== "EEXIST") throw error;
      }
      status = await lstatOrNull(current);
    }
    if (!status || status.isSymbolicLink() || !status.isDirectory()) {
      throw new OpportunityError("output_directory_symlink_or_invalid");
    }
    await chmod(current, 0o700);
    const currentRealPath = await realpath(current);
    if (!isPathContained(rootRealPath, currentRealPath)) {
      throw new OpportunityError("output_directory_escape");
    }
    if (current === privateDirectory) privateRealPath = currentRealPath;
    if (privateRealPath && !isPathContained(privateRealPath, currentRealPath)) {
      throw new OpportunityError("output_directory_escape");
    }
  }

  if (!privateRealPath) {
    throw new OpportunityError("output_directory_invalid");
  }
  const targetParentRealPath = await realpath(targetParent);
  if (!isPathContained(privateRealPath, targetParentRealPath)) {
    throw new OpportunityError("output_directory_escape");
  }
  return { privateRealPath, targetParentRealPath };
}

async function rejectUnsafeOutputTarget(outputPath) {
  const status = await lstatOrNull(outputPath);
  if (status?.isSymbolicLink() || (status && !status.isFile())) {
    throw new OpportunityError("output_target_symlink_or_invalid");
  }
}

export async function writePrivateOpportunityReport({
  rootDir = process.cwd(),
  outputDirectory,
  requestedPath,
  report
}) {
  const { absoluteRoot, privateDirectory, outputPath } = privateOutputPath(
    rootDir,
    outputDirectory,
    requestedPath,
    report.dateRange
  );
  const targetParent = path.dirname(outputPath);
  await ensurePrivateDirectoryChain({
    absoluteRoot,
    privateDirectory,
    targetParent
  });
  await rejectUnsafeOutputTarget(outputPath);

  const temporaryPath = path.join(
    targetParent,
    `.${path.basename(outputPath)}.tmp-${process.pid}-${randomUUID()}`
  );
  let temporaryCreated = false;
  try {
    await ensurePrivateDirectoryChain({
      absoluteRoot,
      privateDirectory,
      targetParent
    });
    const handle = await open(temporaryPath, "wx", 0o600);
    temporaryCreated = true;
    try {
      await handle.writeFile(`${JSON.stringify(report, null, 2)}\n`, "utf8");
      await handle.chmod(0o600);
      await handle.sync();
    } finally {
      await handle.close();
    }

    await ensurePrivateDirectoryChain({
      absoluteRoot,
      privateDirectory,
      targetParent
    });
    await rejectUnsafeOutputTarget(outputPath);
    const targetParentRealPath = await realpath(targetParent);
    const privateRealPath = await realpath(privateDirectory);
    if (!isPathContained(privateRealPath, targetParentRealPath)) {
      throw new OpportunityError("output_directory_escape");
    }
    await rename(temporaryPath, outputPath);
    temporaryCreated = false;
    const outputStatus = await lstat(outputPath);
    if (outputStatus.isSymbolicLink() || !outputStatus.isFile()) {
      throw new OpportunityError("output_target_symlink_or_invalid");
    }
    await chmod(outputPath, 0o600);
    return outputPath;
  } finally {
    if (temporaryCreated) await rm(temporaryPath, { force: true });
  }
}

async function main() {
  if (
    process.env.GITHUB_ACTIONS === "true" ||
    typeof process.env.GITHUB_STEP_SUMMARY === "string"
  ) {
    throw new OpportunityError("private_report_forbidden_in_github_actions");
  }
  const config = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  const { opportunities } = validateOpportunityConfig(config);
  const args = parseArguments(process.argv.slice(2));
  const report = await collectSearchOpportunities(config, {
    serviceAccountJson: process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON,
    startDate: args.start_date,
    endDate: args.end_date,
    rowLimit: args.row_limit === undefined ? undefined : Number(args.row_limit)
  });
  const outputPath = await writePrivateOpportunityReport({
    outputDirectory: opportunities.outputDirectory,
    requestedPath: args.output,
    report
  });
  const relativePath = path.relative(process.cwd(), outputPath);
  console.log(
    `[seo-opportunities] wrote ${report.rowCount.toLocaleString("en-US")} private rows to ${relativePath}`
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    await main();
  } catch (error) {
    const reason =
      error instanceof OpportunityError
        ? error.reason
        : error instanceof SyntaxError
          ? "config_invalid"
          : "report_internal_error";
    console.error(`[seo-opportunities] ${reason}`);
    process.exitCode = 1;
  }
}
