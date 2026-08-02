export const TARGET_FRAME_MS = 1000 / 24;
export const ACTIVE_SCROLL_MS = 180;

export type ParticleFrame = {
  now: number;
  elapsed: number;
  frameDelta: number;
  width: number;
  height: number;
  dpr: number;
  dark: boolean;
  reducedMotion: boolean;
  scrollProgress: number;
};

export type ParticlePalette = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number]
];

export type ScrollParticleScene = {
  resize: (width: number, height: number, dpr: number) => void;
  draw: (frame: ParticleFrame) => void;
  pointerMove?: (event: PointerEvent) => void;
  pointerLeave?: () => void;
  resetMotion?: () => void;
  destroy: () => void;
};

type RendererOptions = {
  rootSelector: string;
  reducedTime: number;
  dprCap: (width: number) => number;
  createScene: (
    gl: WebGLRenderingContext,
    canvas: HTMLCanvasElement
  ) => ScrollParticleScene | null;
};

type ProgramOptions<UniformName extends string> = {
  vertexShader: string;
  fragmentShader: string;
  attributes: readonly string[];
  uniforms: readonly UniformName[];
  stride: number;
};

export type ParticleProgram<UniformName extends string> = {
  program: WebGLProgram;
  uniforms: Record<UniformName, WebGLUniformLocation>;
  uploadParticles: (data: Float32Array) => number;
  destroy: () => void;
};

type FrameUniformName =
  | "uTime"
  | "uCompact"
  | "uDpr"
  | "uDark"
  | "uScroll"
  | "uViewport"
  | "uPointer"
  | "uPalette0"
  | "uPalette1"
  | "uPalette2"
  | "uPalette3"
  | "uPalette4";

type FrameProgram = {
  program: WebGLProgram;
  uniforms: Record<FrameUniformName, WebGLUniformLocation>;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createParticleProgram<const UniformName extends string>(
  gl: WebGLRenderingContext,
  options: ProgramOptions<UniformName>
): ParticleProgram<UniformName> | null {
  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    options.vertexShader
  );
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    options.fragmentShader
  );
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) {
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
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
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    return null;
  }

  const attributeLocations = options.attributes.map((name) =>
    gl.getAttribLocation(program, name)
  );
  const uniformEntries = options.uniforms.map(
    (name) => [name, gl.getUniformLocation(program, name)] as const
  );
  if (
    attributeLocations.includes(-1) ||
    uniformEntries.some(([, location]) => location === null)
  ) {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const strideBytes = options.stride * Float32Array.BYTES_PER_ELEMENT;
  attributeLocations.forEach((location, index) => {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location,
      1,
      gl.FLOAT,
      false,
      strideBytes,
      index * Float32Array.BYTES_PER_ELEMENT
    );
  });
  gl.clearColor(0, 0, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);

  const uniforms = Object.fromEntries(uniformEntries) as Record<
    UniformName,
    WebGLUniformLocation
  >;

  return {
    program,
    uniforms,
    uploadParticles(data) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return data.length / options.stride;
    },
    destroy() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    }
  };
}

export function drawParticleFrame(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  resources: FrameProgram,
  frame: ParticleFrame,
  palette: ParticlePalette,
  pointer: Readonly<{ x: number; y: number }>,
  vertexCount: number,
  customize?: () => void
) {
  const { uniforms } = resources;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(resources.program);
  gl.uniform1f(uniforms.uTime, frame.elapsed);
  gl.uniform1f(uniforms.uCompact, frame.width < 720 ? 1 : 0);
  gl.uniform1f(uniforms.uDpr, frame.dpr);
  gl.uniform1f(uniforms.uDark, frame.dark ? 1 : 0);
  gl.uniform1f(uniforms.uScroll, frame.scrollProgress);
  gl.uniform2f(uniforms.uViewport, frame.width, frame.height);
  gl.uniform2f(uniforms.uPointer, pointer.x, pointer.y);
  customize?.();

  gl.uniform3fv(uniforms.uPalette0, palette[0]);
  gl.uniform3fv(uniforms.uPalette1, palette[1]);
  gl.uniform3fv(uniforms.uPalette2, palette[2]);
  gl.uniform3fv(uniforms.uPalette3, palette[3]);
  gl.uniform3fv(uniforms.uPalette4, palette[4]);
  gl.blendFunc(gl.SRC_ALPHA, frame.dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.POINTS, 0, vertexCount);
}

export function mountScrollParticleRenderer(
  canvas: HTMLCanvasElement,
  options: RendererOptions
) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power"
  });
  if (!gl) return () => undefined;

  const scene = options.createScene(gl, canvas);
  if (!scene) return () => undefined;

  const root = canvas.closest<HTMLElement>(options.rootSelector);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  let width = 0;
  let height = 0;
  let dpr = 1;
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

  const isDark = () => {
    const theme = document.documentElement.dataset["theme"];
    return theme ? theme === "dark" : systemThemeQuery.matches;
  };

  const updateScrollProgress = () => {
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const journeyHeight = Math.max(root.scrollHeight, root.offsetHeight);
    const scrollableHeight = Math.max(1, journeyHeight - window.innerHeight);
    scrollProgress = clamp(-rect.top / scrollableHeight, 0, 1);
  };

  const draw = (now: number) => {
    if (!width || !height || contextLost) return;
    const frameDelta = clamp(now - lastDrawTime, 0, 100);
    lastDrawTime = now;
    scene.draw({
      now,
      elapsed: reducedMotion ? options.reducedTime : now / 1000,
      frameDelta,
      width,
      height,
      dpr,
      dark: isDark(),
      reducedMotion,
      scrollProgress
    });
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
    updateScrollProgress();
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const nextDpr = Math.min(
      window.devicePixelRatio || 1,
      options.dprCap(nextWidth)
    );
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    scene.resize(width, height, dpr);
    draw(performance.now());
    queueFrame();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!reducedMotion) scene.pointerMove?.(event);
  };
  const onPointerLeave = () => scene.pointerLeave?.();
  const onScroll = () => {
    updateScrollProgress();
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
    scene.resetMotion?.();
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
    scene.destroy();
  };
}

export function deferRendererMount(mount: () => () => void) {
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
    if (!destroyed) cleanupRenderer = mount();
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
}
