// Main-thread controller for the scroll-synced particle backdrops. It watches
// the DOM (size, scroll, theme, motion, visibility, pointer) and sends plain
// messages to a particle engine. When the browser can render WebGL into an
// OffscreenCanvas, the engine lives in a dedicated worker so creating the
// WebGL context and drawing never block the main thread.

import {
  createParticleEngine,
  type ParticleEngineMessage,
  type ParticleEngineSettings,
  type ParticleSceneFactory
} from "./particle-engine";
import type {
  ParticleWorkerRequest,
  ParticleWorkerResponse
} from "./particle-worker-host";
import { clamp } from "./particle-gl";

export {
  clamp,
  createParticleProgram,
  drawParticleFrame,
  type ParticleCanvas,
  type ParticleFrame,
  type ParticlePalette,
  type ParticleProgram
} from "./particle-gl";
export {
  ACTIVE_SCROLL_MS,
  TARGET_FRAME_MS,
  type ParticlePointerSample,
  type ScrollParticleScene
} from "./particle-engine";

type RendererOptions = {
  rootSelector: string;
  reducedTime: number;
  dprCap: (width: number) => number;
  /** Used when the worker path is unavailable. */
  createScene: ParticleSceneFactory;
  /** Spawns the scene's worker; called only when OffscreenCanvas WebGL is supported. */
  createWorker: () => Worker;
};

type EngineLink = {
  post: (message: ParticleEngineMessage) => void;
  destroy: () => void;
};

/** Exposed on the canvas so QA scripts can see which path rendered. */
type RendererMode = "webgl-worker" | "webgl-main" | "unavailable" | "pending";

function setRendererMode(canvas: HTMLCanvasElement, mode: RendererMode) {
  canvas.dataset["particleRenderer"] = mode;
}

function supportsWorkerRendering() {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function"
  );
}

function linkWorkerEngine(
  canvas: HTMLCanvasElement,
  options: RendererOptions,
  settings: ParticleEngineSettings
): EngineLink | null {
  // Once transferred, the canvas can never get a main-thread context again.
  // If the worker later fails to load or to create WebGL, the decorative
  // backdrop stays empty rather than blocking the main thread.
  let offscreen: OffscreenCanvas;
  try {
    offscreen = canvas.transferControlToOffscreen();
  } catch {
    // Already transferred, e.g. an effect re-run on the same canvas.
    return null;
  }

  let worker: Worker;
  try {
    worker = options.createWorker();
  } catch {
    setRendererMode(canvas, "unavailable");
    return null;
  }

  let ready = false;
  const send = (message: ParticleWorkerRequest, transfer: Transferable[] = []) =>
    worker.postMessage(message, transfer);
  worker.addEventListener(
    "message",
    (event: MessageEvent<ParticleWorkerResponse>) => {
      if (event.data.type !== "ready") return;
      ready = true;
      setRendererMode(canvas, event.data.ok ? "webgl-worker" : "unavailable");
    }
  );
  worker.addEventListener("error", () => {
    if (!ready) setRendererMode(canvas, "unavailable");
  });
  setRendererMode(canvas, "pending");
  send({ type: "init", canvas: offscreen, ...settings }, [offscreen]);

  return {
    post: (message) => send(message),
    // Terminating releases the worker's WebGL context with it.
    destroy: () => worker.terminate()
  };
}

function linkInlineEngine(
  canvas: HTMLCanvasElement,
  options: RendererOptions,
  settings: ParticleEngineSettings
): EngineLink | null {
  const engine = createParticleEngine(canvas, options.createScene, settings);
  setRendererMode(canvas, engine ? "webgl-main" : "unavailable");
  if (!engine) return null;
  return { post: engine.apply, destroy: engine.destroy };
}

export function mountScrollParticleRenderer(
  canvas: HTMLCanvasElement,
  options: RendererOptions
) {
  const root = canvas.closest<HTMLElement>(options.rootSelector);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  let inViewport = true;
  let pageVisible = !document.hidden;

  const isDark = () => {
    const theme = document.documentElement.dataset["theme"];
    return theme ? theme === "dark" : systemThemeQuery.matches;
  };

  const settings: ParticleEngineSettings = {
    reducedTime: options.reducedTime,
    dark: isDark(),
    reducedMotion: motionQuery.matches,
    active: inViewport && pageVisible
  };
  const engine = supportsWorkerRendering()
    ? linkWorkerEngine(canvas, options, settings)
    : linkInlineEngine(canvas, options, settings);
  if (!engine) return () => undefined;

  const readScrollProgress = () => {
    if (!root) return 0;
    const rect = root.getBoundingClientRect();
    const journeyHeight = Math.max(root.scrollHeight, root.offsetHeight);
    const scrollableHeight = Math.max(1, journeyHeight - window.innerHeight);
    return clamp(-rect.top / scrollableHeight, 0, 1);
  };

  const postScroll = (userScroll: boolean) =>
    engine.post({ type: "scroll", progress: readScrollProgress(), userScroll });

  const postActivity = () =>
    engine.post({ type: "activity", active: inViewport && pageVisible });

  const resize = () => {
    postScroll(false);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, options.dprCap(width));
    engine.post({ type: "resize", width, height, dpr });
  };

  const onScroll = () => postScroll(true);
  const onPointerMove = (event: PointerEvent) => {
    // Skip the layout read when the engine would ignore the sample anyway.
    if (motionQuery.matches || !inViewport || !pageVisible) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    engine.post({
      type: "pointer",
      sample: {
        viewportX: event.clientX / window.innerWidth,
        viewportY: event.clientY / window.innerHeight,
        canvasX: clamp((event.clientX - rect.left) / width, 0, 1),
        canvasY: clamp((event.clientY - rect.top) / height, 0, 1),
        insideCanvas:
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom,
        canHover: hoverQuery.matches,
        time: event.timeStamp
      }
    });
  };
  const onPointerLeave = () => engine.post({ type: "pointerLeave" });
  const onHoverChange = () => {
    if (!hoverQuery.matches) engine.post({ type: "resetPointer" });
  };
  const onMotionChange = () =>
    engine.post({ type: "motion", reducedMotion: motionQuery.matches });
  const onThemeChange = () => engine.post({ type: "theme", dark: isDark() });
  const onVisibilityChange = () => {
    pageVisible = !document.hidden;
    postActivity();
  };

  const resizeObserver = new ResizeObserver(resize);
  const themeObserver = new MutationObserver(onThemeChange);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry?.isIntersecting ?? true;
    postActivity();
  });

  resizeObserver.observe(canvas);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
  intersectionObserver.observe(canvas);
  motionQuery.addEventListener("change", onMotionChange);
  systemThemeQuery.addEventListener("change", onThemeChange);
  hoverQuery.addEventListener("change", onHoverChange);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);
  resize();

  return () => {
    resizeObserver.disconnect();
    themeObserver.disconnect();
    intersectionObserver.disconnect();
    motionQuery.removeEventListener("change", onMotionChange);
    systemThemeQuery.removeEventListener("change", onThemeChange);
    hoverQuery.removeEventListener("change", onHoverChange);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener(
      "pointerleave",
      onPointerLeave
    );
    document.removeEventListener("visibilitychange", onVisibilityChange);
    engine.destroy();
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
