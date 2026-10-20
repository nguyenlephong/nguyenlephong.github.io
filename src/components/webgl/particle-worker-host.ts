// Worker-side entry: receives the transferred OffscreenCanvas, builds the
// engine there, and forwards every later message to it. The main thread
// terminates the worker on unmount, which also releases its WebGL context.

import {
  createParticleEngine,
  type ParticleEngine,
  type ParticleEngineMessage,
  type ParticleEngineSettings,
  type ParticleSceneFactory
} from "./particle-engine";

export type ParticleWorkerRequest =
  | ({ type: "init"; canvas: OffscreenCanvas } & ParticleEngineSettings)
  | ParticleEngineMessage;

export type ParticleWorkerResponse = { type: "ready"; ok: boolean };

export function hostParticleWorker(createScene: ParticleSceneFactory) {
  let engine: ParticleEngine | null = null;

  addEventListener("message", (event: MessageEvent<ParticleWorkerRequest>) => {
    const message = event.data;
    if (message.type === "init") {
      const { canvas, ...settings } = message;
      engine = createParticleEngine(canvas, createScene, settings);
      postMessage({ type: "ready", ok: Boolean(engine) } satisfies ParticleWorkerResponse);
      return;
    }
    engine?.apply(message);
  });
}
