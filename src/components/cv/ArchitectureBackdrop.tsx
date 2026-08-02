"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const PARTICLE_STRIDE = 9;
const TARGET_FRAME_MS = 1000 / 24;
const ACTIVE_SCROLL_MS = 180;

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

type UniformLocations = {
  time: WebGLUniformLocation;
  compact: WebGLUniformLocation;
  dpr: WebGLUniformLocation;
  dark: WebGLUniformLocation;
  scroll: WebGLUniformLocation;
  viewport: WebGLUniformLocation;
  pointer: WebGLUniformLocation;
  palettes: WebGLUniformLocation[];
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

  pushParticle(values, theta, band, seed, layer, color, size, ridge, 0, sparkle);
  if (fold) pushParticle(values, theta, band, seed, layer, color, size, ridge, 1, false);
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

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return null;

  gl.shaderSource(vertexShader, VERTEX_SHADER);
  gl.shaderSource(fragmentShader, FRAGMENT_SHADER);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function getUniform(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string
) {
  return gl.getUniformLocation(program, name);
}

function mountRenderer(canvas: HTMLCanvasElement) {
  const homeRoot = canvas.closest<HTMLElement>(".home-showcase");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power"
  });
  if (!gl) return () => undefined;

  const program = createProgram(gl);
  const buffer = gl.createBuffer();
  if (!program || !buffer) {
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    return () => undefined;
  }

  const attributeNames = [
    "aTheta",
    "aBand",
    "aSeed",
    "aLayer",
    "aColor",
    "aSize",
    "aRidge",
    "aFold",
    "aSparkle"
  ];
  const attributeLocations = attributeNames.map((name) =>
    gl.getAttribLocation(program, name)
  );
  const paletteLocations = [0, 1, 2, 3, 4].map((index) =>
    getUniform(gl, program, `uPalette${index}`)
  );
  const uniformCandidates = {
    time: getUniform(gl, program, "uTime"),
    compact: getUniform(gl, program, "uCompact"),
    dpr: getUniform(gl, program, "uDpr"),
    dark: getUniform(gl, program, "uDark"),
    scroll: getUniform(gl, program, "uScroll"),
    viewport: getUniform(gl, program, "uViewport"),
    pointer: getUniform(gl, program, "uPointer")
  };

  if (
    attributeLocations.includes(-1) ||
    Object.values(uniformCandidates).includes(null) ||
    paletteLocations.includes(null)
  ) {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    return () => undefined;
  }

  const uniforms = {
    ...uniformCandidates,
    palettes: paletteLocations
  } as UniformLocations;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = PARTICLE_STRIDE * Float32Array.BYTES_PER_ELEMENT;
  attributeLocations.forEach((location, index) => {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location,
      1,
      gl.FLOAT,
      false,
      stride,
      index * Float32Array.BYTES_PER_ELEMENT
    );
  });
  gl.clearColor(0, 0, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let vertexCount = 0;
  let frame = 0;
  let frameTimer = 0;
  let inViewport = true;
  let pageVisible = !document.hidden;
  let reducedMotion = motionQuery.matches;
  let destroyed = false;
  let contextLost = false;
  let scrollProgress = 0;
  let scrollActiveUntil = 0;
  let lastDrawTime = performance.now();
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };

  const isDark = () => {
    const theme = document.documentElement.dataset["theme"];
    return theme ? theme === "dark" : systemThemeQuery.matches;
  };

  const uploadPalette = (
    palette: typeof DARK_PALETTE | typeof LIGHT_PALETTE
  ) => {
    palette.forEach((color, index) => {
      gl.uniform3f(uniforms.palettes[index], color[0], color[1], color[2]);
    });
  };

  const updateScrollTarget = () => {
    if (!homeRoot) return;

    const rect = homeRoot.getBoundingClientRect();
    const journeyHeight = Math.max(homeRoot.scrollHeight, homeRoot.offsetHeight);
    const scrollableHeight = Math.max(1, journeyHeight - window.innerHeight);
    const nextProgress = Math.min(
      1,
      Math.max(0, -rect.top / scrollableHeight)
    );
    scrollProgress = nextProgress;
  };

  const draw = (now: number) => {
    if (!width || !height || !vertexCount || contextLost) return;

    const dark = isDark();
    const elapsed = reducedMotion ? 12.5 : now / 1000;
    const frameDelta = Math.min(100, Math.max(0, now - lastDrawTime));
    const settle = reducedMotion ? 1 : 1 - Math.exp(-frameDelta / 78);
    lastDrawTime = now;
    pointer.x += (pointerTarget.x - pointer.x) * settle;
    pointer.y += (pointerTarget.y - pointer.y) * settle;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.compact, width < 720 ? 1 : 0);
    gl.uniform1f(uniforms.dpr, dpr);
    gl.uniform1f(uniforms.dark, dark ? 1 : 0);
    gl.uniform1f(uniforms.scroll, scrollProgress);
    gl.uniform2f(uniforms.viewport, width, height);
    gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
    uploadPalette(dark ? DARK_PALETTE : LIGHT_PALETTE);
    gl.blendFunc(gl.SRC_ALPHA, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.POINTS, 0, vertexCount);
  };

  const cancelFrame = () => {
    if (frame) window.cancelAnimationFrame(frame);
    if (frameTimer) window.clearTimeout(frameTimer);
    frame = 0;
    frameTimer = 0;
  };

  const queueFrame = () => {
    if (
      destroyed ||
      reducedMotion ||
      !inViewport ||
      !pageVisible ||
      contextLost ||
      frame ||
      frameTimer
    ) {
      return;
    }

    const frameDelay =
      performance.now() < scrollActiveUntil ? 0 : TARGET_FRAME_MS;
    frameTimer = window.setTimeout(() => {
      frameTimer = 0;
      if (
        destroyed ||
        reducedMotion ||
        !inViewport ||
        !pageVisible ||
        contextLost
      ) {
        return;
      }
      frame = window.requestAnimationFrame(renderFrame);
    }, frameDelay);
  };

  const renderFrame = (now: number) => {
    frame = 0;
    draw(now);
    queueFrame();
  };

  const resize = () => {
    updateScrollTarget();
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const dprCap = nextWidth < 720 ? 1.25 : 1.5;
    const nextDpr = Math.min(window.devicePixelRatio || 1, dprCap);
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const particleData = createParticleData(width);
    vertexCount = particleData.length / PARTICLE_STRIDE;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW);
    draw(performance.now());
    queueFrame();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (reducedMotion) return;
    pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };

  const onPointerLeave = () => {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  };

  const onScroll = () => {
    updateScrollTarget();
    scrollActiveUntil = performance.now() + ACTIVE_SCROLL_MS;
    if (reducedMotion) {
      draw(performance.now());
      return;
    }
    if (frameTimer) {
      window.clearTimeout(frameTimer);
      frameTimer = 0;
    }
    if (!frame && inViewport && pageVisible && !contextLost) {
      frame = window.requestAnimationFrame(renderFrame);
    }
  };

  const onMotionChange = () => {
    reducedMotion = motionQuery.matches;
    cancelFrame();
    pointer.x = 0;
    pointer.y = 0;
    pointerTarget.x = 0;
    pointerTarget.y = 0;
    draw(performance.now());
    queueFrame();
  };

  const onThemeChange = () => draw(performance.now());
  const onVisibilityChange = () => {
    pageVisible = !document.hidden;
    if (!pageVisible) cancelFrame();
    if (pageVisible) {
      draw(performance.now());
      queueFrame();
    }
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    cancelFrame();
  };
  const resizeObserver = new ResizeObserver(resize);
  const themeObserver = new MutationObserver(onThemeChange);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry?.isIntersecting ?? true;
    if (!inViewport) cancelFrame();
    if (inViewport) {
      draw(performance.now());
      queueFrame();
    }
  });

  resizeObserver.observe(canvas);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
  intersectionObserver.observe(canvas);
  motionQuery.addEventListener("change", onMotionChange);
  systemThemeQuery.addEventListener("change", onThemeChange);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);
  canvas.addEventListener("webglcontextlost", onContextLost);
  resize();
  queueFrame();

  return () => {
    destroyed = true;
    cancelFrame();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    intersectionObserver.disconnect();
    motionQuery.removeEventListener("change", onMotionChange);
    systemThemeQuery.removeEventListener("change", onThemeChange);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener(
      "pointerleave",
      onPointerLeave
    );
    document.removeEventListener("visibilitychange", onVisibilityChange);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
}

export default function ArchitectureBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const idleApi = window as unknown as {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let destroyed = false;
    let cleanupRenderer: () => void = () => undefined;
    let fallbackTimer = 0;
    let idleCallback = 0;
    const start = () => {
      if (!destroyed) cleanupRenderer = mountRenderer(canvas);
    };

    if (idleApi.requestIdleCallback) {
      idleCallback = idleApi.requestIdleCallback(start, { timeout: 700 });
    } else {
      fallbackTimer = window.setTimeout(start, 160);
    }

    return () => {
      destroyed = true;
      if (idleCallback) idleApi.cancelIdleCallback?.(idleCallback);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      cleanupRenderer();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="ai-particle-field" role="presentation" />
  );
}
