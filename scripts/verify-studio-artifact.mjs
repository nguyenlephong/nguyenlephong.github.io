import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const STYLESHEET_RELATIVE_PATH = "studio/studio-shadow.css";
const SHADOW_CSS_SENTINEL = '.studio-admin[data-navbar-style="scroll"]';
const MIN_SHADOW_CSS_BYTES = 100_000;
const DEFAULT_BUDGET_CONFIG = "config/static-artifact-budgets.json";
const REPOSITORY_ROOT = realpathSync(
  fileURLToPath(new URL("..", import.meta.url))
);
const CLI_OUT_DIR = join(REPOSITORY_ROOT, "out");
const CLI_BUDGET_CONFIG = join(REPOSITORY_ROOT, DEFAULT_BUDGET_CONFIG);
const STUDIO_INITIAL_BROTLI_LIMIT_EXCLUSIVE = 250 * 1024;
const STUDIO_DEFAULT_ROUTE_BROTLI_LIMIT_EXCLUSIVE = 220 * 1024;
const DEFAULT_ROUTE_MARKER = "welcome-route";
const STUDIO_LOCALE_SENTINELS = Object.freeze({
  en: "Restore layout defaults",
  vi: "Khôi phục cách trình bày mặc định",
  zh: "恢复默认布局",
  ja: "レイアウト既定値に戻す",
  ko: "레이아웃 기본값 복원",
  fr: "Restaurer les valeurs par défaut"
});
const ENGLISH_DEFAULT_SENTINEL = STUDIO_LOCALE_SENTINELS.en;
const VIETNAMESE_ONLY_SENTINEL = STUDIO_LOCALE_SENTINELS.vi;

const runtimeMarkers = [
  { name: "mail workbench", marker: "mail-workbench" },
  { name: "AI skills workbench", marker: "skill-library-workbench" },
  { name: "delivery checklist workbench", marker: "checklist-workbench" },
  { name: "auxiliary dashboards", marker: "data-studio-auxiliary-dashboard" },
  { name: "ReactFlow", marker: "data-studio-flow-runtime" },
  { name: "Recharts", marker: "data-studio-recharts-runtime" }
];

const chunkReferencePattern =
  /(?:\/?_next\/)?static\/chunks\/[^"'`\\\s?#]+\.js/g;
const turbopackLoaderGroupPattern =
  /Promise\.all\(\s*\[([^\]]*)\]\s*\.map\(\s*\(?\s*[$\w]+\s*\)?\s*=>\s*[$\w]+\.l\(\s*[$\w]+\s*\)\s*\)\s*\)/g;

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

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

function directStudioScripts(outDir, locale) {
  const htmlCandidate = join(outDir, locale, "studio.html");
  if (!existsSync(htmlCandidate))
    throw new Error(`Missing Studio HTML: ${htmlCandidate}`);
  const htmlPath = canonicalArtifactPath(outDir, htmlCandidate);
  const html = readFileSync(htmlPath, "utf8");
  const refs = [
    ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js(?:\?[^"]*)?)"[^>]*>/g)
  ].map((match) => match[1]);
  return [...new Set(refs)].map((ref) => assetPath(outDir, ref));
}

function compressedSize(outDir, files) {
  return files.reduce(
    (totals, file) => {
      const bytes = readFileSync(canonicalArtifactPath(outDir, file));
      totals.raw += bytes.length;
      totals.brotli += brotliCompressSync(bytes).length;
      return totals;
    },
    { raw: 0, brotli: 0 }
  );
}

function normalizedChunkReference(reference) {
  const normalized = reference.replace(/^\//, "");
  return normalized.startsWith("_next/") ? normalized : `_next/${normalized}`;
}

function referencedChunks(source) {
  return [
    ...new Set(
      [...source.matchAll(chunkReferencePattern)].map((match) =>
        normalizedChunkReference(match[0])
      )
    )
  ];
}

function turbopackLoaderGroups(outDir, parent, source) {
  return [...source.matchAll(turbopackLoaderGroupPattern)]
    .map((match) => ({
      parent: resolve(parent),
      chunks: referencedChunks(match[1]).map((reference) =>
        resolve(assetPath(outDir, reference))
      ),
      kind: "promise-all"
    }))
    .filter((group) => group.chunks.length > 0);
}

function dependencyGroups(outDir, parent, source) {
  const loaderGroups = turbopackLoaderGroups(outDir, parent, source);
  const groupedChunks = new Set(loaderGroups.flatMap((group) => group.chunks));
  const ungroupedReferences = referencedChunks(source)
    .map((reference) => resolve(assetPath(outDir, reference)))
    .filter((file) => !groupedChunks.has(file));

  return [
    ...loaderGroups,
    ...ungroupedReferences.map((file) => ({
      parent: resolve(parent),
      chunks: [file],
      kind: "reference"
    }))
  ];
}

function loaderGroupSignature(group) {
  return [...group.chunks].sort().join("\n");
}

function uniqueLoaderGroups(groups) {
  const signatures = new Set();
  return groups.filter((group) => {
    const signature = loaderGroupSignature(group);
    if (signatures.has(signature)) return false;
    signatures.add(signature);
    return true;
  });
}

function shortestLoaderPath(groups, roots, targets) {
  const rootSet = new Set([...roots].map((file) => resolve(file)));
  const targetSet = new Set([...targets].map((file) => resolve(file)));
  const groupsByParent = new Map();

  for (const group of groups) {
    if (!groupsByParent.has(group.parent)) groupsByParent.set(group.parent, []);
    groupsByParent.get(group.parent).push(group);
  }

  const queue = [...rootSet];
  const visited = new Set(rootSet);
  const previousGroup = new Map();
  let target = queue.find((file) => targetSet.has(file));

  for (let cursor = 0; cursor < queue.length && !target; cursor += 1) {
    const parent = queue[cursor];
    for (const group of groupsByParent.get(parent) ?? []) {
      for (const child of group.chunks) {
        if (visited.has(child)) continue;
        visited.add(child);
        previousGroup.set(child, group);
        queue.push(child);
        if (targetSet.has(child)) {
          target = child;
          break;
        }
      }
      if (target) break;
    }
  }

  if (!target) return null;

  const path = [];
  let cursor = target;
  while (!rootSet.has(cursor)) {
    const group = previousGroup.get(cursor);
    if (!group) return null;
    path.unshift(group);
    cursor = group.parent;
  }
  return uniqueLoaderGroups(path);
}

function addLoaderGroups(files, groups) {
  groups.forEach((group) => group.chunks.forEach((file) => files.add(file)));
}

function collectReachableScripts(outDir, initialScripts, sourceFor) {
  const queue = [...initialScripts];
  const reachable = new Set(initialScripts.map((file) => resolve(file)));

  for (let index = 0; index < queue.length; index += 1) {
    for (const reference of referencedChunks(sourceFor(queue[index]))) {
      const file = assetPath(outDir, reference);
      if (!existsSync(file)) {
        throw new Error(
          `Studio JavaScript references missing chunk: ${reference}`
        );
      }
      const absoluteFile = resolve(file);
      if (reachable.has(absoluteFile)) continue;
      reachable.add(absoluteFile);
      queue.push(file);
    }
  }

  return queue;
}

function configuredStudioBudgets(
  configPath,
  initialOverride,
  defaultRouteOverride
) {
  const configuredStudio =
    initialOverride !== undefined && defaultRouteOverride !== undefined
      ? null
      : JSON.parse(readFileSync(resolve(configPath), "utf8"))?.performance
          ?.routeInitialJavaScript?.studio;
  const maxInitialBrotliBytes =
    initialOverride ?? configuredStudio?.maxBrotliBytes;
  const maxDefaultRouteBrotliBytes =
    defaultRouteOverride ?? configuredStudio?.maxDefaultRouteBrotliBytes;

  if (!Number.isInteger(maxInitialBrotliBytes) || maxInitialBrotliBytes <= 0) {
    throw new Error(
      "Studio initial JavaScript Brotli budget must be a positive integer"
    );
  }
  if (maxInitialBrotliBytes >= STUDIO_INITIAL_BROTLI_LIMIT_EXCLUSIVE) {
    throw new Error(
      `Studio initial JavaScript Brotli budget must stay below 250 KiB; received ${maxInitialBrotliBytes} bytes`
    );
  }
  if (
    !Number.isInteger(maxDefaultRouteBrotliBytes) ||
    maxDefaultRouteBrotliBytes <= 0
  ) {
    throw new Error(
      "Studio default-route JavaScript Brotli budget must be a positive integer"
    );
  }
  if (
    maxDefaultRouteBrotliBytes >= STUDIO_DEFAULT_ROUTE_BROTLI_LIMIT_EXCLUSIVE
  ) {
    throw new Error(
      `Studio default-route JavaScript Brotli budget must stay below 220 KiB; received ${maxDefaultRouteBrotliBytes} bytes`
    );
  }
  return {
    initial: maxInitialBrotliBytes,
    defaultRoute: maxDefaultRouteBrotliBytes
  };
}

export function verifyStudioArtifact({
  outDir = "out",
  locale = "en",
  configPath = DEFAULT_BUDGET_CONFIG,
  maxInitialBrotliBytes,
  maxDefaultRouteBrotliBytes
} = {}) {
  if (!Object.hasOwn(STUDIO_LOCALE_SENTINELS, locale)) {
    throw new Error(`Unsupported Studio artifact locale: ${locale}`);
  }
  const resolvedOutDir = resolve(outDir);
  if (!existsSync(resolvedOutDir)) {
    throw new Error(`Missing Studio artifact directory: ${resolvedOutDir}`);
  }
  const absoluteOutDir = realpathSync(resolvedOutDir);
  const studioBudgets = configuredStudioBudgets(
    configPath,
    maxInitialBrotliBytes,
    maxDefaultRouteBrotliBytes
  );
  const initialBrotliBudget = studioBudgets.initial;
  const stylesheetCandidate = join(absoluteOutDir, STYLESHEET_RELATIVE_PATH);
  if (!existsSync(stylesheetCandidate)) {
    throw new Error(
      `Missing external Studio Shadow stylesheet: ${stylesheetCandidate}`
    );
  }
  const stylesheetPath = canonicalArtifactPath(
    absoluteOutDir,
    stylesheetCandidate
  );

  const stylesheet = readFileSync(stylesheetPath);
  const stylesheetText = stylesheet.toString("utf8");
  if (
    stylesheet.length < MIN_SHADOW_CSS_BYTES ||
    !stylesheetText.includes(SHADOW_CSS_SENTINEL)
  ) {
    throw new Error("Studio Shadow stylesheet is missing its full CSS payload");
  }

  const initialScripts = directStudioScripts(absoluteOutDir, locale);
  if (initialScripts.length === 0)
    throw new Error(`Studio HTML for ${locale} has no direct scripts`);
  initialScripts.forEach((file) => {
    if (!existsSync(file)) throw new Error(`Missing Studio script: ${file}`);
  });

  const sourceCache = new Map();
  const sourceFor = (file) => {
    const absoluteFile = canonicalArtifactPath(absoluteOutDir, file);
    if (!sourceCache.has(absoluteFile)) {
      sourceCache.set(absoluteFile, readFileSync(absoluteFile, "utf8"));
    }
    return sourceCache.get(absoluteFile);
  };
  const initialScriptSet = new Set(initialScripts.map((file) => resolve(file)));
  const initialSource = initialScripts.map(sourceFor).join("\n");
  if (initialSource.includes(SHADOW_CSS_SENTINEL)) {
    throw new Error(
      "Studio client JavaScript still embeds the full Shadow stylesheet"
    );
  }

  const initialJs = compressedSize(absoluteOutDir, initialScripts);
  if (initialJs.brotli > initialBrotliBudget) {
    throw new Error(
      `Studio initial JavaScript Brotli bytes ${initialJs.brotli} exceed ${initialBrotliBudget}`
    );
  }

  const chunksCandidate = join(absoluteOutDir, "_next", "static", "chunks");
  if (!existsSync(chunksCandidate))
    throw new Error(`Missing Next.js chunks: ${chunksCandidate}`);
  const chunksDir = canonicalArtifactPath(absoluteOutDir, chunksCandidate);
  const allScripts = listFiles(chunksDir).filter(
    (file) => extname(file) === ".js"
  );
  const reachableScripts = collectReachableScripts(
    absoluteOutDir,
    initialScripts,
    sourceFor
  );
  const reachableScriptSet = new Set(
    reachableScripts.map((file) => resolve(file))
  );
  const asyncScripts = reachableScripts.filter(
    (file) => !initialScriptSet.has(resolve(file))
  );
  const dependencyGraph = reachableScripts.flatMap((file) =>
    dependencyGroups(absoluteOutDir, file, sourceFor(file))
  );

  const localeSentinelScripts = Object.fromEntries(
    Object.entries(STUDIO_LOCALE_SENTINELS).map(
      ([sentinelLocale, sentinel]) => {
        const scripts = allScripts
          .filter((file) => sourceFor(file).includes(sentinel))
          .map((file) => resolve(file));
        if (scripts.length === 0) {
          throw new Error(
            `Missing ${sentinelLocale} Studio locale chunk sentinel: ${sentinel}`
          );
        }
        return [sentinelLocale, scripts];
      }
    )
  );
  const localeLoaderGroups = {};
  const localeLoaderPaths = {};
  for (const sentinelLocale of Object.keys(STUDIO_LOCALE_SENTINELS)) {
    const sentinelScriptSet = new Set(localeSentinelScripts[sentinelLocale]);
    const allCandidateGroups = uniqueLoaderGroups(
      dependencyGraph.filter(
        (group) =>
          group.kind === "promise-all" &&
          group.chunks.some((file) => sentinelScriptSet.has(file))
      )
    );
    const candidateEntries = allCandidateGroups
      .map((group) => ({
        group,
        path: shortestLoaderPath(dependencyGraph, initialScripts, [
          group.parent
        ])
      }))
      .filter((entry) => entry.path);
    const minimumLoaderDepth = Math.min(
      ...candidateEntries.map((entry) => entry.path.length)
    );
    const candidateGroups = candidateEntries
      .filter((entry) => entry.path.length === minimumLoaderDepth)
      .map((entry) => entry.group);
    const isolatedGroups = candidateGroups.filter((group) => {
      const loadedLocales = Object.keys(localeSentinelScripts).filter(
        (candidateLocale) => {
          const candidateScripts = new Set(
            localeSentinelScripts[candidateLocale]
          );
          return group.chunks.some((file) => candidateScripts.has(file));
        }
      );
      return loadedLocales.length === 1 && loadedLocales[0] === sentinelLocale;
    });

    if (isolatedGroups.length === 0) {
      const loadedLocales = [
        ...new Set(
          candidateGroups.flatMap((group) =>
            Object.keys(localeSentinelScripts).filter((candidateLocale) => {
              const candidateScripts = new Set(
                localeSentinelScripts[candidateLocale]
              );
              return group.chunks.some((file) => candidateScripts.has(file));
            })
          )
        )
      ];
      throw new Error(
        candidateGroups.length === 0
          ? `Missing isolated Turbopack loader group for Studio locale ${sentinelLocale}`
          : `Studio ${sentinelLocale} locale loader includes other locale chunks: ${loadedLocales.join(", ")}`
      );
    }
    if (isolatedGroups.length > 1) {
      throw new Error(
        `Studio locale ${sentinelLocale} has ambiguous Turbopack loader groups`
      );
    }

    const loaderGroup = isolatedGroups[0];
    const loaderPath = shortestLoaderPath(dependencyGraph, initialScripts, [
      loaderGroup.parent
    ]);
    if (!loaderPath) {
      throw new Error(
        `Studio locale ${sentinelLocale} loader is not reachable from /${locale}/studio`
      );
    }
    const localeLoadFiles = new Set();
    addLoaderGroups(localeLoadFiles, loaderPath);
    addLoaderGroups(localeLoadFiles, [loaderGroup]);
    const leakedLocale = Object.keys(localeSentinelScripts).find(
      (candidateLocale) =>
        candidateLocale !== sentinelLocale &&
        localeSentinelScripts[candidateLocale].some((file) =>
          localeLoadFiles.has(file)
        )
    );
    if (leakedLocale) {
      throw new Error(
        `Studio ${sentinelLocale} locale loader path includes ${leakedLocale} locale copy`
      );
    }
    localeLoaderGroups[sentinelLocale] = loaderGroup;
    localeLoaderPaths[sentinelLocale] = loaderPath;
  }

  const localeEntryScripts = new Set();
  addLoaderGroups(localeEntryScripts, localeLoaderPaths[locale]);
  addLoaderGroups(localeEntryScripts, [localeLoaderGroups[locale]]);
  const auxiliaryDashboardScripts = reachableScripts.filter((file) =>
    sourceFor(file).includes("data-studio-auxiliary-dashboard")
  );
  const auxiliaryDashboardLoaderPath = shortestLoaderPath(
    dependencyGraph,
    localeEntryScripts,
    auxiliaryDashboardScripts
  );
  if (
    !auxiliaryDashboardLoaderPath ||
    auxiliaryDashboardLoaderPath.length !== 1 ||
    auxiliaryDashboardLoaderPath[0].kind !== "promise-all"
  ) {
    const loaderDepth = auxiliaryDashboardLoaderPath?.length ?? "unreachable";
    throw new Error(
      `Studio auxiliary dashboard runtime must be loaded atomically by its outer route loader; found loader depth ${loaderDepth}`
    );
  }
  const auxiliaryDashboardLoader = auxiliaryDashboardLoaderPath[0];
  const eagerDashboardCapability = auxiliaryDashboardLoader.chunks.find(
    (file) => sourceFor(file).includes("data-studio-recharts-runtime")
  );
  if (eagerDashboardCapability) {
    throw new Error(
      `Recharts runtime is preloaded by the Studio auxiliary dashboard route: ${relative(absoluteOutDir, eagerDashboardCapability)}`
    );
  }

  const lazyChunks = {};
  for (const runtime of runtimeMarkers) {
    const matches = allScripts.filter((file) =>
      sourceFor(file).includes(runtime.marker)
    );
    if (matches.length === 0)
      throw new Error(`Missing ${runtime.name} runtime chunk marker`);
    const eagerMatch = matches.find((file) =>
      initialScriptSet.has(resolve(file))
    );
    if (eagerMatch) {
      throw new Error(
        `${runtime.name} runtime is eagerly loaded by /${locale}/studio: ${relative(absoluteOutDir, eagerMatch)}`
      );
    }
    const reachableMatches = matches.filter((file) =>
      reachableScriptSet.has(resolve(file))
    );
    if (reachableMatches.length === 0) {
      throw new Error(
        `${runtime.name} runtime is not reachable from /${locale}/studio`
      );
    }
    lazyChunks[runtime.name] = reachableMatches.map((file) =>
      relative(absoluteOutDir, file)
    );
  }

  const defaultRouteMarkerScripts = reachableScripts.filter((file) =>
    sourceFor(file).includes(DEFAULT_ROUTE_MARKER)
  );
  if (defaultRouteMarkerScripts.length === 0) {
    throw new Error(
      `Missing Studio default route chunk marker: ${DEFAULT_ROUTE_MARKER}`
    );
  }
  const defaultRouteScriptSet = new Set();
  addLoaderGroups(defaultRouteScriptSet, localeLoaderPaths[locale]);
  addLoaderGroups(defaultRouteScriptSet, [localeLoaderGroups[locale]]);
  const defaultRouteAlreadyAvailable = defaultRouteMarkerScripts.some(
    (file) =>
      initialScriptSet.has(resolve(file)) ||
      defaultRouteScriptSet.has(resolve(file))
  );
  if (!defaultRouteAlreadyAvailable) {
    const defaultRoutePath = shortestLoaderPath(
      dependencyGraph,
      defaultRouteScriptSet,
      defaultRouteMarkerScripts
    );
    if (!defaultRoutePath) {
      throw new Error(
        `Studio default route is not reachable from the ${locale} locale loader group`
      );
    }
    addLoaderGroups(defaultRouteScriptSet, defaultRoutePath);
  }

  const defaultRouteAsyncScripts = [...defaultRouteScriptSet].filter(
    (file) => !initialScriptSet.has(resolve(file))
  );
  const defaultRouteAsyncJs = compressedSize(
    absoluteOutDir,
    defaultRouteAsyncScripts
  );
  const defaultRouteTotalJs = {
    raw: initialJs.raw + defaultRouteAsyncJs.raw,
    brotli: initialJs.brotli + defaultRouteAsyncJs.brotli
  };
  if (defaultRouteTotalJs.brotli > studioBudgets.defaultRoute) {
    throw new Error(
      `Studio default-route JavaScript Brotli bytes ${defaultRouteTotalJs.brotli} exceed ${studioBudgets.defaultRoute}`
    );
  }

  for (const runtime of runtimeMarkers) {
    const defaultMatch = defaultRouteAsyncScripts.find((file) =>
      sourceFor(file).includes(runtime.marker)
    );
    if (defaultMatch) {
      throw new Error(
        `${runtime.name} runtime is preloaded by the Studio default route: ${relative(absoluteOutDir, defaultMatch)}`
      );
    }
  }

  const defaultLocaleEntryScripts = [
    ...initialScripts,
    ...defaultRouteAsyncScripts
  ];
  for (const [candidateLocale, sentinel] of Object.entries(
    STUDIO_LOCALE_SENTINELS
  )) {
    if (candidateLocale === locale) continue;
    const leakedScript = defaultLocaleEntryScripts.find((file) =>
      sourceFor(file).includes(sentinel)
    );
    if (leakedScript) {
      const legacyPrefix =
        locale === "en" && candidateLocale === "vi"
          ? "Vietnamese-only Studio copy leaked into the English initial/default chunks"
          : `${candidateLocale} Studio copy leaked into the ${locale} initial/default chunks`;
      throw new Error(
        `${legacyPrefix}: ${relative(absoluteOutDir, leakedScript)}`
      );
    }
  }

  const asyncJs = compressedSize(absoluteOutDir, asyncScripts);

  return {
    locale,
    initialScripts: initialScripts.map((file) =>
      relative(absoluteOutDir, file)
    ),
    asyncScripts: asyncScripts.map((file) => relative(absoluteOutDir, file)),
    defaultScripts: defaultRouteAsyncScripts.map((file) =>
      relative(absoluteOutDir, file)
    ),
    defaultMarkerScripts: defaultRouteMarkerScripts.map((file) =>
      relative(absoluteOutDir, file)
    ),
    js: {
      initial: { ...initialJs, maxBrotli: initialBrotliBudget },
      async: asyncJs,
      reachableAsync: asyncJs,
      reachable: {
        raw: initialJs.raw + asyncJs.raw,
        brotli: initialJs.brotli + asyncJs.brotli
      },
      defaultRoute: {
        async: defaultRouteAsyncJs,
        total: {
          ...defaultRouteTotalJs,
          maxBrotli: studioBudgets.defaultRoute
        }
      }
    },
    css: {
      raw: stylesheet.length,
      brotli: brotliCompressSync(stylesheet).length,
      file: relative(absoluteOutDir, stylesheetPath)
    },
    lazyChunks,
    lazyBoundaries: {
      auxiliaryDashboard: {
        loaderDepth: auxiliaryDashboardLoaderPath.length,
        loaderChunks: auxiliaryDashboardLoader.chunks.map((file) =>
          relative(absoluteOutDir, file)
        )
      }
    },
    localeIsolation: {
      englishSentinel: ENGLISH_DEFAULT_SENTINEL,
      vietnameseSentinel: VIETNAMESE_ONLY_SENTINEL,
      vietnameseChunks: localeSentinelScripts.vi.map((file) =>
        relative(absoluteOutDir, file)
      ),
      locales: Object.fromEntries(
        Object.entries(STUDIO_LOCALE_SENTINELS).map(
          ([sentinelLocale, sentinel]) => [
            sentinelLocale,
            {
              sentinel,
              chunks: localeSentinelScripts[sentinelLocale].map((file) =>
                relative(absoluteOutDir, file)
              ),
              loaderChunks: localeLoaderGroups[sentinelLocale].chunks.map(
                (file) => relative(absoluteOutDir, file)
              )
            }
          ]
        )
      )
    }
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
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
