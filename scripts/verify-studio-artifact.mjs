import { existsSync, readdirSync, readFileSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const STYLESHEET_RELATIVE_PATH = "studio/studio-shadow.css";
const SHADOW_CSS_SENTINEL = '.studio-admin[data-navbar-style="scroll"]';
const MIN_SHADOW_CSS_BYTES = 100_000;

const runtimeMarkers = [
  { name: "auxiliary dashboards", marker: "data-studio-auxiliary-dashboard" },
  { name: "ReactFlow", marker: "data-studio-flow-runtime" },
  { name: "Recharts", marker: "data-studio-recharts-runtime" }
];

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function assetPath(outDir, assetRef) {
  const normalized = assetRef.split("?", 1)[0].replace(/^\//, "");
  const candidate = resolve(outDir, normalized);
  const root = `${resolve(outDir)}${sep}`;
  if (!candidate.startsWith(root)) throw new Error(`Studio artifact reference leaves out/: ${assetRef}`);
  return candidate;
}

function directStudioScripts(outDir, locale) {
  const htmlPath = join(outDir, locale, "studio.html");
  if (!existsSync(htmlPath)) throw new Error(`Missing Studio HTML: ${htmlPath}`);
  const html = readFileSync(htmlPath, "utf8");
  const refs = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js(?:\?[^"]*)?)"[^>]*>/g)]
    .map((match) => match[1]);
  return [...new Set(refs)].map((ref) => assetPath(outDir, ref));
}

function compressedSize(files) {
  return files.reduce(
    (totals, file) => {
      const bytes = readFileSync(file);
      totals.raw += bytes.length;
      totals.brotli += brotliCompressSync(bytes).length;
      return totals;
    },
    { raw: 0, brotli: 0 }
  );
}

export function verifyStudioArtifact({ outDir = "out", locale = "en" } = {}) {
  const absoluteOutDir = resolve(outDir);
  const stylesheetPath = join(absoluteOutDir, STYLESHEET_RELATIVE_PATH);
  if (!existsSync(stylesheetPath)) {
    throw new Error(`Missing external Studio Shadow stylesheet: ${stylesheetPath}`);
  }

  const stylesheet = readFileSync(stylesheetPath);
  const stylesheetText = stylesheet.toString("utf8");
  if (stylesheet.length < MIN_SHADOW_CSS_BYTES || !stylesheetText.includes(SHADOW_CSS_SENTINEL)) {
    throw new Error("Studio Shadow stylesheet is missing its full CSS payload");
  }

  const initialScripts = directStudioScripts(absoluteOutDir, locale);
  if (initialScripts.length === 0) throw new Error(`Studio HTML for ${locale} has no direct scripts`);
  initialScripts.forEach((file) => {
    if (!existsSync(file)) throw new Error(`Missing Studio script: ${file}`);
  });

  const initialScriptSet = new Set(initialScripts.map((file) => resolve(file)));
  const initialSource = initialScripts.map((file) => readFileSync(file, "utf8")).join("\n");
  if (initialSource.includes(SHADOW_CSS_SENTINEL)) {
    throw new Error("Studio client JavaScript still embeds the full Shadow stylesheet");
  }

  const chunksDir = join(absoluteOutDir, "_next", "static", "chunks");
  if (!existsSync(chunksDir)) throw new Error(`Missing Next.js chunks: ${chunksDir}`);
  const allScripts = listFiles(chunksDir).filter((file) => extname(file) === ".js");

  const lazyChunks = {};
  for (const runtime of runtimeMarkers) {
    const matches = allScripts.filter((file) => readFileSync(file, "utf8").includes(runtime.marker));
    if (matches.length === 0) throw new Error(`Missing ${runtime.name} runtime chunk marker`);
    const eagerMatch = matches.find((file) => initialScriptSet.has(resolve(file)));
    if (eagerMatch) {
      throw new Error(`${runtime.name} runtime is eagerly loaded by /${locale}/studio: ${relative(absoluteOutDir, eagerMatch)}`);
    }
    lazyChunks[runtime.name] = matches.map((file) => relative(absoluteOutDir, file));
  }

  return {
    locale,
    initialScripts: initialScripts.map((file) => relative(absoluteOutDir, file)),
    js: compressedSize(initialScripts),
    css: {
      raw: stylesheet.length,
      brotli: brotliCompressSync(stylesheet).length,
      file: relative(absoluteOutDir, stylesheetPath)
    },
    lazyChunks
  };
}

const isCli = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isCli) {
  try {
    const summary = verifyStudioArtifact({ outDir: process.argv[2] ?? "out" });
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
