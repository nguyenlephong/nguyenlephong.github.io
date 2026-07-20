#!/usr/bin/env node

import { brotliCompressSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createArtifactIndex } from "./lib/artifact-index.mjs";
import {
  extractCssSelectors,
  normalizeCssSelector,
  selectorContainsOwner
} from "./lib/css-selector-contract.mjs";
import {
  validateClientMessageConfig,
  verifyClientMessageRoutes
} from "./lib/client-message-artifact.mjs";

export { expectedClientMessageScopesForLocalizedRoute } from "./lib/client-message-artifact.mjs";

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
const REQUIRED_ARCHIVE_SURFACES = Object.freeze(["blog", "notes"]);
const REQUIRED_PUBLIC_CSS_OWNERS = Object.freeze([
  "home",
  "about",
  "gallery",
  "apps",
  "english",
  "offline",
  "blog",
  "notes",
  "reader"
]);
const REQUIRED_PUBLIC_CSS_ROUTES = Object.freeze({
  home: "en.html",
  about: "en/about.html",
  gallery: "en/gallery.html",
  apps: "en/apps.html",
  english: "en/apps/english.html",
  offline: "en/offline.html",
  blogArchive: "en/blog.html",
  notesArchive: "en/notes.html",
  blogArticle: "en/blog/culture/protecting-attention-in-a-busy-team.html",
  notesArticle: "en/notes/tri-tue-can-duc-hanh.html"
});
const CHUNK_REFERENCE_PATTERN =
  /(?:\/?_next\/)?static\/chunks\/[^"'`\\\s?#]+\.js/g;

function compareText(left, right) {
  return left.localeCompare(right, "en");
}

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

function directStylesheetReferences(html) {
  return [
    ...new Set(
      collectTags(html, "link")
        .filter((tag) =>
          (attributeValue(tag, "rel") ?? "")
            .toLowerCase()
            .split(/[\t\n\f\r ]+/)
            .includes("stylesheet")
        )
        .map((tag) => attributeValue(tag, "href"))
        .filter(Boolean)
    )
  ];
}

function inlineStyleSources(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
    (match) => match[1]
  );
}

export { extractCssSelectors } from "./lib/css-selector-contract.mjs";

function summarizeCssResources(resources) {
  const unique = new Map();
  for (const resource of resources) {
    if (!unique.has(resource.key)) unique.set(resource.key, resource);
  }
  return [...unique.values()].reduce(
    (summary, resource) => ({
      rawBytes: summary.rawBytes + resource.rawBytes,
      brotliBytes: summary.brotliBytes + resource.brotliBytes
    }),
    { rawBytes: 0, brotliBytes: 0 }
  );
}

function referencedScriptChunks(source) {
  return [
    ...new Set(
      [...source.matchAll(CHUNK_REFERENCE_PATTERN)].map((match) => {
        const reference = match[0].replace(/^\//, "");
        return reference.startsWith("_next/")
          ? reference
          : `_next/${reference}`;
      })
    )
  ];
}

async function collectReachableJavaScript({ index, initialFiles, failures }) {
  const queue = [...initialFiles];
  const seen = new Set(queue);
  const sources = [];

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const file = queue[cursor];
    const source = await index.readText(file);
    sources.push(source);
    for (const reference of referencedScriptChunks(source)) {
      if (seen.has(reference)) continue;
      if (!index.has(reference)) {
        failures.push(
          `Studio JavaScript references missing chunk: ${reference}`
        );
        continue;
      }
      seen.add(reference);
      queue.push(reference);
    }
  }

  return { files: queue, source: sources.join("\n") };
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

  return [...origins].sort(compareText);
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

function hasExactKeys(value, expectedKeys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort(compareText);
  const expected = [...expectedKeys].sort(compareText);
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function validatePublicInitialCss(config) {
  if (
    !hasExactKeys(config?.ownerSelectors, REQUIRED_PUBLIC_CSS_OWNERS) ||
    !hasExactKeys(config?.routes, Object.keys(REQUIRED_PUBLIC_CSS_ROUTES))
  ) {
    return false;
  }

  const selectorFamilies = Object.values(config.ownerSelectors);
  const selectors = selectorFamilies.flat();
  if (
    new Set(selectors).size !== selectors.length ||
    selectorFamilies.some(
      (family) =>
        !Array.isArray(family) ||
        family.length < 1 ||
        new Set(family).size !== family.length
    ) ||
    selectors.some(
      (selector) =>
        typeof selector !== "string" ||
        selector.length === 0 ||
        normalizeCssSelector(selector) !== selector ||
        /[{},@]/.test(selector) ||
        !selectorContainsOwner(selector, selector)
    )
  ) {
    return false;
  }

  for (const [surface, expectedHtml] of Object.entries(
    REQUIRED_PUBLIC_CSS_ROUTES
  )) {
    const route = config.routes[surface];
    if (
      route?.html !== expectedHtml ||
      !Number.isInteger(route.maxStylesheetCount) ||
      route.maxStylesheetCount < 1 ||
      !Number.isInteger(route.maxBrotliBytes) ||
      route.maxBrotliBytes < 1
    ) {
      return false;
    }
    for (const field of ["requiredOwners", "allowedOwners"]) {
      const owners = route[field];
      if (
        !Array.isArray(owners) ||
        owners.length < 1 ||
        new Set(owners).size !== owners.length ||
        owners.some((owner) => !REQUIRED_PUBLIC_CSS_OWNERS.includes(owner))
      ) {
        return false;
      }
    }
    if (
      route.requiredOwners.some((owner) => !route.allowedOwners.includes(owner))
    ) {
      return false;
    }
  }
  return true;
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
  const clientMessages = performance?.clientMessages;
  const archives = performance?.archiveInitialRuntime;
  const publicCss = performance?.publicInitialCss;
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
    !validateClientMessageConfig(clientMessages) ||
    !Array.isArray(archives?.requiredMarkers) ||
    archives.requiredMarkers.length < 1 ||
    archives.requiredMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !Array.isArray(archives?.forbiddenMarkers) ||
    archives.forbiddenMarkers.length < 1 ||
    archives.forbiddenMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !validatePublicInitialCss(publicCss) ||
    !Array.isArray(studio?.requiredMarkers) ||
    studio.requiredMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !Array.isArray(studio?.requiredReachableMarkers) ||
    studio.requiredReachableMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !Array.isArray(studio?.forbiddenMarkers) ||
    studio.forbiddenMarkers.some(
      (marker) => typeof marker !== "string" || marker.length === 0
    ) ||
    !Number.isInteger(studio?.maxInitialDocumentCssBrotliBytes) ||
    studio.maxInitialDocumentCssBrotliBytes < 1 ||
    !Array.isArray(studio?.requiredShadowCssFiles) ||
    studio.requiredShadowCssFiles.length < 1 ||
    studio.requiredShadowCssFiles.some((file) => {
      if (typeof file !== "string" || !file.endsWith(".css")) return true;
      const normalized = path.posix.normalize(file);
      return (
        normalized !== file ||
        normalized.startsWith("../") ||
        path.posix.isAbsolute(normalized)
      );
    }) ||
    !Number.isInteger(studio?.maxShadowCssBrotliBytes) ||
    studio.maxShadowCssBrotliBytes < 1 ||
    !Number.isInteger(studio?.maxTotalInitialCssBrotliBytes) ||
    studio.maxTotalInitialCssBrotliBytes < 1 ||
    !Array.isArray(studio?.allowedExternalStylesheetOrigins) ||
    studio.allowedExternalStylesheetOrigins.some((origin) => {
      try {
        return new URL(origin).origin !== origin;
      } catch {
        return true;
      }
    }) ||
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

async function collectInitialDocumentCss({
  index,
  html,
  siteOrigin,
  allowedExternalStylesheetOrigins,
  failures
}) {
  const localFiles = [];
  const externalStylesheets = [];
  const inlineStyles = [];
  const resources = [];
  const seen = new Set();

  for (const reference of directStylesheetReferences(html)) {
    let relativePath;
    try {
      relativePath = localArtifactPath(reference, siteOrigin);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (!relativePath) {
      const origin = new URL(reference, siteOrigin).origin;
      externalStylesheets.push(reference);
      if (!allowedExternalStylesheetOrigins.has(origin)) {
        failures.push(
          `Studio declares an unapproved external stylesheet: ${reference}`
        );
      }
      continue;
    }
    if (seen.has(relativePath)) continue;
    seen.add(relativePath);
    if (!index.has(relativePath)) {
      failures.push(
        `Studio references missing local stylesheet: ${relativePath}`
      );
      continue;
    }
    const bytes = await index.readBuffer(relativePath);
    const resource = {
      key: `file:${relativePath}`,
      rawBytes: bytes.length,
      brotliBytes: brotliCompressSync(bytes).length
    };
    localFiles.push(relativePath);
    resources.push(resource);
  }

  const inlineBuffers = [];
  for (const [index, source] of inlineStyleSources(html).entries()) {
    const bytes = Buffer.from(source);
    inlineBuffers.push(bytes);
    inlineStyles.push({ index, rawBytes: bytes.length });
  }
  if (inlineBuffers.length > 0) {
    const combinedInlineCss = Buffer.concat(inlineBuffers);
    resources.push({
      key: "inline:document",
      rawBytes: combinedInlineCss.length,
      brotliBytes: brotliCompressSync(combinedInlineCss).length
    });
  }

  if (localFiles.length === 0) {
    failures.push("Studio HTML has no direct local stylesheet");
  }

  return {
    localFiles,
    inlineStyles,
    externalStylesheets,
    resources,
    ...summarizeCssResources(resources)
  };
}

async function collectRequiredShadowCss({ index, requiredFiles, failures }) {
  const files = [];
  const resources = [];

  for (const relativePath of requiredFiles) {
    if (!index.has(relativePath)) {
      failures.push(
        `Studio required Shadow stylesheet is missing: ${relativePath}`
      );
      continue;
    }
    const bytes = await index.readBuffer(relativePath);
    files.push(relativePath);
    resources.push({
      key: `file:${relativePath}`,
      rawBytes: bytes.length,
      brotliBytes: brotliCompressSync(bytes).length
    });
  }

  return { files, resources, ...summarizeCssResources(resources) };
}

async function collectPublicRouteCss({
  index,
  htmlPath,
  surface,
  siteOrigin,
  failures
}) {
  if (!index.has(htmlPath)) {
    failures.push(`Missing public CSS route sample: ${htmlPath}`);
    return { files: [], rawBytes: 0, brotliBytes: 0, source: "" };
  }

  const html = await index.readText(htmlPath);
  const files = [];
  const sources = [];
  let rawBytes = 0;
  let brotliBytes = 0;

  for (const reference of directStylesheetReferences(html)) {
    let relativePath;
    try {
      relativePath = localArtifactPath(reference, siteOrigin);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (!relativePath) {
      failures.push(
        `${surface} declares an external initial stylesheet: ${reference}`
      );
      continue;
    }
    if (files.includes(relativePath)) continue;
    if (!index.has(relativePath)) {
      failures.push(
        `${surface} references missing local stylesheet: ${relativePath}`
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
    failures.push(`${surface} HTML has no direct local stylesheet`);
  }
  return { files, rawBytes, brotliBytes, source: sources.join("\n") };
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

  const clientMessages = await verifyClientMessageRoutes({
    index,
    config: performance.clientMessages,
    failures
  });

  const archiveInitialRuntime = {};
  for (const surface of REQUIRED_ARCHIVE_SURFACES) {
    const source = routeSources.get(surface) ?? "";
    const missingMarkers =
      performance.archiveInitialRuntime.requiredMarkers.filter(
        (marker) => !source.includes(marker)
      );
    const forbiddenMarkers =
      performance.archiveInitialRuntime.forbiddenMarkers.filter((marker) =>
        source.includes(marker)
      );
    for (const marker of missingMarkers) {
      failures.push(
        `${surface} initial JavaScript is missing deferred archive marker: ${marker}`
      );
    }
    for (const marker of forbiddenMarkers) {
      failures.push(
        `${surface} initial JavaScript contains eager engagement provider marker: ${marker}`
      );
    }
    archiveInitialRuntime[surface] = {
      missingMarkers,
      forbiddenMarkers
    };
  }

  const publicInitialCss = {};
  const publicOwnerEntries = Object.entries(
    performance.publicInitialCss.ownerSelectors
  );
  for (const [surface, budget] of Object.entries(
    performance.publicInitialCss.routes
  )) {
    const measured = await collectPublicRouteCss({
      index,
      htmlPath: budget.html,
      surface,
      siteOrigin,
      failures
    });
    addLimitFailure(
      failures,
      `${surface} initial stylesheet count`,
      measured.files.length,
      budget.maxStylesheetCount
    );
    addLimitFailure(
      failures,
      `${surface} initial CSS Brotli bytes`,
      measured.brotliBytes,
      budget.maxBrotliBytes
    );

    const measuredSelectors = extractCssSelectors(measured.source);
    const includesOwnerSelector = (ownerSelector) =>
      [...measuredSelectors].some((selector) =>
        selectorContainsOwner(selector, ownerSelector)
      );
    const includesEveryOwnerSelector = (owner) =>
      performance.publicInitialCss.ownerSelectors[owner].every(
        includesOwnerSelector
      );
    const includesAnyOwnerSelector = (owner) =>
      performance.publicInitialCss.ownerSelectors[owner].some(
        includesOwnerSelector
      );
    const missingOwners = budget.requiredOwners.filter(
      (owner) => !includesEveryOwnerSelector(owner)
    );
    const forbiddenOwners = publicOwnerEntries
      .filter(
        ([owner]) =>
          !budget.allowedOwners.includes(owner) && includesAnyOwnerSelector(owner)
      )
      .map(([owner]) => owner);
    for (const owner of missingOwners) {
      failures.push(
        `${surface} initial CSS is missing required owner: ${owner}`
      );
    }
    for (const owner of forbiddenOwners) {
      failures.push(
        `${surface} initial CSS contains unrelated owner: ${owner}`
      );
    }
    publicInitialCss[surface] = {
      html: budget.html,
      files: measured.files,
      rawBytes: measured.rawBytes,
      brotliBytes: measured.brotliBytes,
      maxStylesheetCount: budget.maxStylesheetCount,
      maxBrotliBytes: budget.maxBrotliBytes,
      missingOwners,
      forbiddenOwners
    };
  }

  const studioSource = routeSources.get("studio") ?? "";
  const allowedExternalStylesheetOrigins = new Set(
    performance.studioInitialRuntime.allowedExternalStylesheetOrigins
  );
  const studioDocumentCss = await collectInitialDocumentCss({
    index,
    html: routeHtml.get("studio") ?? "",
    siteOrigin,
    allowedExternalStylesheetOrigins,
    failures
  });
  const studioShadowCss = await collectRequiredShadowCss({
    index,
    requiredFiles: performance.studioInitialRuntime.requiredShadowCssFiles,
    failures
  });
  const studioTotalInitialCss = summarizeCssResources([
    ...studioDocumentCss.resources,
    ...studioShadowCss.resources
  ]);
  addLimitFailure(
    failures,
    "Studio initial document CSS Brotli bytes",
    studioDocumentCss.brotliBytes,
    performance.studioInitialRuntime.maxInitialDocumentCssBrotliBytes
  );
  addLimitFailure(
    failures,
    "Studio required Shadow CSS Brotli bytes",
    studioShadowCss.brotliBytes,
    performance.studioInitialRuntime.maxShadowCssBrotliBytes
  );
  addLimitFailure(
    failures,
    "Studio total initial CSS Brotli bytes",
    studioTotalInitialCss.brotliBytes,
    performance.studioInitialRuntime.maxTotalInitialCssBrotliBytes
  );
  const studioReachable = await collectReachableJavaScript({
    index,
    initialFiles: routeInitialJavaScript.studio?.files ?? [],
    failures
  });
  for (const stylesheet of performance.studioInitialRuntime
    .requiredShadowCssFiles) {
    const reference = `/${stylesheet}`;
    if (!studioReachable.source.includes(reference)) {
      failures.push(
        `Studio reachable JavaScript is missing required Shadow stylesheet reference: ${reference}`
      );
    }
  }
  for (const marker of performance.studioInitialRuntime.requiredMarkers) {
    if (!studioSource.includes(marker)) {
      failures.push(
        `Studio initial JavaScript is missing required marker: ${marker}`
      );
    }
  }
  for (const marker of performance.studioInitialRuntime
    .requiredReachableMarkers) {
    if (!studioReachable.source.includes(marker)) {
      failures.push(
        `Studio reachable JavaScript is missing required marker: ${marker}`
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
    clientMessages,
    archiveInitialRuntime,
    publicInitialCss,
    studio: {
      thirdPartyConnectionOrigins: studioThirdPartyOrigins,
      documentCss: {
        localFiles: studioDocumentCss.localFiles,
        inlineStyles: studioDocumentCss.inlineStyles,
        externalStylesheets: studioDocumentCss.externalStylesheets,
        rawBytes: studioDocumentCss.rawBytes,
        brotliBytes: studioDocumentCss.brotliBytes,
        maxBrotliBytes:
          performance.studioInitialRuntime.maxInitialDocumentCssBrotliBytes
      },
      shadowCss: {
        files: studioShadowCss.files,
        rawBytes: studioShadowCss.rawBytes,
        brotliBytes: studioShadowCss.brotliBytes,
        maxBrotliBytes: performance.studioInitialRuntime.maxShadowCssBrotliBytes
      },
      totalInitialCss: {
        ...studioTotalInitialCss,
        maxBrotliBytes:
          performance.studioInitialRuntime.maxTotalInitialCssBrotliBytes
      },
      requiredInitialMarkers: performance.studioInitialRuntime.requiredMarkers,
      requiredReachableMarkers:
        performance.studioInitialRuntime.requiredReachableMarkers,
      reachableJavaScriptFiles: studioReachable.files,
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
  for (const [surface, measurement] of Object.entries(
    report.publicInitialCss
  )) {
    console.log(
      `[performance] ${surface} initial CSS: ${formatBytes(measurement.brotliBytes)} Brotli / ${formatBytes(measurement.rawBytes)} raw (${measurement.files.length} stylesheet(s))`
    );
  }
  console.log(
    `[performance] client messages: ${report.clientMessages.routeCount.toLocaleString("en-US")} localized routes / ${report.clientMessages.providerCount.toLocaleString("en-US")} providers; ${Object.entries(
      report.clientMessages.scopeCounts
    )
      .map(([scope, count]) => `${scope}=${count}`)
      .join(", ")}`
  );
  console.log(
    `[performance] Studio third-party connection origins: ${report.studio.thirdPartyConnectionOrigins.join(", ") || "none"}`
  );
  console.log(
    `[performance] Studio initial document CSS: ${formatBytes(report.studio.documentCss.brotliBytes)} Brotli / ${formatBytes(report.studio.documentCss.rawBytes)} raw (${report.studio.documentCss.localFiles.length} local file(s), ${report.studio.documentCss.inlineStyles.length} inline block(s))`
  );
  console.log(
    `[performance] Studio required Shadow CSS: ${formatBytes(report.studio.shadowCss.brotliBytes)} Brotli / ${formatBytes(report.studio.shadowCss.rawBytes)} raw`
  );
  console.log(
    `[performance] Studio total initial CSS: ${formatBytes(report.studio.totalInitialCss.brotliBytes)} Brotli / ${formatBytes(report.studio.totalInitialCss.rawBytes)} raw`
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
