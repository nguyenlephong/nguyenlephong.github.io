import { readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import {
  CLIENT_MESSAGE_ROUTE_SCOPES,
  CLIENT_MESSAGE_SCOPE_PATHS
} from "../../src/i18n/client-message-scopes.ts";
import {
  CLIENT_PROVIDER_CONSUMER_ROUTES,
  NAVIGATION_MODULE,
  PROVIDER_DEPENDENT_NEXT_INTL_HOOKS,
  RAW_PROVIDER_FILE,
  SCOPED_PROVIDER_MODULE,
  SCOPED_PROVIDER_PLACEMENTS
} from "./client-message-contract-config.mjs";

const NEXT_INTL_NAVIGATION_MODULE = "next-intl/navigation";
const SUPPORTED_SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".mts"
]);
const EXCLUDED_SOURCE_DIRECTORIES = new Set([
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out"
]);
function isSupportedSourceFile(file) {
  const normalizedFile = normalizeFileName(file);
  if (normalizedFile.endsWith(".d.ts")) return false;
  return SUPPORTED_SOURCE_EXTENSIONS.has(path.posix.extname(normalizedFile));
}

function walkSupportedSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return EXCLUDED_SOURCE_DIRECTORIES.has(entry.name)
        ? []
        : walkSupportedSourceFiles(entryPath);
    }
    return isSupportedSourceFile(entryPath) ? [entryPath] : [];
  });
}

function normalizeFileName(fileName) {
  return fileName.split(path.sep).join("/");
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function parseTypeScriptSource(source, fileName) {
  const extension = path.posix.extname(normalizeFileName(fileName));
  const scriptKind =
    extension === ".tsx"
      ? ts.ScriptKind.TSX
      : extension === ".jsx"
        ? ts.ScriptKind.JSX
        : extension === ".js" || extension === ".mjs"
          ? ts.ScriptKind.JS
          : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  if (sourceFile.parseDiagnostics.length > 0) {
    throw new Error(`${fileName} contains TypeScript parse errors`);
  }
  return sourceFile;
}

function failSource(sourceFile, node, message) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  );
  throw new Error(`${sourceFile.fileName}:${line + 1} ${message}`);
}

function hasUseClientDirective(sourceFile) {
  const [firstStatement] = sourceFile.statements;
  return Boolean(
    firstStatement &&
      ts.isExpressionStatement(firstStatement) &&
      ts.isStringLiteral(firstStatement.expression) &&
      firstStatement.expression.text === "use client"
  );
}

function isResolvedModule(moduleName, fileName, absoluteModule) {
  const normalizedAbsoluteModule = absoluteModule.replace(
    /\.(?:js|jsx|ts|tsx|mjs|mts)$/,
    ""
  );
  const normalizedModuleName = moduleName
    .replace(/\.(?:js|jsx|ts|tsx|mjs|mts)$/, "")
    .replace(/\/index$/, "");
  if (normalizedModuleName === normalizedAbsoluteModule) return true;
  if (!moduleName.startsWith(".")) return false;

  const normalizedFile = normalizeFileName(fileName);
  const resolved = path.posix
    .normalize(path.posix.join(path.posix.dirname(normalizedFile), moduleName))
    .replace(/\.(?:js|jsx|ts|tsx|mjs|mts)$/, "")
    .replace(/\/index$/, "");
  const expected = normalizedAbsoluteModule.replace(/^@\//, "src/");
  return resolved === expected || `${resolved}/index` === expected;
}

function isUseIntlModule(moduleName) {
  return moduleName === "use-intl" || moduleName.startsWith("use-intl/");
}

function inspectNavigationRuntimeExports(
  source,
  fileName = "src/i18n/navigation.ts"
) {
  const sourceFile = parseTypeScriptSource(source, fileName);
  const createNavigationBindings = new Set();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "next-intl/navigation"
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if (
        (element.propertyName?.text ?? element.name.text) === "createNavigation"
      ) {
        createNavigationBindings.add(element.name.text);
      }
    }
  }

  const exports = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isObjectBindingPattern(declaration.name) ||
        !declaration.initializer ||
        !ts.isCallExpression(declaration.initializer) ||
        !ts.isIdentifier(declaration.initializer.expression) ||
        !createNavigationBindings.has(declaration.initializer.expression.text)
      ) {
        continue;
      }
      for (const element of declaration.name.elements) {
        if (!ts.isIdentifier(element.name)) {
          failSource(
            sourceFile,
            element,
            "navigation exports must use direct identifier bindings"
          );
        }
        exports.add(
          element.propertyName?.getText(sourceFile) ?? element.name.text
        );
      }
    }
  }

  if (exports.size === 0) {
    failSource(
      sourceFile,
      sourceFile,
      "must expose createNavigation runtime bindings for provider inventory"
    );
  }
  return exports;
}

function inspectNavigationImports(
  source,
  navigationExports,
  fileName = "fixture.tsx"
) {
  const normalizedFile = normalizeFileName(fileName);
  const sourceFile = parseTypeScriptSource(source, normalizedFile);

  const imports = [];
  let createNavigationImportCount = 0;
  for (const statement of sourceFile.statements) {
    const moduleSpecifier = statement.moduleSpecifier;
    const moduleName =
      moduleSpecifier && ts.isStringLiteralLike(moduleSpecifier)
        ? moduleSpecifier.text
        : null;
    if (!moduleName) continue;

    if (moduleName === NEXT_INTL_NAVIGATION_MODULE) {
      if (!ts.isImportDeclaration(statement)) {
        failSource(
          sourceFile,
          statement,
          "must not re-export next-intl/navigation"
        );
      }
      if (normalizedFile !== "src/i18n/navigation.ts") {
        failSource(
          sourceFile,
          statement,
          "next-intl/navigation is reserved for src/i18n/navigation.ts"
        );
      }
      const importClause = statement.importClause;
      const bindings = importClause?.namedBindings;
      if (
        !importClause ||
        importClause.isTypeOnly ||
        importClause.name ||
        !bindings ||
        !ts.isNamedImports(bindings) ||
        bindings.elements.length !== 1 ||
        bindings.elements[0].isTypeOnly ||
        (bindings.elements[0].propertyName?.text ??
          bindings.elements[0].name.text) !== "createNavigation"
      ) {
        failSource(
          sourceFile,
          statement,
          "must import only createNavigation through one direct named import"
        );
      }
      createNavigationImportCount += 1;
      continue;
    }

    if (!isResolvedModule(moduleName, normalizedFile, NAVIGATION_MODULE))
      continue;

    if (ts.isExportDeclaration(statement)) {
      failSource(
        sourceFile,
        statement,
        "must not re-export locale navigation; import it directly at the consumer"
      );
    }
    if (!ts.isImportDeclaration(statement)) continue;

    const importClause = statement.importClause;
    const bindings = importClause?.namedBindings;
    if (
      !importClause ||
      importClause.name ||
      !bindings ||
      !ts.isNamedImports(bindings)
    ) {
      failSource(
        sourceFile,
        statement,
        "must import locale navigation through direct named imports"
      );
    }
    if (importClause.isTypeOnly) continue;

    for (const element of bindings.elements) {
      if (element.isTypeOnly) continue;
      const importedName = element.propertyName?.text ?? element.name.text;
      if (!navigationExports.has(importedName)) {
        failSource(
          sourceFile,
          element,
          `imports unknown locale navigation runtime: ${importedName}`
        );
      }
      imports.push({ importedName, localName: element.name.text });
    }
  }

  if (
    normalizedFile === "src/i18n/navigation.ts" &&
    createNavigationImportCount !== 1
  ) {
    failSource(
      sourceFile,
      sourceFile,
      "must import createNavigation exactly once from next-intl/navigation"
    );
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const [argument] = node.arguments;
      const moduleName =
        argument && ts.isStringLiteralLike(argument) ? argument.text : null;
      const indirectLoader =
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require");
      if (moduleName === NEXT_INTL_NAVIGATION_MODULE && indirectLoader) {
        failSource(
          sourceFile,
          node,
          "must not load next-intl/navigation indirectly"
        );
      }
      if (
        moduleName &&
        isResolvedModule(moduleName, normalizedFile, NAVIGATION_MODULE) &&
        indirectLoader
      ) {
        failSource(
          sourceFile,
          node,
          "must not load locale navigation indirectly"
        );
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  return { importCount: imports.length, imports, namespaces: [] };
}

const inspectNavigationClientImports = inspectNavigationImports;

function inspectIntlProviderPlacement(source, fileName = "fixture.tsx") {
  const normalizedFile = normalizeFileName(fileName);
  const sourceFile = parseTypeScriptSource(source, normalizedFile);
  let rawProviderBinding = null;
  let scopedProviderBinding = null;
  const rawProviderElements = [];
  const scopedProviderScopes = [];

  for (const statement of sourceFile.statements) {
    const moduleSpecifier = statement.moduleSpecifier;
    const moduleName =
      moduleSpecifier && ts.isStringLiteral(moduleSpecifier)
        ? moduleSpecifier.text
        : null;

    if (moduleName && isUseIntlModule(moduleName)) {
      failSource(
        sourceFile,
        statement,
        "must not import or re-export use-intl directly; use next-intl"
      );
    }

    if (
      ts.isExportDeclaration(statement) &&
      moduleName &&
      isResolvedModule(moduleName, normalizedFile, SCOPED_PROVIDER_MODULE)
    ) {
      failSource(
        sourceFile,
        statement,
        "must not re-export ScopedIntlProvider; import it at an allowed boundary"
      );
    }

    if (
      ts.isImportDeclaration(statement) &&
      moduleName === "next-intl" &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      for (const element of statement.importClause.namedBindings.elements) {
        if (
          (element.propertyName?.text ?? element.name.text) !==
          "NextIntlClientProvider"
        ) {
          continue;
        }
        if (normalizedFile !== RAW_PROVIDER_FILE) {
          failSource(
            sourceFile,
            element,
            `NextIntlClientProvider is allowed only in ${RAW_PROVIDER_FILE}`
          );
        }
        if (rawProviderBinding) {
          failSource(
            sourceFile,
            element,
            "must import NextIntlClientProvider once"
          );
        }
        rawProviderBinding = element.name.text;
      }
    }

    if (
      ts.isImportDeclaration(statement) &&
      moduleName &&
      isResolvedModule(moduleName, normalizedFile, SCOPED_PROVIDER_MODULE)
    ) {
      const importClause = statement.importClause;
      if (
        !importClause ||
        importClause.isTypeOnly ||
        !importClause.name ||
        importClause.namedBindings
      ) {
        failSource(
          sourceFile,
          statement,
          "ScopedIntlProvider must use one direct default import"
        );
      }
      if (!Object.hasOwn(SCOPED_PROVIDER_PLACEMENTS, normalizedFile)) {
        failSource(
          sourceFile,
          statement,
          "ScopedIntlProvider is not allowed in this file"
        );
      }
      if (scopedProviderBinding) {
        failSource(
          sourceFile,
          statement,
          "must import ScopedIntlProvider once"
        );
      }
      scopedProviderBinding = importClause.name.text;
    }
  }

  function recordScopedElement(element) {
    const scopeAttributes = [];
    for (const attribute of element.attributes.properties) {
      if (ts.isJsxSpreadAttribute(attribute)) {
        failSource(
          sourceFile,
          attribute,
          "ScopedIntlProvider does not allow spread props"
        );
      }
      if (attribute.name.getText(sourceFile) === "scope")
        scopeAttributes.push(attribute);
    }
    const [scopeAttribute] = scopeAttributes;
    if (
      scopeAttributes.length !== 1 ||
      !scopeAttribute.initializer ||
      !ts.isStringLiteral(scopeAttribute.initializer)
    ) {
      failSource(
        sourceFile,
        element,
        "ScopedIntlProvider scope must be one direct string literal"
      );
    }
    scopedProviderScopes.push(scopeAttribute.initializer.text);
  }

  function isImportBindingIdentifier(node) {
    return (
      ts.isImportSpecifier(node.parent) ||
      (ts.isImportClause(node.parent) && node.parent.name === node)
    );
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const [argument] = node.arguments;
      const moduleName =
        argument && ts.isStringLiteralLike(argument) ? argument.text : null;
      if (
        moduleName &&
        (isUseIntlModule(moduleName) ||
          isResolvedModule(
            moduleName,
            normalizedFile,
            SCOPED_PROVIDER_MODULE
          )) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require"))
      ) {
        failSource(
          sourceFile,
          node,
          "must not load internationalization providers indirectly"
        );
      }
    }

    if (ts.isIdentifier(node) && !isImportBindingIdentifier(node)) {
      const isOpeningTag =
        (ts.isJsxOpeningElement(node.parent) ||
          ts.isJsxSelfClosingElement(node.parent)) &&
        node.parent.tagName === node;
      const isClosingTag =
        ts.isJsxClosingElement(node.parent) && node.parent.tagName === node;

      if (rawProviderBinding && node.text === rawProviderBinding) {
        if (!isOpeningTag && !isClosingTag) {
          failSource(
            sourceFile,
            node,
            "NextIntlClientProvider must be used directly as JSX"
          );
        }
        if (isOpeningTag) rawProviderElements.push(node.parent);
      }

      if (scopedProviderBinding && node.text === scopedProviderBinding) {
        if (!isOpeningTag && !isClosingTag) {
          failSource(
            sourceFile,
            node,
            "ScopedIntlProvider must be used directly as JSX"
          );
        }
        if (isOpeningTag) recordScopedElement(node.parent);
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  if (normalizedFile === RAW_PROVIDER_FILE) {
    if (!rawProviderBinding || rawProviderElements.length !== 1) {
      failSource(
        sourceFile,
        sourceFile,
        "must import and render NextIntlClientProvider exactly once"
      );
    }
  }

  const expectedScopes = SCOPED_PROVIDER_PLACEMENTS[normalizedFile];
  if (expectedScopes) {
    if (!scopedProviderBinding) {
      failSource(
        sourceFile,
        sourceFile,
        "must import and render its declared ScopedIntlProvider"
      );
    }
    if (!arraysEqual(scopedProviderScopes, expectedScopes)) {
      failSource(
        sourceFile,
        sourceFile,
        `must render scoped providers ${expectedScopes.join(", ")} exactly once`
      );
    }
  }

  return {
    rawProviderCount: rawProviderElements.length,
    scopedProviderScopes
  };
}

function inspectNextIntlClientHooks(source, fileName = "fixture.tsx") {
  const sourceFile = parseTypeScriptSource(source, fileName);

  function fail(node, message) {
    failSource(sourceFile, node, message);
  }

  const directBindings = new Map();
  for (const statement of sourceFile.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === "next-intl"
    ) {
      fail(
        statement,
        "must not re-export next-intl; import client hooks directly where used"
      );
    }

    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "next-intl"
    ) {
      continue;
    }

    const importClause = statement.importClause;
    const bindings = importClause?.namedBindings;
    if (
      !importClause ||
      importClause.name ||
      !bindings ||
      !ts.isNamedImports(bindings)
    ) {
      fail(
        statement,
        "must import next-intl through direct named imports only"
      );
    }

    if (importClause.isTypeOnly) continue;
    for (const element of bindings.elements) {
      if (element.isTypeOnly) continue;
      const importedName = element.propertyName?.text ?? element.name.text;
      if (
        PROVIDER_DEPENDENT_NEXT_INTL_HOOKS.has(importedName) ||
        /^use[A-Z]/.test(importedName)
      ) {
        directBindings.set(element.name.text, {
          hook: importedName,
          importNode: element
        });
      }
    }
  }

  const isClientModule = hasUseClientDirective(sourceFile);
  const calls = [];
  const namespaces = [];
  const calledBindings = new Set();

  function recordCall(call, localName, binding) {
    calledBindings.add(localName);
    let namespace = null;
    if (binding.hook === "useTranslations") {
      const [argument] = call.arguments;
      if (
        call.arguments.length !== 1 ||
        !argument ||
        !ts.isStringLiteral(argument)
      ) {
        fail(
          call,
          `next-intl ${localName} must use exactly one string-literal namespace`
        );
      }
      namespace = argument.text;
      namespaces.push(namespace);
    }
    calls.push({ hook: binding.hook, localName, namespace });
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const [argument] = node.arguments;
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        argument &&
        ts.isStringLiteralLike(argument) &&
        argument.text === "next-intl"
      ) {
        fail(node, "must not load next-intl through dynamic import()");
      }
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === "require" &&
        argument &&
        ts.isStringLiteralLike(argument) &&
        argument.text === "next-intl"
      ) {
        fail(node, "must not load next-intl through require()");
      }
      if (ts.isIdentifier(node.expression)) {
        const binding = directBindings.get(node.expression.text);
        if (binding) recordCall(node, node.expression.text, binding);
      }
    }

    if (
      ts.isIdentifier(node) &&
      directBindings.has(node.text) &&
      !ts.isImportSpecifier(node.parent) &&
      !(ts.isCallExpression(node.parent) && node.parent.expression === node)
    ) {
      fail(
        node,
        `next-intl ${node.text} must be called directly so the provider inventory cannot miss it`
      );
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  for (const [localName, binding] of directBindings) {
    if (!calledBindings.has(localName)) {
      fail(
        binding.importNode,
        `next-intl ${localName} must be called directly so the provider inventory cannot miss it`
      );
    }
  }
  if (calls.length > 0 && !isClientModule) {
    fail(
      sourceFile,
      "provider-dependent next-intl hooks require an explicit use client directive"
    );
  }

  return {
    callCount: calls.length,
    calls,
    namespaces,
    bindings: [...directBindings.entries()]
      .map(([localName, binding]) => `${binding.hook}:${localName}`)
      .sort()
  };
}

function validateClientProviderConsumer(file, inspection) {
  const dependencyCount =
    inspection.dependencyCount ?? inspection.callCount ?? 0;
  if (dependencyCount === 0) return null;
  const normalizedFile = normalizeFileName(file);
  if (normalizedFile.startsWith("src/app/[locale]/studio/")) {
    throw new Error(
      `${normalizedFile} must not use provider-dependent internationalization client APIs`
    );
  }

  const route = CLIENT_PROVIDER_CONSUMER_ROUTES[normalizedFile];
  if (!route) {
    throw new Error(`${normalizedFile} has no declared client provider scope`);
  }
  const routeScopes = CLIENT_MESSAGE_ROUTE_SCOPES[route];
  if (!routeScopes || routeScopes.length === 0) {
    throw new Error(`${normalizedFile} has no allowed client provider scope`);
  }

  const selectors = routeScopes.flatMap(
    (scope) => CLIENT_MESSAGE_SCOPE_PATHS[scope]
  );
  for (const namespace of inspection.namespaces ?? []) {
    if (!selectors.some((selector) => namespaceCovered(namespace, selector))) {
      throw new Error(
        `${normalizedFile} uses ${namespace} outside ${route} client message scopes`
      );
    }
  }
  return route;
}

function namespaceCovered(namespace, selector) {
  return namespace === selector || namespace.startsWith(`${selector}.`);
}

export {
  PROVIDER_DEPENDENT_NEXT_INTL_HOOKS,
  RAW_PROVIDER_FILE,
  SCOPED_PROVIDER_MODULE,
  NAVIGATION_MODULE,
  SCOPED_PROVIDER_PLACEMENTS,
  CLIENT_PROVIDER_CONSUMER_ROUTES,
  isSupportedSourceFile,
  walkSupportedSourceFiles,
  normalizeFileName,
  parseTypeScriptSource,
  hasUseClientDirective,
  inspectNavigationRuntimeExports,
  inspectNavigationImports,
  inspectNavigationClientImports,
  inspectIntlProviderPlacement,
  inspectNextIntlClientHooks,
  validateClientProviderConsumer
};
