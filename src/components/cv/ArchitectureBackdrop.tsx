"use client";

import { useEffect, useRef } from "react";
import {
  createParticleProgram,
  deferRendererMount,
  drawParticleFrame,
  mountScrollParticleRenderer,
  type ScrollParticleScene
} from "@/components/webgl/ScrollParticleRenderer";

const TAU = Math.PI * 2;
const PARTICLE_STRIDE = 9;

const DARK_PALETTE = [
  [0.141, 0.769, 1],
  [0.392, 0.471, 1],
  [0.678, 0.439, 1],
  [1, 0.471, 0.392],
  [1, 0.816, 0.478]
] as const;

const LIGHT_PALETTE = [
  [0.035, 0.369, 0.718],
  [0.184, 0.302, 0.69],
  [0.337, 0.247, 0.635],
  [0.106, 0.42, 0.545],
  [0.282, 0.373, 0.51]
] as const;

const VERTEX_SHADER = `
precision highp float;

attribute float aTheta;
attribute float aBand;
attribute float aSeed;
attribute float aLayer;
attribute float aColor;
attribute float aSize;
attribute float aRidge;
attribute float aFold;
attribute float aSparkle;

uniform float uTime;
uniform float uCompact;
uniform float uDpr;
uniform float uDark;
uniform float uScroll;
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

vec3 paletteColor(float index) {
  if (index < 0.5) return uPalette0;
  if (index < 1.5) return uPalette1;
  if (index < 2.5) return uPalette2;
  if (index < 3.5) return uPalette3;
  return uPalette4;
}

void main() {
  float theta = aTheta;
  float scrollPhase = uScroll * 6.28318530718;
  float scrollTravel = smoothstep(0.015, 0.985, uScroll);
  float twist = theta * 0.5
    + 0.72
    + scrollPhase * 0.36
    + sin(theta * 2.2 + scrollPhase * 0.82 - uTime * 0.12) * 0.13;
  float bandWidth = 0.9
    + sin(theta * 3.05 + scrollPhase * 0.58 + uTime * 0.15) * 0.13;
  float ripple = sin(
    theta * 3.4 + aBand * 5.2 + scrollPhase * 1.08 + uTime * 0.21
  );
  float secondaryRipple = sin(
    theta * 1.75 - aBand * 3.4 - scrollPhase * 0.76 - uTime * 0.14
  );
  float radius = 0.98 + aBand * bandWidth * cos(twist) + ripple * 0.09;

  float modelX = radius * cos(theta);
  float modelY = radius * sin(theta) * 0.92;
  float modelZ = aBand * bandWidth * sin(twist);

  modelX += cos(theta * 2.0 + 0.45) * 0.25
    + sin(theta * 3.0 - 0.2) * 0.08
    + secondaryRipple * 0.065;
  modelY += sin(theta * 2.0 - 0.62) * 0.21
    + cos(theta * 3.0 + 0.35) * 0.09
    + ripple * 0.045
    + sin(scrollPhase * 0.74 + theta * 0.68) * 0.075 * scrollTravel;
  modelZ += secondaryRipple * 0.2
    + sin(theta * 2.0 + aBand * 1.8 + scrollPhase * 0.42) * 0.1;

  float thickness = aLayer * (0.026 + abs(aBand) * 0.018);
  modelX += cos(theta) * thickness;
  modelY += sin(theta) * thickness;
  modelZ += aLayer * 0.055;

  float rotateY = -0.57
    + sin(uTime * 0.07) * 0.025
    + sin(scrollPhase * 0.72) * 0.22 * scrollTravel;
  float cosY = cos(rotateY);
  float sinY = sin(rotateY);
  float rotatedX = modelX * cosY + modelZ * sinY;
  float rotatedZ = -modelX * sinY + modelZ * cosY;

  float rotateX = 0.46
    + (cos(scrollPhase * 0.54) - 1.0) * 0.11 * scrollTravel;
  float cosX = cos(rotateX);
  float sinX = sin(rotateX);
  float rotatedY = modelY * cosX - rotatedZ * sinX;
  float depthZ = modelY * sinX + rotatedZ * cosX;

  float rotateZ = -0.22
    + sin(scrollPhase * 0.43) * 0.09 * scrollTravel;
  float cosZ = cos(rotateZ);
  float sinZ = sin(rotateZ);
  float screenX = rotatedX * cosZ - rotatedY * sinZ;
  float screenY = rotatedX * sinZ + rotatedY * cosZ;
  float depth = clamp((depthZ + 1.35) / 2.7, 0.0, 1.0);
  float perspective = 0.82 + depth * 0.28;
  float pointerDepth = 4.0 + depth * 12.0;
  float microJitter = (aSeed - 0.5) * (0.42 + depth * 0.72);

  float centerDrift = sin(scrollPhase * 0.92) * mix(0.075, 0.035, uCompact);
  float verticalDrift = sin(scrollPhase * 0.78 + 0.24) * 0.11;
  float scalePulse = 1.0 + sin(scrollPhase * 0.61) * 0.085 * scrollTravel;
  float contentShift = mix(0.105, 0.035, uCompact) * scrollTravel;
  float centerX = mix(0.72, 1.08, uCompact)
    + centerDrift * scrollTravel
    + contentShift;
  float centerY = 0.43 + verticalDrift * scrollTravel;
  float x = centerX
    + screenX * mix(0.365, 0.43, uCompact) * perspective * scalePulse
    + microJitter / uViewport.x
    + uPointer.x * pointerDepth / uViewport.x;
  float y = centerY
    + screenY * mix(0.41, 0.51, uCompact) * perspective * scalePulse
    + microJitter * 0.48 / uViewport.y
    + uPointer.y * pointerDepth * 0.55 / uViewport.y;

  if (aFold > 0.5) {
    float foldBreath = sin(scrollPhase * 0.83 + aSeed * 2.4) * 0.08 * scrollTravel;
    float foldX = 0.45 + aSeed * 0.12 + foldBreath;
    float foldY = 0.5 + aSeed * 0.12 - foldBreath * 0.7;
    x = centerX
      + (x - centerX) * foldX
      + sin(aTheta * 2.2 + scrollPhase * 0.46 + uTime * 0.08) * 0.018;
    y = centerY
      + (y - centerY) * foldY
      + cos(aTheta * 3.1 - scrollPhase * 0.38 - uTime * 0.06) * 0.018;
  }

  float quietStart = mix(
    mix(0.43, 0.7, uCompact),
    mix(0.38, 0.68, uCompact),
    uDark
  );
  float quietEnd = mix(
    mix(0.65, 0.93, uCompact),
    mix(0.6, 0.9, uCompact),
    uDark
  );
  float contentQuiet = mix(0.08, 0.025, uCompact) * scrollTravel;
  quietStart += contentQuiet;
  quietEnd += contentQuiet;
  float quietFade = pow(
    smoothstep(quietStart, quietEnd, x),
    mix(2.35, 2.0, uDark)
  );
  float topFade = smoothstep(-0.08, 0.04, y);
  float bottomFade = 1.0 - smoothstep(0.94, 1.08, y);
  float edgeFade = smoothstep(-0.04, 0.08, x) * (1.0 - smoothstep(0.98, 1.08, x));
  float topologyFade = 0.72 + abs(aBand) * 0.16 + pow(sin(theta * 1.5), 2.0) * 0.12;
  float journeyDensity = 0.88 + cos(scrollPhase * 0.7) * 0.12;
  float visibility = quietFade
    * topFade
    * bottomFade
    * edgeFade
    * topologyFade
    * journeyDensity;
  float strength = visibility * (0.2 + depth * 0.8) * mix(1.0, 1.32, aRidge);

  if (strength < 0.035) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 1.0;
    vColor = vec3(0.0);
    vAlpha = 0.0;
    vSparkle = 0.0;
    return;
  }

  float darkAlpha = mix(0.14, 0.78, pow(clamp(strength, 0.0, 1.0), 0.85));
  float lightAlpha = mix(0.2, 0.68, pow(clamp(strength, 0.0, 1.0), 0.86));
  float alpha = mix(lightAlpha, darkAlpha, uDark);
  float contentAlpha = mix(0.82, 0.68, uDark);
  alpha *= mix(
    1.0,
    contentAlpha,
    smoothstep(0.12, 0.3, uScroll)
  );
  float foldAlpha = mix(0.18, 0.34, uDark);
  float sparkleAlpha = mix(1.02, 1.16, uDark);
  alpha *= mix(1.0, foldAlpha, aFold);
  alpha *= mix(1.0, sparkleAlpha, aSparkle);

  float pointSize = aSize * (0.7 + depth * 1.38) * mix(1.2, 1.0, uDark);
  float foldScale = mix(0.32, 0.42, uDark);
  float sparkleScale = mix(1.35, 2.25, uDark);
  pointSize *= mix(1.0, foldScale, aFold);
  pointSize *= mix(1.0, sparkleScale, aSparkle);

  gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
  gl_PointSize = clamp(pointSize * uDpr, 1.0, 14.0);
  vColor = paletteColor(aColor);
  vAlpha = alpha;
  vSparkle = aSparkle * mix(0.35, 1.0, uDark);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;
varying float vSparkle;

void main() {
  vec2 point = (gl_PointCoord - vec2(0.5)) * 2.0;
  float distanceFromCenter = length(point);
  float core = 1.0 - smoothstep(0.36, 1.0, distanceFromCenter);
  float halo = 1.0 - smoothstep(0.08, 1.0, distanceFromCenter);
  float alpha = mix(core, halo, vSparkle * 0.72) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

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

type ParticleGrid = {
  rings: number;
  bands: number;
  skipRate: number;
};

function resolveParticleGrid(width: number): ParticleGrid {
  if (width < 720) return { rings: 92, bands: 96, skipRate: 0.075 };
  if (width < 1280) return { rings: 136, bands: 132, skipRate: 0.02 };
  return { rings: 180, bands: 160, skipRate: 0.02 };
}

function selectParticleColor(
  theta: number,
  edge: number,
  ridge: boolean,
  colorBand: number,
  colorRoll: number
) {
  if (ridge) {
    if (Math.sin(theta * 2.1 - 0.3) > 0.25) return 0;
    if (colorRoll > 0.58) return 3;
    return 2;
  }
  if (colorBand > 0.38) {
    if (colorRoll > 0.3) return 3;
    return 4;
  }
  if (colorBand < -0.7) {
    if (colorRoll > 0.84) return 4;
    return 2;
  }
  if (edge > 0.78 && colorRoll < 0.72) return 0;
  if (colorRoll < 0.5) return 0;
  if (colorRoll < 0.82) return 1;
  return 2;
}

function pushParticle(
  values: number[],
  theta: number,
  band: number,
  seed: number,
  layer: number,
  color: number,
  size: number,
  ridge: boolean,
  fold: number,
  sparkle: boolean
) {
  values.push(
    theta,
    band,
    seed,
    layer,
    color,
    size,
    ridge ? 1 : 0,
    fold,
    sparkle ? 1 : 0
  );
}

function appendParticlePair(
  values: number[],
  ring: number,
  strip: number,
  grid: ParticleGrid,
  random: () => number
) {
  if (random() < grid.skipRate) return;

  const theta = ((ring + random() - 0.5) / grid.rings) * TAU;
  const band = ((strip + random() - 0.5) / (grid.bands - 1)) * 2 - 1;
  const edge = Math.abs(band);
  const ridgePosition = Math.sin(theta * 1.7 + 0.45) * 0.42;
  const ridge = Math.abs(band - ridgePosition) < 0.045 || edge > 0.965;
  const colorBand = Math.sin(theta * 2.35 + band * 3.1 + random() * 0.36);
  const color = selectParticleColor(theta, edge, ridge, colorBand, random());
  const seed = random();
  const layer = random() * 2 - 1;
  const ridgeScale = ridge ? 1.18 : 1;
  const size = (0.62 + random() * 1.02) * ridgeScale;
  const fold = random() > 0.5;
  const sparkleThreshold = ridge ? 0.985 : 0.996;
  const sparkle = random() > sparkleThreshold;

  pushParticle(
    values,
    theta,
    band,
    seed,
    layer,
    color,
    size,
    ridge,
    0,
    sparkle
  );
  if (fold)
    pushParticle(
      values,
      theta,
      band,
      seed,
      layer,
      color,
      size,
      ridge,
      1,
      false
    );
}

function createParticleData(width: number) {
  const grid = resolveParticleGrid(width);
  const random = seededRandom(0x1a1f2026);
  const values: number[] = [];

  for (let ring = 0; ring < grid.rings; ring += 1) {
    for (let strip = 0; strip < grid.bands; strip += 1) {
      appendParticlePair(values, ring, strip, grid, random);
    }
  }

  return new Float32Array(values);
}

const ARCHITECTURE_ATTRIBUTES = [
  "aTheta",
  "aBand",
  "aSeed",
  "aLayer",
  "aColor",
  "aSize",
  "aRidge",
  "aFold",
  "aSparkle"
] as const;

const ARCHITECTURE_UNIFORMS = [
  "uTime",
  "uCompact",
  "uDpr",
  "uDark",
  "uScroll",
  "uViewport",
  "uPointer",
  "uPalette0",
  "uPalette1",
  "uPalette2",
  "uPalette3",
  "uPalette4"
] as const;

function createArchitectureScene(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): ScrollParticleScene | null {
  const resources = createParticleProgram(gl, {
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    attributes: ARCHITECTURE_ATTRIBUTES,
    uniforms: ARCHITECTURE_UNIFORMS,
    stride: PARTICLE_STRIDE
  });
  if (!resources) return null;

  let vertexCount = 0;
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };

  return {
    resize(width) {
      vertexCount = resources.uploadParticles(createParticleData(width));
    },
    draw(frame) {
      if (!vertexCount) return;

      const settle = frame.reducedMotion
        ? 1
        : 1 - Math.exp(-frame.frameDelta / 78);
      pointer.x += (pointerTarget.x - pointer.x) * settle;
      pointer.y += (pointerTarget.y - pointer.y) * settle;
      drawParticleFrame(
        gl,
        canvas,
        resources,
        frame,
        frame.dark ? DARK_PALETTE : LIGHT_PALETTE,
        pointer,
        vertexCount
      );
    },
    pointerMove(event) {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    pointerLeave() {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    },
    resetMotion() {
      pointer.x = 0;
      pointer.y = 0;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    },
    destroy: resources.destroy
  };
}

function mountRenderer(canvas: HTMLCanvasElement) {
  return mountScrollParticleRenderer(canvas, {
    rootSelector: ".home-showcase",
    reducedTime: 12.5,
    dprCap: (width) => (width < 720 ? 1.25 : 1.5),
    createScene: createArchitectureScene
  });
}

export default function ArchitectureBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return deferRendererMount(() => mountRenderer(canvas));
  }, []);

  return <canvas ref={canvasRef} className="ai-particle-field" />;
}
