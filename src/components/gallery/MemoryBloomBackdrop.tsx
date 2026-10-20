"use client";

import { useEffect, useRef } from "react";
import {
  deferRendererMount,
  mountScrollParticleRenderer
} from "@/components/webgl/ScrollParticleRenderer";
import { createMemoryBloomScene } from "@/components/webgl/scenes/memory-bloom-scene";

function mountRenderer(canvas: HTMLCanvasElement) {
  return mountScrollParticleRenderer(canvas, {
    rootSelector: ".gallery-showcase",
    reducedTime: 18,
    dprCap: (width) => (width < 720 ? 1 : 1.25),
    createScene: createMemoryBloomScene,
    createWorker: () =>
      new Worker(
        new URL("../webgl/scenes/memory-bloom.worker", import.meta.url),
        { name: "memory-bloom-particles" }
      )
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
