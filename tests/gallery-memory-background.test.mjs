import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(relativePath) {
  return readFile(relativePath, "utf8");
}

test("gallery renders a theme-aware particle Memory Bloom in an async WebGL boundary", async () => {
  const [page, loader, backdrop, renderer, grid, motionProvider, css] =
    await Promise.all([
      read("src/app/[locale]/(site)/gallery/page.tsx"),
      read("src/components/gallery/GalleryBackdrop.tsx"),
      read("src/components/gallery/MemoryBloomBackdrop.tsx"),
      read("src/components/webgl/ScrollParticleRenderer.ts"),
      read("src/components/gallery/GalleryGrid.tsx"),
      read("src/components/motion/MotionProvider.tsx"),
      read("src/app/[locale]/(site)/gallery/gallery.css")
    ]);

  assert.match(page, /<GalleryBackdrop \/>/);
  assert.match(
    loader,
    /dynamic\(\s*\(\) => import\(['"]@\/components\/gallery\/MemoryBloomBackdrop['"]\)/
  );
  assert.match(loader, /ssr:\s*false/);
  assert.match(loader, /className="gallery-memory-bloom"/);
  assert.match(loader, /className="gallery-memory-bloom-viewport"/);

  assert.match(backdrop, /mountScrollParticleRenderer/);
  assert.match(renderer, /getContext\("webgl"/);
  assert.match(renderer, /gl\.drawArrays\(gl\.POINTS, 0, vertexCount\)/);
  assert.match(backdrop, /const RIBBON_COUNT = 3/);
  assert.match(backdrop, /attribute float aU/);
  assert.match(backdrop, /attribute float aV/);
  assert.match(backdrop, /attribute float aRibbon/);
  assert.match(backdrop, /vec2 normal = vec2\(-tangent\.y, tangent\.x\)/);
  assert.match(backdrop, /float copyProtection/);
  assert.match(backdrop, /uniform float uScroll/);
  assert.match(backdrop, /uniform float uHover/);
  assert.match(backdrop, /uniform float uPointerSpeed/);
  assert.match(backdrop, /centerY = -0\.06[\s\S]*?t \* 1\.12/);
  assert.match(backdrop, /centerY = -0\.05[\s\S]*?t \* 1\.11/);
  assert.match(backdrop, /centerY = -0\.04[\s\S]*?t \* 1\.1/);
  assert.match(backdrop, /float organicDensity/);
  assert.match(backdrop, /float rippleEnvelope/);
  assert.match(backdrop, /float rippleWave/);
  assert.doesNotMatch(
    backdrop,
    /magneticPush|magneticPull|pointerTangent|swirl|scrollVelocity|scrollBreath|timeDrift/
  );
  assert.doesNotMatch(backdrop, /journey \* scrollPhase/);
  assert.match(
    backdrop,
    /float fold = sin\(aV \* 2\.8 \+ t \* 5\.1 \+ phase\)/
  );
  assert.match(backdrop, /const DARK_PALETTE/);
  assert.match(backdrop, /const LIGHT_PALETTE/);

  assert.match(renderer, /const TARGET_FRAME_MS = 1000 \/ 24/);
  assert.match(renderer, /const ACTIVE_SCROLL_MS = 180/);
  assert.match(
    renderer,
    /scrollProgress = clamp\(-rect\.top \/ scrollableHeight, 0, 1\)/
  );
  assert.match(
    renderer,
    /performance\.now\(\) < scrollActiveUntil \? 0 : TARGET_FRAME_MS/
  );
  assert.match(
    renderer,
    /scrollActiveUntil = performance\.now\(\) \+ ACTIVE_SCROLL_MS/
  );
  assert.match(backdrop, /dprCap: \(width\) => \(width < 720 \? 1 : 1\.25\)/);
  assert.match(renderer, /powerPreference: "low-power"/);
  assert.match(renderer, /requestIdleCallback/);
  assert.match(renderer, /prefers-reduced-motion: reduce/);
  assert.match(renderer, /new IntersectionObserver/);
  assert.match(renderer, /new MutationObserver\(onThemeChange\)/);
  assert.match(renderer, /visibilitychange/);
  assert.match(renderer, /attributeFilter: \["data-theme"\]/);
  assert.match(backdrop, /reducedTime: 18/);
  assert.match(backdrop, /rootSelector: "\.gallery-showcase"/);
  assert.match(
    renderer,
    /canvas\.closest<HTMLElement>\(options\.rootSelector\)/
  );
  assert.match(renderer, /window\.addEventListener\("scroll", onScroll/);
  assert.match(backdrop, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(
    renderer,
    /window\.addEventListener\("pointermove", onPointerMove/
  );
  assert.match(backdrop, /frame\.reducedMotion \? 0 : pointer\.hover/);
  assert.match(motionProvider, /<MotionConfig reducedMotion="user">/);
  assert.doesNotMatch(grid, /useReducedMotion/);

  assert.match(css, /\.gallery-showcase \{[\s\S]*?isolation: isolate/);
  assert.match(css, /\.gallery-memory-bloom \{[^}]*position: absolute/);
  assert.match(css, /\.gallery-memory-bloom \{[^}]*inset: 0/);
  assert.match(css, /\.gallery-memory-bloom \{[^}]*pointer-events: none/);
  assert.match(css, /\.gallery-memory-bloom-viewport \{[^}]*position: sticky/);
  assert.match(css, /\.gallery-memory-bloom-viewport \{[^}]*height: 100svh/);
  assert.match(css, /\.gallery-memory-bloom-canvas \{[\s\S]*?width: 100%/);
  assert.match(css, /\.gallery-showcase \.container \{[\s\S]*?z-index: 1/);
  assert.doesNotMatch(
    css,
    /\.gallery-memory-bloom \{[^}]*height:\s*(?:clamp|1120px)/
  );

  assert.doesNotMatch(backdrop, /ellipseDistance|vanishingPoint|nodeMask/);
  assert.doesNotMatch(backdrop, /getContext\(['"]2d['"]\)/);
  assert.doesNotMatch(backdrop, /Path2D|shadowBlur|CanvasRenderingContext2D/);
  assert.doesNotMatch(backdrop, /<svg|<animateMotion/);
});
