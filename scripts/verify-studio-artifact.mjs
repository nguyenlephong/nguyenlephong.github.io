import { existsSync, readFileSync, realpathSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BUDGET_CONFIG = "config/static-artifact-budgets.json";
const REPOSITORY_ROOT = realpathSync(
  fileURLToPath(new URL("..", import.meta.url))
);
const CLI_OUT_DIR = join(REPOSITORY_ROOT, "out");
const CLI_BUDGET_CONFIG = join(REPOSITORY_ROOT, DEFAULT_BUDGET_CONFIG);
// Sanity ceiling for the configured budgets, not the budget itself.
const STUDIO_BROTLI_LIMIT_EXCLUSIVE = 250 * 1024;
export const STUDIO_LOCALES = Object.freeze(["en", "vi", "zh", "ja", "ko", "fr"]);
export const STUDIO_MODULE_SLUGS = Object.freeze([
  "checklists",
  "system-maps",
  "ai-setup"
]);
const SITE_HEADER_PATTERN = /<header\b[^>]*\bclass="app-nav[\s"]/;
const SITE_FOOTER_PATTERN = /<footer\b[^>]*\bclass="app-footer[\s"]/;
// The removed admin shell: a shadow-DOM host, its stylesheet and the React Flow canvas.
const FORBIDDEN_HTML_MARKERS = Object.freeze([
  "data-studio-shadow-host",
  "studio-shadow.css"
]);
const FORBIDDEN_SCRIPT_MARKERS = Object.freeze([
  "data-studio-shadow-host",
  "data-studio-flow-runtime",
  "react-flow__"
]);
const PAGE_KINDS = Object.freeze({
  index: {
    marker: 'data-studio-static-overview="true"',
    schemaTypes: ["CollectionPage", "BreadcrumbList"]
  },
  module: {
    marker: "data-studio-module-page=",
    schemaTypes: ["WebPage", "BreadcrumbList"]
  }
});

const chunkReferencePattern =
  /(?:\/?_next\/)?static\/chunks\/[^"'`\\\s?#]+\.js/g;

function canonicalArtifactPath(outDir, path) {
  const canonicalPath = realpathSync(path);
  const relativePath = relative(outDir, canonicalPath);
  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new Error(
      `Studio artifact path resolves outside its root: ${relative(outDir, resolve(path))}`
    );
  }
  return canonicalPath;
}

function assetPath(outDir, assetRef) {
  const normalized = assetRef.split("?", 1)[0].replace(/^\//, "");
  const candidate = resolve(outDir, normalized);
  const root = `${resolve(outDir)}${sep}`;
  if (!candidate.startsWith(root))
    throw new Error(`Studio artifact reference leaves out/: ${assetRef}`);
  return candidate;
}

function directScripts(outDir, html) {
  // `<script nomodule>` (the Next legacy polyfill) is never downloaded by module-capable
  // browsers; same rule as verify-performance-artifact.
  const refs = [
    ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js(?:\?[^"]*)?)"[^>]*>/g)
  ]
    .filter((match) => !/\snomodule(?=[\s=/>])/i.test(match[0]))
    .map((match) => match[1]);
  return [...new Set(refs)].map((ref) => assetPath(outDir, ref));
}

function referencedChunks(source) {
  return [
    ...new Set(
      [...source.matchAll(chunkReferencePattern)].map((match) => {
        const normalized = match[0].replace(/^\//, "");
        return normalized.startsWith("_next/") ? normalized : `_next/${normalized}`;
      })
    )
  ];
}

function jsonLdTypes(html) {
  const types = new Set();
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    for (const type of [value["@type"]].flat()) {
      if (typeof type === "string") types.add(type);
    }
    if (value["@graph"]) visit(value["@graph"]);
  };
  for (const match of html.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    try {
      visit(JSON.parse(match[1]));
    } catch {
      types.add("#invalid-json");
    }
  }
  return types;
}

function configuredBudgets(configPath, overrides) {
  const configured =
    overrides.maxIndexBrotliBytes !== undefined &&
    overrides.maxModuleBrotliBytes !== undefined
      ? null
      : JSON.parse(readFileSync(resolve(configPath), "utf8"))?.performance
          ?.routeInitialJavaScript?.studio;
  const budgets = {
    index: overrides.maxIndexBrotliBytes ?? configured?.maxBrotliBytes,
    module: overrides.maxModuleBrotliBytes ?? configured?.maxModuleBrotliBytes
  };
  for (const [kind, bytes] of Object.entries(budgets)) {
    if (!Number.isInteger(bytes) || bytes <= 0) {
      throw new Error(
        `Studio ${kind} initial JavaScript Brotli budget must be a positive integer`
      );
    }
    if (bytes >= STUDIO_BROTLI_LIMIT_EXCLUSIVE) {
      throw new Error(
        `Studio ${kind} initial JavaScript Brotli budget must stay below 250 KiB; received ${bytes} bytes`
      );
    }
  }
  return budgets;
}

function verifyPage({ outDir, relativePath, kind, maxBrotli, sourceFor, failures }) {
  const candidate = join(outDir, relativePath);
  if (!existsSync(candidate)) {
    failures.push(`Missing Studio page: ${relativePath}`);
    return null;
  }
  const html = readFileSync(canonicalArtifactPath(outDir, candidate), "utf8");
  const h1Count = html.match(/<h1\b/g)?.length ?? 0;
  if (h1Count !== 1) {
    failures.push(`${relativePath} must contain exactly one H1; found ${h1Count}`);
  }
  if (!SITE_HEADER_PATTERN.test(html) || !SITE_FOOTER_PATTERN.test(html)) {
    failures.push(`${relativePath} must render inside the site header and footer`);
  }
  if (!html.includes(PAGE_KINDS[kind].marker)) {
    failures.push(`${relativePath} is missing its static ${kind} marker`);
  }
  const types = jsonLdTypes(html);
  if (types.has("#invalid-json")) {
    failures.push(`${relativePath} contains invalid JSON-LD`);
  }
  for (const type of PAGE_KINDS[kind].schemaTypes) {
    if (!types.has(type)) failures.push(`${relativePath} JSON-LD is missing ${type}`);
  }
  for (const marker of FORBIDDEN_HTML_MARKERS) {
    if (html.includes(marker)) {
      failures.push(`${relativePath} still references the removed Studio shell: ${marker}`);
    }
  }

  const initialScripts = directScripts(outDir, html);
  if (initialScripts.length === 0) {
    failures.push(`${relativePath} has no direct scripts`);
  }
  let brotli = 0;
  const queue = [];
  const seen = new Set();
  for (const file of initialScripts) {
    if (!existsSync(file)) {
      failures.push(`${relativePath} references a missing script: ${relative(outDir, file)}`);
      continue;
    }
    brotli += brotliCompressSync(readFileSync(canonicalArtifactPath(outDir, file))).length;
    seen.add(file);
    queue.push(file);
  }
  if (brotli > maxBrotli) {
    failures.push(
      `${relativePath} initial JavaScript Brotli bytes ${brotli} exceed ${maxBrotli}`
    );
  }
  // Lazy chunks count too: the canvas must not come back behind a dynamic import.
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const source = sourceFor(queue[cursor]);
    for (const marker of FORBIDDEN_SCRIPT_MARKERS) {
      if (source.includes(marker)) {
        failures.push(
          `${relativePath} reachable JavaScript contains ${marker}: ${relative(outDir, queue[cursor])}`
        );
      }
    }
    for (const reference of referencedChunks(source)) {
      const file = assetPath(outDir, reference);
      if (seen.has(file)) continue;
      seen.add(file);
      if (!existsSync(file)) {
        failures.push(`${relativePath} JavaScript references a missing chunk: ${reference}`);
        continue;
      }
      queue.push(file);
    }
  }

  return {
    path: relativePath,
    kind,
    initialScripts: initialScripts.map((file) => relative(outDir, file)),
    reachableScripts: queue.length,
    brotli,
    maxBrotli
  };
}

export function verifyStudioArtifact({
  outDir = "out",
  configPath = DEFAULT_BUDGET_CONFIG,
  maxIndexBrotliBytes,
  maxModuleBrotliBytes
} = {}) {
  const resolvedOutDir = resolve(outDir);
  if (!existsSync(resolvedOutDir)) {
    throw new Error(`Missing Studio artifact directory: ${resolvedOutDir}`);
  }
  const absoluteOutDir = realpathSync(resolvedOutDir);
  const budgets = configuredBudgets(configPath, {
    maxIndexBrotliBytes,
    maxModuleBrotliBytes
  });

  const sourceCache = new Map();
  const sourceFor = (file) => {
    const absoluteFile = canonicalArtifactPath(absoluteOutDir, file);
    if (!sourceCache.has(absoluteFile)) {
      sourceCache.set(absoluteFile, readFileSync(absoluteFile, "utf8"));
    }
    return sourceCache.get(absoluteFile);
  };

  const failures = [];
  const pages = STUDIO_LOCALES.flatMap((locale) => [
    { relativePath: `${locale}/studio.html`, kind: "index" },
    ...STUDIO_MODULE_SLUGS.map((slug) => ({
      relativePath: `${locale}/studio/${slug}.html`,
      kind: "module"
    }))
  ])
    .map(({ relativePath, kind }) =>
      verifyPage({
        outDir: absoluteOutDir,
        relativePath,
        kind,
        maxBrotli: budgets[kind],
        sourceFor,
        failures
      })
    )
    .filter(Boolean);

  if (failures.length > 0) {
    throw new Error(
      `Studio artifact verification failed with ${failures.length} issue(s):\n- ${failures.join("\n- ")}`
    );
  }

  const largest = (kind) =>
    Math.max(...pages.filter((page) => page.kind === kind).map((page) => page.brotli));
  return {
    pageCount: pages.length,
    js: {
      index: { maxMeasuredBrotli: largest("index"), maxBrotli: budgets.index },
      module: { maxMeasuredBrotli: largest("module"), maxBrotli: budgets.module }
    },
    pages
  };
}

const isCli =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isCli) {
  try {
    if (process.argv.length > 2) {
      throw new Error(
        "Studio artifact verification does not accept a custom artifact path"
      );
    }
    const summary = verifyStudioArtifact({
      outDir: canonicalArtifactPath(REPOSITORY_ROOT, CLI_OUT_DIR),
      configPath: canonicalArtifactPath(REPOSITORY_ROOT, CLI_BUDGET_CONFIG)
    });
    console.log(
      `[studio-artifact] ${summary.pageCount} pages verified; initial JavaScript Brotli: index ${summary.js.index.maxMeasuredBrotli} / ${summary.js.index.maxBrotli}, modules ${summary.js.module.maxMeasuredBrotli} / ${summary.js.module.maxBrotli}`
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
