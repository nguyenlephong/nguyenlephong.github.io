// WebGL helpers shared by every particle scene. Nothing here touches the DOM,
// so the same code runs on the main thread and inside a dedicated worker.

export type ParticleCanvas = HTMLCanvasElement | OffscreenCanvas;

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
  canvas: ParticleCanvas,
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

