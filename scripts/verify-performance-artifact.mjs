#!/usr/bin/env node

import { brotliCompressSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createArtifactIndex } from "./lib/artifact-index.mjs";

const DEFAULT_CONFIG = "config/static-artifact-budgets.json";
const DEFAULT_OUTPUT_DIRECTORY = "out";
const CONNECTION_RELATIONS = new Set(["dns-prefetch", "preconnect"]);
const REQUIRED_LOCALES = Object.freeze(["en", "vi", "zh", "ja", "ko", "fr"]);
const REQUIRED_ROUTE_INITIAL_JAVASCRIPT = Object.freeze({
  home: "en.html",
  blog: "en/blog.html",
  notes: "en/notes.html",
  studio: "en/studio.html"
});
const REQUIRED_RSC_SURFACES = Object.freeze([
  "home",
  "blog",
  "notes",
  "studio"
]);

function attributeValue(tag, name) {
  const expression = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i"
  );
  const match = tag.match(expression);
  return match?.[1] ?? match?.[2] ?? null;
}

function collectTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function localArtifactPath(reference, siteOrigin) {
  const url = new URL(reference, siteOrigin);
  if (url.origin !== siteOrigin) return null;

  const decoded = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const normalized = path.posix.normalize(decoded);
  if (
    !normalized ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    path.posix.isAbsolute(normalized)
  ) {
    throw new Error("Invalid local artifact script reference");
  }
  return normalized;
}

function directScriptReferences(html) {
  return [
    ...new Set(
      collectTags(html, "script")
        .map((tag) => attributeValue(tag, "src"))
        .filter(Boolean)
    )
  ];
}

function thirdPartyConnectionOrigins(html, siteOrigin) {
  const origins = new Set();

  for (const tag of collectTags(html, "link")) {
    const relations = (attributeValue(tag, "rel") ?? "")
      .toLowerCase()
      .split(/[\t\n\f\r ]+/)
      .filter(Boolean);
    if (!relations.some((relation) => CONNECTION_RELATIONS.has(relation))) {
      continue;
    }
    const href = attributeValue(tag, "href");
    if (!href) continue;
    const url = new URL(href, siteOrigin);
    if (url.origin !== siteOrigin) origins.add(url.origin);
  }

  for (const reference of directScriptReferences(html)) {
    const url = new URL(reference, siteOrigin);
    if (url.origin !== siteOrigin) origins.add(url.origin);
  }

  return [...origins].sort();
}

function isRscTextFile(index, relativePath) {
  if (!relativePath.endsWith(".txt")) return false;
  if (path.posix.basename(relativePath).startsWith("__next.")) return true;
  return index.has(`${relativePath.slice(0, -4)}.html`);
}

function addLimitFailure(failures, label, actual, limit) {
  if (actual > limit) {
    failures.push(
      `${label} is ${actual.toLocaleString("en-US")}; limit is ${limit.toLocaleString("en-US")}`
    );
  }
}

function localizedRscPath(locale, surface) {
  return surface === "home" ? `${locale}.txt` : `${locale}/${surface}.txt`;
}

function localizedRscKey(locale, surface) {
  return `${locale}:${surface}`;
}

function validateConfig(config) {
  const performance = config?.performance;
  const routes = performance?.routeInitialJavaScript;
  const rsc = performance?.rsc;
  const studio = performance?.studioInitialRuntime;
  const locales = config?.seo?.locales;
  const requiredRouteEntries = Object.entries(
    REQUIRED_ROUTE_INITIAL_JAVASCRIPT
  );
  if (
    config?.schemaVersion !== 1 ||
    config.outputDirectory !== DEFAULT_OUTPUT_DIRECTORY ||
    typeof config.siteOrigin !== "string" ||
    !routes ||
    Object.keys(routes).length !== requiredRouteEntries.length ||
    !requiredRouteEntries.every(
      ([surface, html]) =>
        routes[surface]?.html === html &&
        Number.isInteger(routes[surface]?.maxBrotliBytes) &&
        routes[surface].maxBrotliBytes > 0
    ) ||
    !Array.isArray(locales) ||
    locales.length !== REQUIRED_LOCALES.length ||
    new Set(locales).size !== REQUIRED_LOCALES.length ||
    REQUIRED_LOCALES.some((locale) => !locales.includes(locale)) ||
    !Number.isInteger(rsc?.warnTotalBytes) ||
    rsc.warnTotalBytes < 1 ||
    !Array.isArray(rsc.localizedRouteSamples) ||
    rsc.localizedRouteSamples.length < 1 ||
    rsc.localizedRouteSamples.some(
      (sample) =>
        typeof sample?.locale !== "string" ||
        typeof sample?.surface !== "string" ||
        typeof sample?.path !== "string" ||
        !sample.path.endsWith(".txt")
    ) ||
    !Number.isInteger(rsc.maxAverageLocalizedRouteBytes) ||
    rsc.maxAverageLocalizedRouteBytes < 1 ||
    !rsc.surfaceMaxBytes ||
    REQUIRED_RSC_SURFACES.some(
      (surface) =>
        !Number.isInteger(rsc.surfaceMaxBytes[surface]) ||
        rsc.surfaceMaxBytes[surface] < 1
    ) ||
    !Array.isArray(studio?.requiredMarkers) ||
    studio.requiredMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !Array.isArray(studio?.forbiddenMarkers) ||
    studio.forbiddenMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !Array.isArray(studio?.allowedThirdPartyConnectionOrigins) ||
    studio.allowedThirdPartyConnectionOrigins.some((origin) => {
      try {
        return new URL(origin).origin !== origin;
      } catch {
        return true;
      }
    })
  ) {
    throw new Error("Invalid static performance budget configuration");
  }
  return performance;
}

async function collectInitialJavaScript({
  index,
  htmlPath,
  siteOrigin,
  failures
}) {
  if (!index.has(htmlPath)) {
    failures.push(`Missing performance route sample: ${htmlPath}`);
    return { files: [], rawBytes: 0, brotliBytes: 0, source: "", html: "" };
  }

  const html = await index.readText(htmlPath);
  const files = [];
  const seen = new Set();
  let rawBytes = 0;
  let brotliBytes = 0;
  const sources = [];

  for (const reference of directScriptReferences(html)) {
    let relativePath;
    try {
      relativePath = localArtifactPath(reference, siteOrigin);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (!relativePath || seen.has(relativePath)) continue;
    seen.add(relativePath);
    if (!index.has(relativePath)) {
      failures.push(
        `${htmlPath} references missing local script: ${relativePath}`
      );
      continue;
    }
    const bytes = await index.readBuffer(relativePath);
    files.push(relativePath);
    rawBytes += bytes.length;
    brotliBytes += brotliCompressSync(bytes).length;
    sources.push(bytes.toString("utf8"));
  }

  if (files.length === 0) {
    failures.push(`${htmlPath} has no direct local JavaScript`);
  }

  return {
    files,
    rawBytes,
    brotliBytes,
    source: sources.join("\n"),
    html
  };
}

export async function verifyPerformanceArtifact({
  rootDir = process.cwd(),
  configPath = DEFAULT_CONFIG
} = {}) {
  const absoluteRoot = path.resolve(rootDir);
  const config = JSON.parse(
    await readFile(path.resolve(absoluteRoot, configPath), "utf8")
  );
  const performance = validateConfig(config);
  const siteOrigin = new URL(config.siteOrigin).origin;
  const index = await createArtifactIndex(
    path.resolve(absoluteRoot, DEFAULT_OUTPUT_DIRECTORY)
  );
  const failures = [];
  const warnings = [];
  const routeInitialJavaScript = {};
  const routeSources = new Map();
  const routeHtml = new Map();

  for (const [surface, budget] of Object.entries(
    performance.routeInitialJavaScript
  )) {
    const measured = await collectInitialJavaScript({
      index,
      htmlPath: budget.html,
      siteOrigin,
      failures
    });
    routeInitialJavaScript[surface] = {
      html: budget.html,
      files: measured.files,
      rawBytes: measured.rawBytes,
      brotliBytes: measured.brotliBytes,
      maxBrotliBytes: budget.maxBrotliBytes
    };
    routeSources.set(surface, measured.source);
    routeHtml.set(surface, measured.html);
    addLimitFailure(
      failures,
      `${surface} initial JavaScript Brotli bytes`,
      measured.brotliBytes,
      budget.maxBrotliBytes
    );
  }

  const rscFiles = index.files().filter((file) => isRscTextFile(index, file));
  let totalRscBytes = 0;
  for (const file of rscFiles) {
    totalRscBytes += (await stat(index.resolve(file))).size;
  }
  if (totalRscBytes > performance.rsc.warnTotalBytes) {
    warnings.push(
      `Total RSC text bytes use ${totalRscBytes.toLocaleString("en-US")}; capacity warning starts at ${performance.rsc.warnTotalBytes.toLocaleString("en-US")}`
    );
  }

  const configuredSamples = new Map();
  const configuredPaths = new Map();
  const expectedKeys = new Set(
    REQUIRED_LOCALES.flatMap((locale) =>
      REQUIRED_RSC_SURFACES.map((surface) => localizedRscKey(locale, surface))
    )
  );
  for (const sample of performance.rsc.localizedRouteSamples) {
    const key = localizedRscKey(sample.locale, sample.surface);
    if (!expectedKeys.has(key)) {
      failures.push(`Unexpected configured localized RSC sample: ${key}`);
      continue;
    }
    if (configuredSamples.has(key)) {
      failures.push(`Duplicate configured localized RSC sample: ${key}`);
      continue;
    }
    if (configuredPaths.has(sample.path)) {
      failures.push(
        `Duplicate configured localized RSC sample path: ${sample.path}`
      );
      continue;
    }
    const expectedPath = localizedRscPath(sample.locale, sample.surface);
    if (sample.path !== expectedPath) {
      failures.push(
        `Localized RSC sample ${key} must use ${expectedPath}; received ${sample.path}`
      );
      continue;
    }
    configuredSamples.set(key, sample);
    configuredPaths.set(sample.path, key);
  }

  let localizedRouteBytes = 0;
  let localizedRouteCount = 0;
  const localizedRouteSamples = [];
  const surfaceBytes = Object.fromEntries(
    REQUIRED_RSC_SURFACES.map((surface) => [surface, []])
  );
  for (const locale of REQUIRED_LOCALES) {
    for (const surface of REQUIRED_RSC_SURFACES) {
      const key = localizedRscKey(locale, surface);
      const sample = configuredSamples.get(key);
      if (!sample) {
        failures.push(`Missing configured localized RSC sample: ${key}`);
        continue;
      }
      if (!index.has(sample.path)) {
        failures.push(`Missing localized RSC route sample: ${sample.path}`);
        continue;
      }
      const bytes = (await stat(index.resolve(sample.path))).size;
      localizedRouteSamples.push({ ...sample, bytes });
      localizedRouteBytes += bytes;
      localizedRouteCount += 1;
      surfaceBytes[surface].push(bytes);
      addLimitFailure(
        failures,
        `Localized RSC route ${locale}/${surface} bytes`,
        bytes,
        performance.rsc.surfaceMaxBytes[surface]
      );
    }
  }
  const averageLocalizedRouteBytes = localizedRouteCount
    ? Math.round(localizedRouteBytes / localizedRouteCount)
    : 0;
  addLimitFailure(
    failures,
    "Average localized RSC route bytes",
    averageLocalizedRouteBytes,
    performance.rsc.maxAverageLocalizedRouteBytes
  );
  const localizedSurfaceMetrics = Object.fromEntries(
    REQUIRED_RSC_SURFACES.map((surface) => {
      const values = surfaceBytes[surface];
      const total = values.reduce((sum, value) => sum + value, 0);
      return [
        surface,
        {
          sampleCount: values.length,
          averageBytes: values.length ? Math.round(total / values.length) : 0,
          maxBytes: values.length ? Math.max(...values) : 0,
          limitBytes: performance.rsc.surfaceMaxBytes[surface]
        }
      ];
    })
  );

  const studioSource = routeSources.get("studio") ?? "";
  for (const marker of performance.studioInitialRuntime.requiredMarkers) {
    if (!studioSource.includes(marker)) {
      failures.push(
        `Studio initial JavaScript is missing required marker: ${marker}`
      );
    }
  }
  for (const marker of performance.studioInitialRuntime.forbiddenMarkers) {
    if (studioSource.includes(marker)) {
      failures.push(
        `Studio initial JavaScript contains forbidden marker: ${marker}`
      );
    }
  }

  const studioThirdPartyOrigins = thirdPartyConnectionOrigins(
    routeHtml.get("studio") ?? "",
    siteOrigin
  );
  const allowedStudioOrigins = new Set(
    performance.studioInitialRuntime.allowedThirdPartyConnectionOrigins
  );
  for (const origin of studioThirdPartyOrigins) {
    if (!allowedStudioOrigins.has(origin)) {
      failures.push(
        `Studio declares an unapproved third-party connection: ${origin}`
      );
    }
  }

  return {
    routeInitialJavaScript,
    rsc: {
      fileCount: rscFiles.length,
      totalBytes: totalRscBytes,
      warnTotalBytes: performance.rsc.warnTotalBytes,
      localizedRouteSampleCount: localizedRouteCount,
      localizedRouteSamples,
      localizedSurfaceMetrics,
      averageLocalizedRouteBytes,
      maxAverageLocalizedRouteBytes:
        performance.rsc.maxAverageLocalizedRouteBytes
    },
    studio: {
      thirdPartyConnectionOrigins: studioThirdPartyOrigins,
      requiredInitialMarkers: performance.studioInitialRuntime.requiredMarkers,
      forbiddenInitialMarkers: performance.studioInitialRuntime.forbiddenMarkers
    },
    artifactIndex: index.metrics(),
    failures,
    warnings
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KiB", "MiB", "GiB"];
  let value = bytes;
  let unit = -1;
  do {
    value /= 1024;
    unit += 1;
  } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(1)} ${units[unit]}`;
}

function printReport(report) {
  for (const [surface, measurement] of Object.entries(
    report.routeInitialJavaScript
  )) {
    console.log(
      `[performance] ${surface} initial JavaScript: ${formatBytes(measurement.brotliBytes)} Brotli / ${formatBytes(measurement.rawBytes)} raw`
    );
  }
  console.log(
    `[performance] RSC text: ${report.rsc.fileCount.toLocaleString("en-US")} files / ${formatBytes(report.rsc.totalBytes)}; localized sample average ${formatBytes(report.rsc.averageLocalizedRouteBytes)}`
  );
  console.log(
    `[performance] Studio third-party connection origins: ${report.studio.thirdPartyConnectionOrigins.join(", ") || "none"}`
  );
  for (const warning of report.warnings) console.warn(`[warning] ${warning}`);

  if (report.failures.length > 0) {
    console.error(
      `[verify-performance-artifact] failed with ${report.failures.length} issue(s):`
    );
    for (const failure of report.failures) console.error(`- ${failure}`);
    return false;
  }
  console.log("[verify-performance-artifact] passed");
  return true;
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const report = await verifyPerformanceArtifact();
    if (!printReport(report)) process.exitCode = 1;
  } catch (error) {
    console.error(
      `[verify-performance-artifact] ${error instanceof Error ? error.message : String(error)}`
    );
    process.exitCode = 1;
  }
}
