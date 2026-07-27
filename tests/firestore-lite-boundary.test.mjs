import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import ts from "typescript";

const sourceRoot = "src";
const sourceExtensions = /\.(?:js|jsx|mjs|mts|ts|tsx)$/;
const firestoreModule =
  /^(?:firebase\/(?:compat\/)?firestore|@firebase\/firestore)(?:\/|$)/;
const unresolvedFirestoreModule = "<unresolved-firestore-module>";

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function scriptKind(file) {
  return /\.(?:jsx|tsx)$/i.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

function staticModuleSpecifier(node) {
  if (!node) return null;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isParenthesizedExpression(node)) {
    return staticModuleSpecifier(node.expression);
  }
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = staticModuleSpecifier(node.left);
    const right = staticModuleSpecifier(node.right);
    return left === null || right === null ? null : left + right;
  }
  if (ts.isTemplateExpression(node)) {
    let value = node.head.text;
    for (const span of node.templateSpans) {
      const expression = staticModuleSpecifier(span.expression);
      if (expression === null) return null;
      value += expression + span.literal.text;
    }
    return value;
  }
  return null;
}

function collectFirestoreImports(source, file = "fixture.ts") {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(file)
  );
  const imports = [];
  const record = (specifier) => {
    const moduleName = staticModuleSpecifier(specifier);
    if (moduleName && firestoreModule.test(moduleName)) {
      imports.push(moduleName);
      return;
    }
    if (
      moduleName === null &&
      specifier &&
      /firebase|firestore/i.test(specifier.getText(sourceFile))
    ) {
      imports.push(unresolvedFirestoreModule);
    }
  };

  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      record(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      record(node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      const isDynamicImport =
        node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire =
        ts.isIdentifier(node.expression) && node.expression.text === "require";
      if (isDynamicImport || isRequire) record(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return imports;
}

test("recognizes static, side-effect, dynamic, and CommonJS Firestore imports", () => {
  const imports = collectFirestoreImports(`
    import type { Firestore } from "firebase/firestore/lite";
    import "firebase/firestore";
    await import("firebase/firestore/lite");
    require("firebase/firestore");
    import/**/"firebase/firestore/lite";
    await import(/* webpackChunkName: "engagement" */ \`firebase/firestore\`);
    require/**/("firebase/firestore/lite");
    import legacy = require("firebase/firestore");
    import "firebase/compat/firestore";
    import "@firebase/firestore";
    await import("firebase/firestore/lite/internal");
    require("firebase/" + "firestore");
    await import(\`firebase/\${"firestore"}/lite\`);
    await import(\`firebase/\${firestorePackage}\`);
  `);

  assert.deepEqual(imports, [
    "firebase/firestore/lite",
    "firebase/firestore",
    "firebase/firestore/lite",
    "firebase/firestore",
    "firebase/firestore/lite",
    "firebase/firestore",
    "firebase/firestore/lite",
    "firebase/firestore",
    "firebase/compat/firestore",
    "@firebase/firestore",
    "firebase/firestore/lite/internal",
    "firebase/firestore",
    "firebase/firestore/lite",
    unresolvedFirestoreModule
  ]);
});

test("production engagement imports only the REST-only Firestore Lite client", () => {
  const imports = walk(sourceRoot)
    .filter((file) => sourceExtensions.test(file))
    .flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return collectFirestoreImports(source, file).map((module) => ({
        file: relative(".", file).split(sep).join("/"),
        module
      }));
    });

  assert.deepEqual(
    imports.filter(({ module }) => module === "firebase/firestore"),
    []
  );
  assert.deepEqual([...new Set(imports.map(({ file }) => file))].sort(), [
    "src/lib/engagement/firebase-repository.ts",
    "src/lib/firebase/client.ts"
  ]);
  assert.ok(imports.length >= 7);
  assert.ok(
    imports.every(({ module }) => module === "firebase/firestore/lite")
  );
});
