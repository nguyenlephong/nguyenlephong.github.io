"use client";

import { useEffect, useRef } from "react";
import {
  deferRendererMount,
  mountScrollParticleRenderer
} from "@/components/webgl/ScrollParticleRenderer";
import { createArchitectureScene } from "@/components/webgl/scenes/architecture-scene";

function mountRenderer(canvas: HTMLCanvasElement, rootSelector: string) {
  return mountScrollParticleRenderer(canvas, {
    rootSelector,
    reducedTime: 12.5,
    dprCap: (width) => (width < 720 ? 1.25 : 1.5),
    createScene: createArchitectureScene,
    createWorker: () =>
      new Worker(
        new URL("../webgl/scenes/architecture.worker", import.meta.url),
        { name: "architecture-particles" }
      )
  });
}

/** `rootSelector` is the scroll container the field tracks (the homepage by default, /admin reuses it). */
export default function ArchitectureBackdrop({
  rootSelector = ".home-showcase"
}: {
  rootSelector?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return deferRendererMount(() => mountRenderer(canvas, rootSelector));
  }, [rootSelector]);

  return <canvas ref={canvasRef} className="ai-particle-field" />;
}
