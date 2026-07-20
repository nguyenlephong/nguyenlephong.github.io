import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const APP_SOURCE_PATTERN = /\.(?:ts|tsx)$/;
const CSS_SPECIFIER_PATTERN = /\.css(?:\?[^#]*)?(?:#[^?]*)?$/i;

function normalizePath(value) {
  return value.split(path.sep).join(path.posix.sep);
}

function resolveStylesheet(importer, specifier) {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
  if (!cleanSpecifier.startsWith(".")) return cleanSpecifier;
  return path.posix.normalize(
    path.posix.join(path.posix.dirname(importer), cleanSpecifier)
  );
}

async function walkAppSources(directory, rootDir, sources) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walkAppSources(absolutePath, rootDir, sources);
      continue;
    }
    if (!entry.isFile() || !APP_SOURCE_PATTERN.test(entry.name)) continue;
    const relativePath = normalizePath(path.relative(rootDir, absolutePath));
    sources[relativePath] = await readFile(absolutePath, "utf8");
  }
}

export function inspectCssImports(sources) {
  const staticImports = [];
  const dynamicImports = [];
  const typeOnlyCssImports = [];
  const unresolvedDynamicImports = [];

  for (const [importer, source] of Object.entries(sources)) {
    const sourceFile = ts.createSourceFile(
      importer,
      source,
      ts.ScriptTarget.Latest,
      true,
      importer.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const addImport = (collection, specifier) => {
      if (!CSS_SPECIFIER_PATTERN.test(specifier)) return;
      collection.push({
        importer,
        specifier,
        stylesheet: resolveStylesheet(importer, specifier)
      });
    };

    const isTypeOnlyImport = (declaration) => {
      const clause = declaration.importClause;
      if (!clause) return false;
      if (clause.isTypeOnly) return true;
      if (clause.name || !clause.namedBindings) return false;
      return (
        ts.isNamedImports(clause.namedBindings) &&
        clause.namedBindings.elements.length > 0 &&
        clause.namedBindings.elements.every((element) => element.isTypeOnly)
      );
    };

    const staticValue = (argument) => {
      if (
        ts.isStringLiteral(argument) ||
        ts.isNoSubstitutionTemplateLiteral(argument)
      ) {
        return { resolved: true, value: argument.text };
      }
      if (ts.isNumericLiteral(argument)) {
        return { resolved: true, value: Number(argument.text) };
      }
      if (argument.kind === ts.SyntaxKind.TrueKeyword) {
        return { resolved: true, value: true };
      }
      if (argument.kind === ts.SyntaxKind.FalseKeyword) {
        return { resolved: true, value: false };
      }
      if (argument.kind === ts.SyntaxKind.NullKeyword) {
        return { resolved: true, value: null };
      }
      if (
        ts.isParenthesizedExpression(argument) ||
        ts.isAsExpression(argument) ||
        ts.isTypeAssertionExpression(argument) ||
        ts.isSatisfiesExpression(argument) ||
        ts.isNonNullExpression(argument)
      ) {
        return staticValue(argument.expression);
      }
      if (
        ts.isBinaryExpression(argument) &&
        argument.operatorToken.kind === ts.SyntaxKind.PlusToken
      ) {
        const left = staticValue(argument.left);
        const right = staticValue(argument.right);
        if (!left.resolved || !right.resolved) return { resolved: false };
        return {
          resolved: true,
          value:
            typeof left.value === "string" || typeof right.value === "string"
              ? String(left.value) + String(right.value)
              : Number(left.value) + Number(right.value)
        };
      }
      if (!ts.isTemplateExpression(argument)) return { resolved: false };

      let specifier = argument.head.text;
      for (const span of argument.templateSpans) {
        const interpolation = staticValue(span.expression);
        if (!interpolation.resolved) return { resolved: false };
        specifier += `${String(interpolation.value)}${span.literal.text}`;
      }
      return { resolved: true, value: specifier };
    };

    const visit = (node) => {
      if (
        ts.isImportDeclaration(node) &&
        (ts.isStringLiteral(node.moduleSpecifier) ||
          ts.isNoSubstitutionTemplateLiteral(node.moduleSpecifier))
      ) {
        addImport(
          isTypeOnlyImport(node) ? typeOnlyCssImports : staticImports,
          node.moduleSpecifier.text
        );
      } else if (ts.isCallExpression(node)) {
        const isDynamicImport =
          node.expression.kind === ts.SyntaxKind.ImportKeyword;
        const isRequire =
          ts.isIdentifier(node.expression) &&
          node.expression.text === "require";
        if (isDynamicImport || isRequire) {
          const argument = node.arguments[0];
          const result = argument ? staticValue(argument) : { resolved: false };
          if (result.resolved && typeof result.value === "string") {
            addImport(dynamicImports, result.value);
          } else {
            unresolvedDynamicImports.push({
              expression: argument?.getText(sourceFile) ?? "<missing>",
              importer,
              start: node.getStart(sourceFile)
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  const byLocation = (left, right) =>
    left.importer.localeCompare(right.importer, "en") ||
    left.stylesheet.localeCompare(right.stylesheet, "en");
  staticImports.sort(byLocation);
  dynamicImports.sort(byLocation);
  typeOnlyCssImports.sort(byLocation);
  unresolvedDynamicImports.sort(
    (left, right) =>
      left.importer.localeCompare(right.importer, "en") ||
      left.start - right.start
  );
  return {
    dynamicImports,
    staticImports,
    typeOnlyCssImports,
    unresolvedDynamicImports
  };
}

export async function collectAppCssImports(rootDir) {
  const sources = {};
  await walkAppSources(path.join(rootDir, "src/app"), rootDir, sources);
  return inspectCssImports(sources);
}

export function validateCssImportOwnership(inventory, expectedImporters) {
  const violations = (inventory.typeOnlyCssImports ?? []).map(
    ({ importer, specifier }) =>
      `Type-only CSS import does not load a stylesheet in ${importer}: ${specifier}`
  );
  violations.push(
    ...(inventory.unresolvedDynamicImports ?? []).map(
      ({ expression, importer }) =>
        `Unresolved dynamic module specifier in ${importer}: ${expression}`
    )
  );
  violations.push(
    ...inventory.dynamicImports.map(
      ({ importer, specifier }) =>
        `Dynamic CSS import in ${importer}: ${specifier}`
    )
  );
  const actualImporters = new Map();
  for (const record of [
    ...inventory.staticImports,
    ...inventory.dynamicImports
  ]) {
    const importers = actualImporters.get(record.stylesheet) ?? new Set();
    importers.add(record.importer);
    actualImporters.set(record.stylesheet, importers);
  }

  for (const [stylesheet, expected] of Object.entries(expectedImporters)) {
    const actual = actualImporters.get(stylesheet) ?? new Set();
    for (const importer of [...expected].sort()) {
      if (!actual.has(importer)) {
        violations.push(`Missing CSS importer for ${stylesheet}: ${importer}`);
      }
    }
    for (const importer of [...actual].sort()) {
      if (!expected.includes(importer)) {
        violations.push(
          `Unexpected CSS importer for ${stylesheet}: ${importer}`
        );
      }
    }
  }

  for (const stylesheet of [...actualImporters.keys()].sort()) {
    if (!(stylesheet in expectedImporters)) {
      violations.push(`Unexpected imported stylesheet: ${stylesheet}`);
    }
  }
  return violations;
}
