import path from "node:path";
import ts from "typescript";

export const SUPPORTED_SOURCE_EXTENSIONS = Object.freeze([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".mts"
]);

const SUPPORTED_SOURCE_EXTENSION_SET = new Set(SUPPORTED_SOURCE_EXTENSIONS);
const DEFAULT_STUDIO_DIRECTORY = "src/app/[locale]/studio";
const DEFAULT_STUDIO_PAGE = `${DEFAULT_STUDIO_DIRECTORY}/page.tsx`;

export class DependencyBoundaryError extends Error {
  constructor({ boundaryName, chain, reason }) {
    const hazardFile = chain.at(-1);
    super(
      `${boundaryName} dependency boundary violation: ${chain.join(
        " -> "
      )} reaches ${reason}`
    );
    this.name = "DependencyBoundaryError";
    this.root = chain[0];
    this.hazardFile = hazardFile;
    this.chain = chain;
    this.reason = reason;
  }
}

function normalizeFileName(fileName, projectRoot = process.cwd()) {
  const relativeName = path.isAbsolute(fileName)
    ? path.relative(projectRoot, fileName)
    : fileName;
  return path.posix
    .normalize(relativeName.split(path.sep).join("/"))
    .replace(/^\.\//, "");
}

export function isSupportedSourceFile(fileName) {
  const normalized = normalizeFileName(fileName);
  if (/\.d\.(?:ts|mts)$/.test(normalized)) return false;
  return SUPPORTED_SOURCE_EXTENSION_SET.has(path.posix.extname(normalized));
}

function getScriptKind(fileName) {
  switch (path.posix.extname(fileName)) {
    case ".js":
    case ".mjs":
      return ts.ScriptKind.JS;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".tsx":
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.TS;
  }
}

function parseSource(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(fileName)
  );
  if (sourceFile.parseDiagnostics.length > 0) {
    throw new Error(`${fileName} contains source parse errors`);
  }
  return sourceFile;
}

function hasRuntimeImport(importDeclaration) {
  const importClause = importDeclaration.importClause;
  if (!importClause) return true;
  if (importClause.isTypeOnly) return false;
  if (importClause.name) return true;

  const bindings = importClause.namedBindings;
  if (!bindings || ts.isNamespaceImport(bindings)) return Boolean(bindings);
  return bindings.elements.some((element) => !element.isTypeOnly);
}

function hasRuntimeReexport(exportDeclaration) {
  if (exportDeclaration.isTypeOnly) return false;
  const exportClause = exportDeclaration.exportClause;
  if (!exportClause || ts.isNamespaceExport(exportClause)) return true;
  return exportClause.elements.some((element) => !element.isTypeOnly);
}

function getLiteralModuleName(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : undefined;
}

export function collectLocalRuntimeDependencies(source, fileName) {
  const sourceFile = parseSource(source, fileName);
  const moduleNames = new Set();

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      hasRuntimeImport(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      moduleNames.add(statement.moduleSpecifier.text);
    }
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      hasRuntimeReexport(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      moduleNames.add(statement.moduleSpecifier.text);
    }
  }

  function visit(node) {
    if (ts.isCallExpression(node) && node.arguments.length >= 1) {
      const [argument] = node.arguments;
      const isDynamicImport =
        node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire =
        ts.isIdentifier(node.expression) && node.expression.text === "require";
      if (isDynamicImport || isRequire) {
        const moduleName = getLiteralModuleName(argument);
        if (moduleName) moduleNames.add(moduleName);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  return [...moduleNames];
}

function normalizeSourceMap(sourceMap, projectRoot) {
  const entries =
    sourceMap instanceof Map ? sourceMap : Object.entries(sourceMap);
  const normalized = new Map();
  for (const [fileName, source] of entries) {
    const normalizedName = normalizeFileName(fileName, projectRoot);
    if (!isSupportedSourceFile(normalizedName)) continue;
    if (typeof source !== "string") {
      throw new TypeError(`${normalizedName} source must be a string`);
    }
    normalized.set(normalizedName, source);
  }
  return normalized;
}

function getResolutionCandidates(baseName) {
  const extension = path.posix.extname(baseName);
  const candidates = [baseName];

  if (SUPPORTED_SOURCE_EXTENSION_SET.has(extension)) {
    const stem = baseName.slice(0, -extension.length);
    for (const supportedExtension of SUPPORTED_SOURCE_EXTENSIONS) {
      candidates.push(`${stem}${supportedExtension}`);
    }
  } else {
    for (const supportedExtension of SUPPORTED_SOURCE_EXTENSIONS) {
      candidates.push(`${baseName}${supportedExtension}`);
    }
    for (const supportedExtension of SUPPORTED_SOURCE_EXTENSIONS) {
      candidates.push(`${baseName}/index${supportedExtension}`);
    }
  }
  return [...new Set(candidates)];
}

export function resolveLocalModuleSpecifier(
  moduleName,
  importer,
  availableFiles,
  { aliasRoot = "src" } = {}
) {
  let baseName;
  if (moduleName.startsWith("@/")) {
    baseName = path.posix.join(aliasRoot, moduleName.slice(2));
  } else if (moduleName.startsWith(".")) {
    baseName = path.posix.join(path.posix.dirname(importer), moduleName);
  } else {
    return undefined;
  }

  const normalizedBase = path.posix.normalize(baseName);
  return getResolutionCandidates(normalizedBase).find((candidate) =>
    availableFiles.has(candidate)
  );
}

export function createLocalDependencyGraph(
  sourceMap,
  { aliasRoot = "src", projectRoot = process.cwd() } = {}
) {
  const normalizedSources = normalizeSourceMap(sourceMap, projectRoot);
  const availableFiles = new Set(normalizedSources.keys());
  const graph = new Map();

  for (const [fileName, source] of normalizedSources) {
    const dependencies = collectLocalRuntimeDependencies(source, fileName)
      .map((moduleName) =>
        resolveLocalModuleSpecifier(moduleName, fileName, availableFiles, {
          aliasRoot
        })
      )
      .filter(Boolean);
    graph.set(fileName, [...new Set(dependencies)]);
  }
  return graph;
}

function hasUseClientDirective(source, fileName) {
  const [firstStatement] = parseSource(source, fileName).statements;
  return Boolean(
    firstStatement &&
      ts.isExpressionStatement(firstStatement) &&
      ts.isStringLiteral(firstStatement.expression) &&
      firstStatement.expression.text === "use client"
  );
}

export function collectStudioRoots(
  sourceMap,
  {
    pageFile = DEFAULT_STUDIO_PAGE,
    projectRoot = process.cwd(),
    studioDirectory = DEFAULT_STUDIO_DIRECTORY
  } = {}
) {
  const normalizedSources = normalizeSourceMap(sourceMap, projectRoot);
  const normalizedPage = normalizeFileName(pageFile, projectRoot);
  const normalizedDirectory = normalizeFileName(studioDirectory, projectRoot);
  if (!normalizedSources.has(normalizedPage)) {
    throw new Error(`Studio page source is missing: ${normalizedPage}`);
  }

  const clientRoots = [...normalizedSources]
    .filter(
      ([fileName, source]) =>
        fileName.startsWith(`${normalizedDirectory}/`) &&
        hasUseClientDirective(source, fileName)
    )
    .map(([fileName]) => fileName)
    .sort((left, right) => left.localeCompare(right));
  return [...new Set([normalizedPage, ...clientRoots])];
}

function normalizeHazards(hazards, projectRoot) {
  if (!hazards) return new Map();
  const entries = hazards instanceof Map ? hazards : Object.entries(hazards);
  return new Map(
    [...entries].map(([fileName, reason]) => [
      normalizeFileName(fileName, projectRoot),
      reason
    ])
  );
}

function describeHazard(hazard) {
  if (typeof hazard === "string") return hazard;
  return hazard?.reason ?? hazard?.message ?? "a forbidden runtime dependency";
}

export function validateDependencyBoundary(
  sourceMap,
  {
    aliasRoot = "src",
    boundaryName = "Source",
    classifyHazard,
    hazards,
    projectRoot = process.cwd(),
    roots
  } = {}
) {
  if (!roots?.length) throw new Error("Dependency boundary roots are required");
  if (!classifyHazard && !hazards) {
    throw new Error("A dependency hazard classifier or hazard map is required");
  }

  const normalizedSources = normalizeSourceMap(sourceMap, projectRoot);
  const graph = createLocalDependencyGraph(normalizedSources, { aliasRoot });
  const hazardMap = normalizeHazards(hazards, projectRoot);
  const normalizedRoots = roots.map((root) =>
    normalizeFileName(root, projectRoot)
  );

  for (const root of normalizedRoots) {
    if (!graph.has(root))
      throw new Error(`Dependency root is missing: ${root}`);
    const queue = [[root]];
    const visited = new Set();
    for (let index = 0; index < queue.length; index += 1) {
      const chain = queue[index];
      const fileName = chain.at(-1);
      if (visited.has(fileName)) continue;
      visited.add(fileName);

      const source = normalizedSources.get(fileName);
      const hazard =
        classifyHazard?.(fileName, source) ?? hazardMap.get(fileName);
      if (hazard) {
        throw new DependencyBoundaryError({
          boundaryName,
          chain,
          reason: describeHazard(hazard)
        });
      }
      for (const dependency of graph.get(fileName) ?? []) {
        queue.push([...chain, dependency]);
      }
    }
  }
  return { graph, roots: normalizedRoots };
}

export function validateStudioDependencyBoundary(sourceMap, options = {}) {
  const roots = options.roots ?? collectStudioRoots(sourceMap, options);
  return validateDependencyBoundary(sourceMap, {
    boundaryName: "Studio",
    ...options,
    roots
  });
}
