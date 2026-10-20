// Owns the WebGL context and the frame loop for one particle scene. It only
// reacts to messages, so it can run inline on the main thread or inside a
// dedicated worker on an OffscreenCanvas. Creating the first WebGL context
// blocks its thread for hundreds of milliseconds, which is why the worker
// path is preferred.

import { clamp, type ParticleCanvas, type ParticleFrame } from "./particle-gl";

export const TARGET_FRAME_MS = 1000 / 24;
export const ACTIVE_SCROLL_MS = 180;

/** Pointer position measured on the main thread, where the DOM lives. */
export type ParticlePointerSample = {
  /** Pointer position relative to the viewport, 0..1 on both axes. */
  viewportX: number;
  viewportY: number;
  /** Pointer position relative to the canvas box, 0..1 when inside it. */
  canvasX: number;
  canvasY: number;
  insideCanvas: boolean;
  /** True when the device has a fine pointer that can hover. */
  canHover: boolean;
  /** Event timestamp in milliseconds, only compared with other samples. */
  time: number;
};

export type ScrollParticleScene = {
  resize: (width: number, height: number, dpr: number) => void;
  draw: (frame: ParticleFrame) => void;
  pointerMove?: (sample: ParticlePointerSample) => void;
  pointerLeave?: () => void;
  resetMotion?: () => void;
  destroy: () => void;
};

export type ParticleSceneFactory = (
  gl: WebGLRenderingContext,
  canvas: ParticleCanvas
) => ScrollParticleScene | null;

export type ParticleEngineMessage =
  | { type: "resize"; width: number; height: number; dpr: number }
  | { type: "theme"; dark: boolean }
  | { type: "motion"; reducedMotion: boolean }
  | { type: "activity"; active: boolean }
  | { type: "scroll"; progress: number; userScroll: boolean }
  | { type: "pointer"; sample: ParticlePointerSample }
  | { type: "pointerLeave" }
  | { type: "resetPointer" };

export type ParticleEngineSettings = {
  reducedTime: number;
  dark: boolean;
  reducedMotion: boolean;
  active: boolean;
};

export type ParticleEngine = {
  apply: (message: ParticleEngineMessage) => void;
  destroy: () => void;
};

type FrameScheduler = {
  request: (callback: (now: number) => void) => number;
  cancel: (handle: number) => void;
};

function resolveFrameScheduler(): FrameScheduler {
  // DOM typings claim rAF always exists, but some worker scopes lack it.
  const scope = globalThis as unknown as {
    requestAnimationFrame?: (callback: (now: number) => void) => number;
    cancelAnimationFrame?: (handle: number) => void;
  };
  const request = scope.requestAnimationFrame?.bind(globalThis);
  const cancel = scope.cancelAnimationFrame?.bind(globalThis);
  if (request && cancel) return { request, cancel };
  // Workers without rAF (older engines) fall back to a ~60 Hz timer.
  return {
    request: (callback) =>
      Number(setTimeout(() => callback(performance.now()), 16)),
    cancel: (handle) => clearTimeout(handle)
  };
}

export function createParticleEngine(
  canvas: ParticleCanvas,
  createScene: ParticleSceneFactory,
  settings: ParticleEngineSettings
): ParticleEngine | null {
  // HTMLCanvasElement and OffscreenCanvas overloads differ, so narrow here.
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power"
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  const scene = createScene(gl, canvas);
  if (!scene) return null;

  const scheduler = resolveFrameScheduler();
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let frameTimer: ReturnType<typeof setTimeout> | 0 = 0;
  let dark = settings.dark;
  let reducedMotion = settings.reducedMotion;
  let active = settings.active;
  let destroyed = false;
  let contextLost = false;
  let scrollProgress = 0;
  let scrollActiveUntil = 0;
  let lastDrawTime = performance.now();

  const canAnimate = () =>
    !destroyed && !reducedMotion && active && !contextLost;

  const draw = (now: number) => {
    if (!width || !height || contextLost || destroyed) return;
    const frameDelta = clamp(now - lastDrawTime, 0, 100);
    lastDrawTime = now;
    scene.draw({
      now,
      elapsed: reducedMotion ? settings.reducedTime : now / 1000,
      frameDelta,
      width,
      height,
      dpr,
      dark,
      reducedMotion,
      scrollProgress
    });
  };

  const cancelFrame = () => {
    if (frame) scheduler.cancel(frame);
    if (frameTimer) clearTimeout(frameTimer);
    frame = 0;
    frameTimer = 0;
  };

  const renderFrame = (now: number) => {
    frame = 0;
    draw(now);
    queueFrame();
  };

  function queueFrame() {
    if (!canAnimate() || frame || frameTimer) return;

    const frameDelay =
      performance.now() < scrollActiveUntil ? 0 : TARGET_FRAME_MS;
    frameTimer = setTimeout(() => {
      frameTimer = 0;
      if (!canAnimate()) return;
      frame = scheduler.request(renderFrame);
    }, frameDelay);
  }

  const redraw = () => {
    draw(performance.now());
    queueFrame();
  };

  const resize = (nextWidth: number, nextHeight: number, nextDpr: number) => {
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    scene.resize(width, height, dpr);
    redraw();
  };

  const onScroll = (progress: number, userScroll: boolean) => {
    scrollProgress = progress;
    if (!userScroll) return;
    scrollActiveUntil = performance.now() + ACTIVE_SCROLL_MS;
    if (reducedMotion) {
      draw(performance.now());
      return;
    }
    if (frameTimer) {
      clearTimeout(frameTimer);
      frameTimer = 0;
    }
    if (!frame && active && !contextLost) {
      frame = scheduler.request(renderFrame);
    }
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    cancelFrame();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const apply = (message: ParticleEngineMessage) => {
    if (destroyed) return;
    switch (message.type) {
      case "resize":
        resize(message.width, message.height, message.dpr);
        return;
      case "theme":
        dark = message.dark;
        draw(performance.now());
        return;
      case "motion":
        reducedMotion = message.reducedMotion;
        cancelFrame();
        scene.resetMotion?.();
        redraw();
        return;
      case "activity":
        active = message.active;
        if (active) redraw();
        else cancelFrame();
        return;
      case "scroll":
        onScroll(message.progress, message.userScroll);
        return;
      case "pointer":
        if (!reducedMotion) scene.pointerMove?.(message.sample);
        return;
      case "pointerLeave":
        scene.pointerLeave?.();
        return;
      case "resetPointer":
        scene.resetMotion?.();
        return;
    }
  };

  return {
    apply,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelFrame();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.destroy();
    }
  };
}
