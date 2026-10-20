import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export async function readAll(...relativePaths) {
  const sources = await Promise.all(
    relativePaths.map((relativePath) => readFile(relativePath, "utf8"))
  );
  return sources.join("\n");
}

/** Every module the particle backdrops run through, main thread and worker. */
export function readParticleRuntime() {
  return readAll(
    "src/components/webgl/ScrollParticleRenderer.ts",
    "src/components/webgl/particle-engine.ts",
    "src/components/webgl/particle-gl.ts",
    "src/components/webgl/particle-worker-host.ts"
  );
}

/**
 * The WebGL context must be created off the main thread when the browser
 * supports it: the first context in a page blocks its thread for hundreds of
 * milliseconds, which showed up as Total Blocking Time.
 */
export function assertWorkerRendering(backdrop, renderer, sceneName) {
  assert.match(
    backdrop,
    new RegExp(
      `new Worker\\(\\s*new URL\\("\\.\\./webgl/scenes/${sceneName}\\.worker", import\\.meta\\.url\\)`
    ),
    "worker URL must stay extensionless so Turbopack bundles it as a worker"
  );
  assert.doesNotMatch(backdrop, /type: "module"/, "Turbopack worker bootstrap needs a classic worker");
  assert.match(renderer, /canvas\.transferControlToOffscreen\(\)/);
  assert.match(renderer, /typeof OffscreenCanvas !== "undefined"/);
  assert.match(renderer, /linkInlineEngine\(canvas, options, settings\)/);
  assert.match(renderer, /hostParticleWorker/);
  assert.doesNotMatch(
    backdrop,
    /window\.|document\.|getBoundingClientRect|matchMedia/,
    "scene code runs inside the worker and must not touch the DOM"
  );
}
