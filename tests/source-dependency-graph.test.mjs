import assert from "node:assert/strict";
import test from "node:test";

import {
  DependencyBoundaryError,
  collectLocalRuntimeDependencies,
  collectStudioRoots,
  createLocalDependencyGraph,
  isSupportedSourceFile,
  validateStudioDependencyBoundary
} from "./helpers/source-dependency-graph.mjs";

test("source graph inventories supported runtime module edges only", () => {
  assert.equal(isSupportedSourceFile("fixture.js"), true);
  assert.equal(isSupportedSourceFile("fixture.jsx"), true);
  assert.equal(isSupportedSourceFile("fixture.ts"), true);
  assert.equal(isSupportedSourceFile("fixture.tsx"), true);
  assert.equal(isSupportedSourceFile("fixture.mjs"), true);
  assert.equal(isSupportedSourceFile("fixture.mts"), true);
  assert.equal(isSupportedSourceFile("fixture.d.ts"), false);
  assert.equal(isSupportedSourceFile("fixture.json"), false);

  const dependencies = collectLocalRuntimeDependencies(
    `
      import type {TypeOnly} from "./type-only";
      import "./side-effect";
      export type {OtherType} from "./other-type";
      export {value} from "./reexported";
      export * from "./barrel";
      const lazy = import("./lazy", {with: {type: "json"}});
      const commonJs = require("./common-js");
      import React from "react";
    `,
    "src/fixture.mts"
  );

  assert.deepEqual(dependencies.sort(), [
    "./barrel",
    "./common-js",
    "./lazy",
    "./reexported",
    "./side-effect",
    "react"
  ]);
});

test("Studio graph traverses relative, alias, re-export, dynamic, and CommonJS edges", () => {
  const studioPage = "src/app/[locale]/studio/page.tsx";
  const studioClient = "src/app/[locale]/studio/ClientRoot.jsx";
  const bridge = "src/app/[locale]/studio/bridge.mts";
  const feature = "src/feature/index.jsx";
  const runtime = "src/runtime/index.mjs";
  const hazard = "src/runtime/hazard.js";
  const sourceMap = new Map([
    [
      studioPage,
      `import {Feature} from "./bridge";\nexport default function Page() { return <Feature />; }`
    ],
    [studioClient, `"use client";\nexport default function ClientRoot() {}`],
    [bridge, `export {default as Feature} from "@/feature";`],
    [
      feature,
      `export default async function Feature() { return import("@/runtime", {with: {mode: "lazy"}}); }`
    ],
    [runtime, `export default require("./hazard");`],
    [hazard, `export const forbidden = true;`]
  ]);

  assert.deepEqual(collectStudioRoots(sourceMap), [studioPage, studioClient]);
  assert.deepEqual(createLocalDependencyGraph(sourceMap).get(bridge), [
    feature
  ]);
  assert.throws(
    () =>
      validateStudioDependencyBoundary(sourceMap, {
        hazards: { [hazard]: "a forbidden runtime" }
      }),
    (error) => {
      assert.equal(error instanceof DependencyBoundaryError, true);
      assert.deepEqual(error.chain, [
        studioPage,
        bridge,
        feature,
        runtime,
        hazard
      ]);
      assert.equal(error.hazardFile, hazard);
      return true;
    }
  );
});
