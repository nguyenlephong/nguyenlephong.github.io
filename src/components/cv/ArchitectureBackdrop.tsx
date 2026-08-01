"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const PARTICLE_STRIDE = 9;
const TARGET_FRAME_MS = 1000 / 24;

const DARK_PALETTE = [
  [0.141, 0.769, 1],
  [0.392, 0.471, 1],
  [0.678, 0.439, 1],
  [1, 0.471, 0.392],
  [1, 0.816, 0.478]
] as const;

const LIGHT_PALETTE = [
  [0, 0.533, 0.812],
  [0.259, 0.345, 0.863],
  [0.506, 0.267, 0.78],
  [0.863, 0.333, 0.306],
  [0.663, 0.435, 0.075]
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
  float twist = theta * 0.5 + 0.72 + sin(theta * 2.2 - uTime * 0.12) * 0.13;
  float bandWidth = 0.9 + sin(theta * 3.05 + uTime * 0.15) * 0.13;
  float ripple = sin(theta * 3.4 + aBand * 5.2 + uTime * 0.21);
  float secondaryRipple = sin(theta * 1.75 - aBand * 3.4 - uTime * 0.14);
  float radius = 0.98 + aBand * bandWidth * cos(twist) + ripple * 0.09;

  float modelX = radius * cos(theta);
  float modelY = radius * sin(theta) * 0.92;
  float modelZ = aBand * bandWidth * sin(twist);

  modelX += cos(theta * 2.0 + 0.45) * 0.25
    + sin(theta * 3.0 - 0.2) * 0.08
    + secondaryRipple * 0.065;
  modelY += sin(theta * 2.0 - 0.62) * 0.21
    + cos(theta * 3.0 + 0.35) * 0.09
    + ripple * 0.045;
  modelZ += secondaryRipple * 0.2 + sin(theta * 2.0 + aBand * 1.8) * 0.1;

  float thickness = aLayer * (0.026 + abs(aBand) * 0.018);
  modelX += cos(theta) * thickness;
  modelY += sin(theta) * thickness;
  modelZ += aLayer * 0.055;

  float rotateY = -0.57 + sin(uTime * 0.07) * 0.025;
  float cosY = cos(rotateY);
  float sinY = sin(rotateY);
  float rotatedX = modelX * cosY + modelZ * sinY;
  float rotatedZ = -modelX * sinY + modelZ * cosY;

  float rotateX = 0.46;
  float cosX = cos(rotateX);
  float sinX = sin(rotateX);
  float rotatedY = modelY * cosX - rotatedZ * sinX;
  float depthZ = modelY * sinX + rotatedZ * cosX;

  float rotateZ = -0.22;
  float cosZ = cos(rotateZ);
  float sinZ = sin(rotateZ);
  float screenX = rotatedX * cosZ - rotatedY * sinZ;
  float screenY = rotatedX * sinZ + rotatedY * cosZ;
  float depth = clamp((depthZ + 1.35) / 2.7, 0.0, 1.0);
  float perspective = 0.82 + depth * 0.28;
  float pointerDepth = 4.0 + depth * 12.0;
  float microJitter = (aSeed - 0.5) * (0.42 + depth * 0.72);

  float centerX = mix(0.72, 1.08, uCompact);
  float centerY = 0.43;
  float x = centerX
    + screenX * mix(0.365, 0.43, uCompact) * perspective
    + microJitter / uViewport.x
    + uPointer.x * pointerDepth / uViewport.x;
  float y = centerY
    + screenY * mix(0.41, 0.51, uCompact) * perspective
    + microJitter * 0.48 / uViewport.y
    + uPointer.y * pointerDepth * 0.55 / uViewport.y;

  if (aFold > 0.5) {
    float foldX = 0.45 + aSeed * 0.12;
    float foldY = 0.5 + aSeed * 0.12;
    x = centerX
      + (x - centerX) * foldX
      + sin(aTheta * 2.2 + uTime * 0.08) * 0.018;
    y = centerY
      + (y - centerY) * foldY
      + cos(aTheta * 3.1 - uTime * 0.06) * 0.018;
  }

  float quietFade = pow(
    smoothstep(mix(0.38, 0.68, uCompact), mix(0.6, 0.9, uCompact), x),
    2.0
  );
  float topFade = smoothstep(-0.08, 0.04, y);
  float bottomFade = 1.0 - smoothstep(0.94, 1.08, y);
  float edgeFade = smoothstep(-0.04, 0.08, x) * (1.0 - smoothstep(0.98, 1.08, x));
  float topologyFade = 0.72 + abs(aBand) * 0.16 + pow(sin(theta * 1.5), 2.0) * 0.12;
  float visibility = quietFade * topFade * bottomFade * edgeFade * topologyFade;
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
  float lightAlpha = mix(0.14, 0.62, pow(clamp(strength, 0.0, 1.0), 0.9));
  float alpha = mix(lightAlpha, darkAlpha, uDark);
  alpha *= mix(1.0, 0.34, aFold);
  alpha *= mix(1.0, 1.16, aSparkle);

  float pointSize = aSize * (0.7 + depth * 1.38) * mix(0.92, 1.0, uDark);
  pointSize *= mix(1.0, 0.42, aFold);
  pointSize *= mix(1.0, 2.25, aSparkle);

  gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
  gl_PointSize = clamp(pointSize * uDpr, 1.0, 14.0);
  vColor = paletteColor(aColor);
  vAlpha = alpha;
  vSparkle = aSparkle;
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

function createParticleData(width: number) {
  const compact = width < 720;
  const rings = compact ? 92 : width < 1280 ? 136 : 180;
  const bands = compact ? 96 : width < 1280 ? 132 : 160;
  const random = seededRandom(0x1a1f2026);
  const values: number[] = [];

  for (let ring = 0; ring < rings; ring += 1) {
    for (let strip = 0; strip < bands; strip += 1) {
      if (random() < (compact ? 0.075 : 0.02)) continue;

      const theta = ((ring + random() - 0.5) / rings) * TAU;
      const band = ((strip + random() - 0.5) / (bands - 1)) * 2 - 1;
      const edge = Math.abs(band);
      const ridgePosition = Math.sin(theta * 1.7 + 0.45) * 0.42;
      const ridge = Math.abs(band - ridgePosition) < 0.045 || edge > 0.965;
      const colorBand = Math.sin(theta * 2.35 + band * 3.1 + random() * 0.36);
      const colorRoll = random();
      const color = ridge
        ? Math.sin(theta * 2.1 - 0.3) > 0.25
          ? 0
          : colorRoll > 0.58
            ? 3
            : 2
        : colorBand > 0.38
          ? colorRoll > 0.3
            ? 3
            : 4
          : colorBand < -0.7
            ? colorRoll > 0.84
              ? 4
              : 2
            : edge > 0.78 && colorRoll < 0.72
              ? 0
              : colorRoll < 0.5
                ? 0
                : colorRoll < 0.82
                  ? 1
                  : 2;
      const seed = random();
      const layer = random() * 2 - 1;
      const size = (0.62 + random() * 1.02) * (ridge ? 1.18 : 1);
      const fold = random() > 0.5;
      const sparkle = random() > (ridge ? 0.985 : 0.996);

      values.push(
        theta,
        band,
        seed,
        layer,
        color,
        size,
        ridge ? 1 : 0,
        0,
        sparkle ? 1 : 0
      );

      if (fold) {
        values.push(theta, band, seed, layer, color, size, ridge ? 1 : 0, 1, 0);
      }
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
  const uniforms = {
    time: getUniform(gl, program, "uTime"),
    compact: getUniform(gl, program, "uCompact"),
    dpr: getUniform(gl, program, "uDpr"),
    dark: getUniform(gl, program, "uDark"),
    viewport: getUniform(gl, program, "uViewport"),
    pointer: getUniform(gl, program, "uPointer"),
    palettes: paletteLocations
  } as UniformLocations;

  if (
    attributeLocations.some((location) => location < 0) ||
    Object.values(uniforms).some((location) => location === null) ||
    paletteLocations.some((location) => location === null)
  ) {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    return () => undefined;
  }

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
  let visible = true;
  let reducedMotion = motionQuery.matches;
  let destroyed = false;
  let contextLost = false;
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

  const draw = (now: number) => {
    if (!width || !height || !vertexCount || contextLost) return;

    const dark = isDark();
    const elapsed = reducedMotion ? 12.5 : now / 1000;
    pointer.x += (pointerTarget.x - pointer.x) * 0.08;
    pointer.y += (pointerTarget.y - pointer.y) * 0.08;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.compact, width < 720 ? 1 : 0);
    gl.uniform1f(uniforms.dpr, dpr);
    gl.uniform1f(uniforms.dark, dark ? 1 : 0);
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
      !visible ||
      contextLost ||
      frame ||
      frameTimer
    ) {
      return;
    }

    frameTimer = window.setTimeout(() => {
      frameTimer = 0;
      if (destroyed || reducedMotion || !visible || contextLost) return;
      frame = window.requestAnimationFrame(renderFrame);
    }, TARGET_FRAME_MS);
  };

  const renderFrame = (now: number) => {
    frame = 0;
    draw(now);
    queueFrame();
  };

  const resize = () => {
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
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    cancelFrame();
  };
  const resizeObserver = new ResizeObserver(resize);
  const themeObserver = new MutationObserver(onThemeChange);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (!visible) cancelFrame();
    if (visible) {
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
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
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
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener(
      "pointerleave",
      onPointerLeave
    );
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
    <canvas ref={canvasRef} className="ai-particle-field" aria-hidden="true" />
  );
}
