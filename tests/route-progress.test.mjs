import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile("src/components/motion/RouteProgressBar.tsx", "utf8");
const layout = await readFile("src/app/[locale]/(site)/layout.tsx", "utf8");
const globals = await readFile("src/app/globals.css", "utf8");

test("route progress bar is mounted and styled as a smooth determinate loader", () => {
  assert.match(component, /^'use client'/);
  assert.match(component, /usePathname/);
  assert.match(component, /ROUTE_PROGRESS_STEPS/);
  assert.match(component, /setProgress/);
  assert.match(component, /'--route-progress'/);
  assert.match(component, /document\.addEventListener\('click'/);
  assert.match(component, /route-progress--\$\{phase\}/);
  assert.match(component, /route-progress__bar/);

  assert.match(layout, /RouteProgressBar/);
  assert.match(layout, /<RouteProgressBar \/>/);

  assert.match(globals, /\.route-progress\s*\{/);
  assert.match(globals, /\.route-progress__bar\s*\{/);
  assert.match(globals, /scaleX\(var\(--route-progress/);
  assert.match(globals, /transform 760ms cubic-bezier/);
  assert.doesNotMatch(globals, /route-progress-run/);
  assert.doesNotMatch(globals, /route-progress-spectrum/);
  assert.match(globals, /#ff5ac8/);
  assert.match(globals, /#37d5ff/);
});
