import { hostParticleWorker } from "../particle-worker-host";
import { createMemoryBloomScene } from "./memory-bloom-scene";

hostParticleWorker(createMemoryBloomScene);
