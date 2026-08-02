"use client";

import { useEffect, useRef } from "react";
import {
  clamp,
  createParticleProgram,
  deferRendererMount,
  drawParticleFrame,
  mountScrollParticleRenderer,
  TARGET_FRAME_MS,
  type ScrollParticleScene
} from "@/components/webgl/ScrollParticleRenderer";

const PARTICLE_STRIDE = 9;
const RIBBON_COUNT = 3;

const DARK_PALETTE = [
  [0.141, 0.769, 1],
  [0.392, 0.471, 1],
  [0.678, 0.439, 1],
  [1, 0.471, 0.392],
  [1, 0.816, 0.478]
] as const;

const LIGHT_PALETTE = [
  [0.02, 0.369, 0.718],
  [0.157, 0.282, 0.678],
  [0.337, 0.231, 0.616],
  [0.047, 0.42, 0.514],
  [0.337, 0.384, 0.529]
] as const;

const VERTEX_SHADER = `
precision highp float;

attribute float aU;
attribute float aV;
attribute float aSeed;
attribute float aLayer;
attribute float aColor;
attribute float aSize;
attribute float aRibbon;
attribute float aRidge;
attribute float aSparkle;

uniform float uTime;
uniform float uCompact;
uniform float uDpr;
uniform float uDark;
uniform float uScroll;
uniform float uHover;
uniform float uPointerSpeed;
uniform vec2 uViewport;
uniform vec2 uPointer;
uniform vec3 uPalette0;
uniform vec3 uPalette1;
uniform vec3 uPalette2;
uniform vec3 uPalette3;
uniform vec3 uPalette4;

varying vec3 vColor;
varying float vAlpha;
varying float vSparkle;
varying float vHover;

vec3 paletteColor(float index) {
  if (index < 0.5) return uPalette0;
  if (index < 1.5) return uPalette1;
  if (index < 2.5) return uPalette2;
  if (index < 3.5) return uPalette3;
  return uPalette4;
}

void main() {
  float t = clamp(aU * 0.5 + 0.5, 0.0, 1.0);
  float phase = aRibbon * 1.73;
  float journey = smoothstep(0.02, 0.26, uScroll);
  float scrollPhase = uScroll * 2.4;
  float centerX;
  float centerY;
  float tangentX;
  float tangentY;
  float ribbonWidth;

  if (aRibbon < 0.5) {
    float flow = t * 5.4 + 0.35 + scrollPhase * 0.26;
    float detail = t * 12.8 + 1.2 - scrollPhase * 0.1;
    centerX = 0.38 + sin(flow) * 0.16 + sin(detail) * 0.028;
    centerY = -0.06
      + t * 1.12
      + sin(t * 4.0 + 0.4 + scrollPhase * 0.1) * 0.018;
    tangentX = cos(flow) * 0.864 + cos(detail) * 0.3584;
    tangentY = 1.12
      + cos(t * 4.0 + 0.4 + scrollPhase * 0.1) * 0.072;
    ribbonWidth = 0.12 * (0.82 + sin(t * 3.14159) * 0.18);
  } else if (aRibbon < 1.5) {
    float flow = t * 6.2 + 2.0 - scrollPhase * 0.22;
    float detail = t * 14.2 + 0.8 + scrollPhase * 0.08;
    centerX = 0.66 + sin(flow) * 0.17 + cos(detail) * 0.024;
    centerY = -0.05
      + t * 1.11
      + sin(t * 4.6 + 2.0 - scrollPhase * 0.08) * 0.02;
    tangentX = cos(flow) * 1.054 - sin(detail) * 0.3408;
    tangentY = 1.11
      + cos(t * 4.6 + 2.0 - scrollPhase * 0.08) * 0.092;
    ribbonWidth = 0.108 * (0.84 + sin(t * 3.14159) * 0.16);
  } else {
    float flow = t * 5.1 + 4.1 + scrollPhase * 0.18;
    float detail = t * 11.6 + 2.3 - scrollPhase * 0.1;
    centerX = 0.91 + sin(flow) * 0.14 + sin(detail) * 0.026;
    centerY = -0.04
      + t * 1.1
      + cos(t * 4.2 + 0.3 + scrollPhase * 0.07) * 0.018;
    tangentX = cos(flow) * 0.714 + cos(detail) * 0.3016;
    tangentY = 1.1
      - sin(t * 4.2 + 0.3 + scrollPhase * 0.07) * 0.0756;
    ribbonWidth = 0.096 * (0.84 + sin(t * 3.14159) * 0.16);
  }

  float scrollBraid = sin(t * 7.3 + phase + scrollPhase * 0.4) * 0.012;
  centerX += scrollBraid;
  centerY += cos(t * 5.1 + phase - scrollPhase * 0.25) * 0.006;
  ribbonWidth *= 1.0
    + sin(scrollPhase * 0.35 + t * 2.6 + phase) * 0.035;

  vec2 tangent = normalize(vec2(tangentX, tangentY));
  vec2 normal = vec2(-tangent.y, tangent.x);
  float fold = sin(aV * 2.8 + t * 5.1 + phase);
  float crossRipple = cos(aV * 4.2 - t * 2.7 + phase) * 0.018;
  float offset = aV * ribbonWidth;
  float depth = clamp(
    0.5
      + sin(t * 4.4 + aV * 2.2 + phase) * 0.28
      + aLayer * 0.14,
    0.0,
    1.0
  );
  float x = centerX
    + normal.x * offset
    + tangent.x * fold * 0.018
    + normal.x * crossRipple;
  float y = centerY
    + normal.y * offset
    + tangent.y * fold * 0.018
    + normal.y * crossRipple;

  float perspective = 0.94 + depth * 0.1;
  vec2 perspectiveCenter = vec2(0.78, 0.5);
  x = perspectiveCenter.x + (x - perspectiveCenter.x) * perspective;
  y = perspectiveCenter.y + (y - perspectiveCenter.y) * perspective;

  float microJitter = (aSeed - 0.5) * (0.5 + depth * 0.7);
  x += microJitter / uViewport.x;
  y += microJitter * 0.6 / uViewport.y;
  float organicPhase = aSeed * 37.7 + aLayer * 4.9 + phase;
  x += sin(organicPhase + t * 19.0)
    * (0.002 + depth * 0.0022);
  y += cos(organicPhase * 1.3 + aV * 7.0) * 0.0035;

  vec2 pointerDelta = vec2(x, y) - uPointer;
  float pointerDistance = max(length(pointerDelta), 0.001);
  float pointerRadius = mix(0.08, 0.105, 1.0 - uCompact);
  vec2 pointerDirection = pointerDelta / pointerDistance;
  float rippleEnvelope = smoothstep(0.024, 0.05, pointerDistance)
    * (1.0 - smoothstep(0.07, pointerRadius, pointerDistance))
    * uHover;
  float rippleWave = sin(
    pointerDistance * 74.0 - uTime * 3.2 + uScroll * 5.0
  );
  float pointerMotion = clamp(uPointerSpeed, 0.0, 1.0);
  float rippleDisplacement = rippleWave
    * rippleEnvelope
    * (0.0015 + pointerMotion * 0.0007);
  x += pointerDirection.x * rippleDisplacement;
  y += pointerDirection.y * rippleDisplacement;
  float pointerInfluence = rippleEnvelope * (0.55 + rippleWave * 0.45);

  if (uCompact > 0.5) {
    x = 0.72 + (x - 0.72) * 0.78;
    y = 0.5 + (y - 0.5) * 1.04;
  }

  float journeyOpen = journey;
  float quietStart = mix(
    mix(0.39, 0.66, uCompact),
    mix(0.08, 0.58, uCompact),
    journeyOpen
  );
  float quietEnd = mix(
    mix(0.57, 0.83, uCompact),
    mix(0.3, 0.78, uCompact),
    journeyOpen
  );
  float quietFade = pow(smoothstep(quietStart, quietEnd, x), 1.7);
  float desktopHeaderProtection = smoothstep(
    0.58,
    0.76,
    x + smoothstep(0.52, 0.72, y) * 0.12
  );
  float desktopJourneyProtection = smoothstep(0.12, 0.34, x);
  float desktopCopyProtection = mix(
    desktopHeaderProtection,
    desktopJourneyProtection,
    journeyOpen
  );
  float compactRelease = smoothstep(0.72, 0.94, y);
  float compactJourneyShift = journeyOpen * 0.07;
  float compactCopyProtection = smoothstep(
    mix(0.94 - compactJourneyShift, 0.72, compactRelease),
    mix(1.03 - compactJourneyShift, 0.9, compactRelease),
    x
  );
  float journeyCopyX = smoothstep(0.34, 0.5, x)
    * (1.0 - smoothstep(0.92, 1.05, x));
  float journeyCopyUpper = smoothstep(0.13, 0.22, y)
    * (1.0 - smoothstep(0.4, 0.5, y));
  float journeyCopyLower = smoothstep(0.64, 0.73, y)
    * (1.0 - smoothstep(0.88, 0.97, y));
  float journeyCopyProtection = 1.0
    - journey
      * (1.0 - uCompact)
      * journeyCopyX
      * clamp(journeyCopyUpper + journeyCopyLower, 0.0, 1.0)
      * 1.0;
  float copyProtection = mix(
    desktopCopyProtection,
    compactCopyProtection,
    uCompact
  ) * journeyCopyProtection;
  float topFade = smoothstep(-0.04, 0.05, y);
  float bottomFade = 1.0 - smoothstep(0.94, 1.08, y);
  float endFade = smoothstep(0.0, 0.09, t) * (1.0 - smoothstep(0.91, 1.0, t));
  float bandFade = 0.58 + (1.0 - abs(aV)) * 0.42;
  float organicDensity = 0.72
    + (sin(aSeed * 29.3 + t * 11.0 + aV * 3.7 + phase) * 0.5 + 0.5)
      * 0.28;
  float visibility = quietFade
    * copyProtection
    * topFade
    * bottomFade
    * endFade
    * bandFade
    * organicDensity;
  float strength = visibility
    * (0.28 + depth * 0.72)
    * mix(1.0, 1.34, aRidge)
    * (1.0 + pointerInfluence * (0.04 + pointerMotion * 0.02));

  if (strength < 0.025) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 1.0;
    vColor = vec3(0.0);
    vAlpha = 0.0;
    vSparkle = 0.0;
    vHover = 0.0;
    return;
  }

  float lightAlpha = mix(0.18, 0.72, pow(clamp(strength, 0.0, 1.0), 0.82));
  float darkAlpha = mix(0.14, 0.8, pow(clamp(strength, 0.0, 1.0), 0.84));
  float alpha = mix(lightAlpha, darkAlpha, uDark);
  alpha *= mix(1.0, mix(1.04, 1.15, uDark), aSparkle);

  float pointSize = aSize * (0.72 + depth * 1.5) * mix(1.2, 1.0, uDark);
  pointSize *= mix(1.0, mix(1.4, 2.15, uDark), aSparkle);
  pointSize *= mix(1.0, 1.12, aRidge);
  pointSize *= 1.0 + pointerInfluence * (0.09 + pointerMotion * 0.03);

  gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
  gl_PointSize = clamp(pointSize * uDpr, 1.0, 13.0);
  vColor = paletteColor(aColor);
  vAlpha = alpha;
  vSparkle = max(
    aSparkle * mix(0.38, 1.0, uDark),
    pointerInfluence * (0.03 + pointerMotion * 0.03)
  );
  vHover = pointerInfluence;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;
varying float vSparkle;
varying float vHover;

void main() {
  vec2 point = (gl_PointCoord - vec2(0.5)) * 2.0;
  float distanceFromCenter = length(point);
  float core = 1.0 - smoothstep(0.34, 1.0, distanceFromCenter);
  float halo = 1.0 - smoothstep(0.08, 1.0, distanceFromCenter);
  float bloom = clamp(vSparkle * 0.74 + vHover * 0.07, 0.0, 0.82);
  float alpha = mix(core, halo, bloom) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

type ParticleGrid = {
  segments: number;
  bands: number;
  skipRate: number;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveParticleGrid(width: number): ParticleGrid {
  if (width < 720) return { segments: 82, bands: 42, skipRate: 0.1 };
  if (width < 1280) return { segments: 124, bands: 54, skipRate: 0.055 };
  return { segments: 162, bands: 64, skipRate: 0.04 };
}

function selectParticleColor(
  ribbon: number,
  u: number,
  v: number,
  ridge: boolean,
  roll: number
) {
  if (ridge) {
    if (roll > 0.74) return 4;
    return ribbon === 1 ? 2 : 0;
  }
  const colorFlow = Math.sin(u * 4.1 + v * 2.8 + ribbon * 1.7);
  if (colorFlow > 0.62 && roll > 0.58) return 3;
  if (colorFlow < -0.68 && roll > 0.68) return 4;
  if (ribbon === 2 && roll > 0.55) return 2;
  if (roll < 0.48) return 0;
  if (roll < 0.8) return 1;
  return 2;
}

function appendRibbonParticle(
  values: number[],
  ribbon: number,
  segment: number,
  band: number,
  grid: ParticleGrid,
  random: () => number
) {
  if (random() < grid.skipRate) return;

  const u = ((segment + random() - 0.5) / (grid.segments - 1)) * 2 - 1;
  const v = ((band + random() - 0.5) / (grid.bands - 1)) * 2 - 1;
  const edge = Math.abs(v) > 0.93;
  const memorySeam = Math.abs(((segment + ribbon * 7) % 31) - 15) > 14.35;
  const ridge = edge || memorySeam;
  const seed = random();
  const layer = random() * 2 - 1;
  const color = selectParticleColor(ribbon, u, v, ridge, random());
  const size = (0.62 + random() * 1.08) * (ridge ? 1.12 : 1);
  const sparkle = random() > (ridge ? 0.986 : 0.997);

  values.push(
    u,
    v,
    seed,
    layer,
    color,
    size,
    ribbon,
    ridge ? 1 : 0,
    sparkle ? 1 : 0
  );
}

function createParticleData(width: number) {
  const grid = resolveParticleGrid(width);
  const random = seededRandom(0x4d454d26);
  const values: number[] = [];

  for (let ribbon = 0; ribbon < RIBBON_COUNT; ribbon += 1) {
    for (let segment = 0; segment < grid.segments; segment += 1) {
      for (let band = 0; band < grid.bands; band += 1) {
        appendRibbonParticle(values, ribbon, segment, band, grid, random);
      }
    }
  }

  return new Float32Array(values);
}

const MEMORY_ATTRIBUTES = [
  "aU",
  "aV",
  "aSeed",
  "aLayer",
  "aColor",
  "aSize",
  "aRibbon",
  "aRidge",
  "aSparkle"
] as const;

const MEMORY_UNIFORMS = [
  "uTime",
  "uCompact",
  "uDpr",
  "uDark",
  "uScroll",
  "uHover",
  "uPointerSpeed",
  "uViewport",
  "uPointer",
  "uPalette0",
  "uPalette1",
  "uPalette2",
  "uPalette3",
  "uPalette4"
] as const;

function createMemoryBloomScene(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): ScrollParticleScene | null {
  const resources = createParticleProgram(gl, {
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    attributes: MEMORY_ATTRIBUTES,
    uniforms: MEMORY_UNIFORMS,
    stride: PARTICLE_STRIDE
  });
  if (!resources) return null;

  const { uniforms } = resources;
  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  let vertexCount = 0;
  let lastPointerX = 0.78;
  let lastPointerY = 0.42;
  let lastPointerTime = performance.now();
  const pointer = { x: 0.78, y: 0.42, hover: 0, speed: 0 };
  const pointerTarget = { x: 0.78, y: 0.42, hover: 0, speed: 0 };

  const onHoverCapabilityChange = () => {
    if (hoverQuery.matches) return;
    pointer.hover = 0;
    pointer.speed = 0;
    pointerTarget.hover = 0;
    pointerTarget.speed = 0;
  };
  hoverQuery.addEventListener("change", onHoverCapabilityChange);

  return {
    resize(width) {
      vertexCount = resources.uploadParticles(createParticleData(width));
    },
    draw(frame) {
      if (!vertexCount) return;

      const settle = frame.reducedMotion
        ? 1
        : 1 - Math.exp(-frame.frameDelta / 78);
      const hoverSettle = frame.reducedMotion
        ? 1
        : 1 - Math.exp(-frame.frameDelta / 58);
      pointer.x += (pointerTarget.x - pointer.x) * settle;
      pointer.y += (pointerTarget.y - pointer.y) * settle;
      pointer.hover += (pointerTarget.hover - pointer.hover) * hoverSettle;
      pointer.speed += (pointerTarget.speed - pointer.speed) * hoverSettle;
      pointerTarget.speed *= Math.pow(0.82, frame.frameDelta / TARGET_FRAME_MS);

      drawParticleFrame(
        gl,
        canvas,
        resources,
        frame,
        frame.dark ? DARK_PALETTE : LIGHT_PALETTE,
        pointer,
        vertexCount,
        () => {
          gl.uniform1f(
            uniforms.uHover,
            frame.reducedMotion ? 0 : pointer.hover
          );
          gl.uniform1f(
            uniforms.uPointerSpeed,
            frame.reducedMotion ? 0 : pointer.speed
          );
        }
      );
    },
    pointerMove(event) {
      if (!hoverQuery.matches) return;

      const rect = canvas.getBoundingClientRect();
      const nextX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const nextY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const now = performance.now();
      const elapsed = Math.max(8, now - lastPointerTime);
      const distance = Math.hypot(nextX - lastPointerX, nextY - lastPointerY);

      pointerTarget.x = nextX;
      pointerTarget.y = nextY;
      pointerTarget.hover =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
          ? 1
          : 0;
      pointerTarget.speed = clamp((distance / elapsed) * 90, 0, 2);
      lastPointerX = nextX;
      lastPointerY = nextY;
      lastPointerTime = now;
    },
    pointerLeave() {
      pointerTarget.hover = 0;
      pointerTarget.speed = 0;
    },
    resetMotion: onHoverCapabilityChange,
    destroy() {
      hoverQuery.removeEventListener("change", onHoverCapabilityChange);
      resources.destroy();
    }
  };
}

function mountRenderer(canvas: HTMLCanvasElement) {
  return mountScrollParticleRenderer(canvas, {
    rootSelector: ".gallery-showcase",
    reducedTime: 18,
    dprCap: (width) => (width < 720 ? 1 : 1.25),
    createScene: createMemoryBloomScene
  });
}

export default function MemoryBloomBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return deferRendererMount(() => mountRenderer(canvas));
  }, []);

  return <canvas ref={canvasRef} className="gallery-memory-bloom-canvas" />;
}
