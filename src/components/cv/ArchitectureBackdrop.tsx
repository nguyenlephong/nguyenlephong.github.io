"use client";

import { useEffect, useRef } from "react";
import {
  deferRendererMount,
  mountScrollParticleRenderer
} from "@/components/webgl/ScrollParticleRenderer";
import { createArchitectureScene } from "@/components/webgl/scenes/architecture-scene";

function mountRenderer(canvas: HTMLCanvasElement) {
  return mountScrollParticleRenderer(canvas, {
    rootSelector: ".home-showcase",
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

export default function ArchitectureBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return deferRendererMount(() => mountRenderer(canvas));
  }, []);

  return <canvas ref={canvasRef} className="ai-particle-field" />;
}
