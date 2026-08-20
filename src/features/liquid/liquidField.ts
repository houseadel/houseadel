/**
 * The fluid the cursor disturbs.
 *
 * One material, simulated on the GPU. Pointer movement injects velocity along
 * the segment the hand actually travelled; that velocity advects itself and
 * carries a dye field with it; both dissipate. Nothing here draws a circle and
 * blurs it — the shape of the trail is what the flow leaves behind, which is why
 * a fast sweep stretches, a curve bends, a reversal lets the old stroke run on
 * before it follows, and a stop settles instead of freezing.
 *
 * The field knows nothing about the page. It produces two textures — a dye mask
 * and a velocity field — and hands them to whatever composites them. Keeping the
 * simulation ignorant of the compositing is what let the compositing move to the
 * top of the stack without the simulation changing.
 */

import { SPECTRUM_CHUNK } from "./spectrum";

const VERTEX = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * Advection, semi-Lagrangian: read from where this parcel was one step ago.
 *
 * Velocity is held in screen-width units per second on both axes, so a diagonal
 * push travels as far across as it does down. Without that correction the
 * simulation is stretched by the viewport's aspect and a circular splat drifts
 * into an ellipse.
 */
const ADVECT = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uSource;
uniform sampler2D uVelocity;
uniform float uDt;
uniform float uDissipation;
uniform float uAspect;
void main() {
  vec2 velocity = texture(uVelocity, vUv).xy;
  vec2 back = vUv - uDt * vec2(velocity.x, velocity.y * uAspect);
  outColor = texture(uSource, back) * uDissipation;
}`;

/** Rotation of the field, per texel. The raw material for vorticity. */
const CURL = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float bottom = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float top = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  outColor = vec4(0.5 * ((right - left) - (top - bottom)), 0.0, 0.0, 1.0);
}`;

/**
 * Vorticity confinement: give the small eddies back the energy the grid ate.
 *
 * Without it a cheap solver damps every curl within a few frames and the trail
 * behaves like a smear rather than like liquid. This is what makes a tight
 * circle keep turning after the hand has left it.
 */
const VORTICITY = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uCurlStrength;
uniform float uDt;
void main() {
  float left = texture(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float right = texture(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float bottom = texture(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float top = texture(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float centre = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * centre;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;
  outColor = vec4(clamp(velocity, -24.0, 24.0), 0.0, 1.0);
}`;

/**
 * The stroke, not the stamp.
 *
 * Distance is measured to the *segment* the pointer covered since the last
 * splat, so one press of the hand deposits a capsule rather than a dot. At any
 * speed the deposits touch end to end, which is the whole reason no individual
 * circles are visible in the trail — a per-event dot leaves a row of beads the
 * instant the hand outruns the frame rate.
 */
const SPLAT = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTarget;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform vec3 uValue;
uniform float uRadius;
uniform float uAspect;
uniform float uReplace;

float segmentDistance(vec2 point, vec2 a, vec2 b) {
  vec2 pa = point - a;
  vec2 ba = b - a;
  pa.y /= uAspect;
  ba.y /= uAspect;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float distance = segmentDistance(vUv, uFrom, uTo);
  // Firm through the body of the stroke, soft only at its rim: a Gaussian all
  // the way out makes the mask a haze with no boundary to refract at.
  float falloff = 1.0 - smoothstep(uRadius * 0.42, uRadius, distance);
  falloff *= falloff;
  vec3 previous = texture(uTarget, vUv).xyz;
  vec3 deposited = uValue * falloff;
  // The dye takes the greater of the two rather than the sum. Two passes of the
  // trail over the same place then merge into one body at one density instead of
  // stacking into a brighter core — the difference between liquid and paint.
  vec3 merged = mix(previous + deposited, max(previous, deposited), uReplace);
  outColor = vec4(merged, 1.0);
}`;

/**
 * What the page is asked to become.
 *
 * The mask is thresholded rather than faded, which is what gives a body with an
 * edge instead of a glow. Around that body the same silhouette is read again at
 * four increasing offsets along the boundary normal, and each successive ring
 * between them is tinted one stop further along the spectrum. That is what a
 * dispersing edge actually looks like: not a gradient of hue, but the same shape
 * drawn several times, each a wavelength further out. Nothing is painted — every
 * band is the trail's own outline, displaced.
 */
const COMPOSITE = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform float uAspect;
uniform float uThreshold;
uniform float uSoftness;
uniform float uInvert;
uniform float uFringe;
uniform float uRefraction;
uniform float uFlow;
uniform float uSheen;
uniform float uEdgeStep;
uniform float uDispersion;

__SPECTRUM__

float maskAt(vec2 uv) {
  return smoothstep(uThreshold - uSoftness, uThreshold + uSoftness, texture(uDye, uv).r);
}

/*
 * The silhouette, taken hard.
 *
 * The bands have to be separable, and a band is the gap between two copies of
 * this outline a pixel or two apart. Read through the body's own soft threshold
 * those copies overlap into one smooth ramp and the fringe goes back to being a
 * single blended hue; read hard, each one has an edge of its own and the stack
 * reads as a stack. The dye texture is linearly upsampled from well below screen
 * resolution, so "hard" here still lands as a clean two-pixel transition rather
 * than as a staircase.
 */
float silhouetteAt(vec2 uv) {
  return smoothstep(uThreshold - 0.018, uThreshold + 0.018, texture(uDye, uv).r);
}

void main() {
  vec2 step = vec2(uEdgeStep, uEdgeStep * uAspect);
  float left = maskAt(vUv - vec2(step.x, 0.0));
  float right = maskAt(vUv + vec2(step.x, 0.0));
  float bottom = maskAt(vUv - vec2(0.0, step.y));
  float top = maskAt(vUv + vec2(0.0, step.y));
  vec2 gradient = vec2(right - left, top - bottom) * 0.5;
  float edge = clamp(length(gradient) * 2.4, 0.0, 1.0);

  vec2 velocity = texture(uVelocity, vUv).xy;
  vec2 flow = vec2(velocity.x, velocity.y * uAspect);
  float flowSpeed = length(flow);
  float speed = clamp(flowSpeed * 0.22, 0.0, 1.0);
  vec2 normal = gradient / (length(gradient) + 0.0001);

  // How far apart the copies sit. Wider where the flow runs into the boundary
  // and narrower where it is pulling away, so the stack opens along the leading
  // edge of a stroke and closes behind it — and collapses altogether at rest.
  vec2 flowDirection = flowSpeed > 0.0001 ? flow / flowSpeed : vec2(0.0);
  float incidence = dot(normal, flowDirection);
  float spread = uRefraction * (0.66 + 0.34 * speed) * (1.0 + uDispersion * incidence);
  vec2 pitch = normal * spread + flow * uFlow;

  /*
   * The body of the stroke, at one strength everywhere.
   *
   * This used to ease off wherever a sculpture was underneath, on the argument
   * that a modelled form answers the hand in its own language and two answers to
   * one gesture is one too many. In practice the change was the thing that read
   * as wrong: the trail visibly changed character as it crossed the figure. One
   * stroke, the same everywhere, is the simpler and better behaviour.
   */
  float body = maskAt(vUv);
  vec3 amount = vec3(body) * uInvert;

  // Four copies of the outline, each further out than the last, each taking the
  // next stop of the spectrum. The ring is what one copy adds over all the
  // copies inside it, so the bands abut instead of washing over one another.
  vec3 dispersion = vec3(0.0);
  float covered = silhouetteAt(vUv);
  float reach[4];
  reach[0] = 1.0;
  reach[1] = 2.05;
  reach[2] = 3.3;
  reach[3] = 4.75;
  for (int i = 0; i < 4; i++) {
    float outline = silhouetteAt(vUv + pitch * reach[i]);
    float ring = clamp(outline - covered, 0.0, 1.0);
    dispersion += ring * houseAdelSpectrum(float(i) / 3.0) * uFringe;
    covered = max(covered, outline);
  }

  // A wet edge: the one part of this that is not dispersed.
  dispersion += edge * uSheen * vec3(0.86, 0.92, 1.0);

  amount += dispersion;

  outColor = vec4(clamp(amount, 0.0, 1.0), 1.0);
}`.replace("__SPECTRUM__", SPECTRUM_CHUNK)
;

type Fbo = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
};

type DoubleFbo = { read: Fbo; write: Fbo; swap: () => void };

type Uniforms = Record<string, WebGLUniformLocation | null>;

type Program = { program: WebGLProgram; uniforms: Uniforms };

export type LiquidFieldSettings = {
  /** Fraction of the remaining velocity after one second. */
  velocityDissipation: number;
  /** Fraction of the remaining dye after one second. */
  dyeDissipation: number;
  curlStrength: number;
  /** Splat radius at rest, in screen widths. */
  radius: number;
  /** Added to the radius at full speed. */
  radiusSpeedGain: number;
  /** Velocity injected per unit of pointer speed. */
  force: number;
  threshold: number;
  softness: number;
  invert: number;
  /** How much of the spectral fringe survives. Below one it is a tint, not a rainbow. */
  fringe: number;
  refraction: number;
  flow: number;
  sheen: number;
  /** How much the flow's angle on the boundary opens or closes the band stack. */
  dispersion: number;
};

/**
 * Both dissipations are "fraction still there one second later", so they read as
 * the lifetime they actually produce rather than as a per-frame multiplier that
 * means different things at 60Hz and 120Hz.
 *
 * The dye outlives the velocity. That separation is the point: the body of the
 * trail lingers while the flow that shaped it has already gone quiet, which is
 * why the tail keeps drifting after the hand stops instead of freezing in place.
 */
export const DEFAULT_SETTINGS: LiquidFieldSettings = {
  velocityDissipation: 0.06,
  dyeDissipation: 0.45,
  // Enough to keep the eddies turning, not enough to tear the boundary into
  // flames: past about fifteen the threshold starts cutting spikes out of the
  // edge and the body reads as burnt paper rather than as liquid.
  curlStrength: 13,
  radius: 0.05,
  radiusSpeedGain: 0.024,
  /**
   * Deliberately small. Injecting the pointer's own speed into the field means
   * the dye is advected across the whole viewport in a quarter of a second and
   * the trail is gone before it can be seen — the flow is meant to bend and
   * stretch what the stroke laid down, not to fire it out of the frame.
   */
  force: 0.2,
  threshold: 0.36,
  softness: 0.09,
  /*
   * Full strength. Away from a sculpture the trail turns the page inside out
   * under the hand, which is the effect the site is built around.
   */
  invert: 0.9,
  /*
   * The fringe is a hint of dispersion at the boundary, not the point of it.
   */
  fringe: 0.5,
  /*
   * The pitch between one displaced copy of the outline and the next, in screen
   * widths — about four pixels at a common desktop width, so the four copies
   * span roughly twenty. Narrower than this and consecutive copies overlap
   * inside the width of their own antialiasing: the bands are still there, but
   * they average back into the single tinted line the stack exists to replace.
   */
  refraction: 0.003,
  flow: 0.00026,
  /* Small. The specular is a wet highlight on the boundary, and any more of it
     sits on top of the bands and washes them back out. */
  sheen: 0.07,
  dispersion: 0.55,
};

/** Pointer speed, in screen widths per second, treated as "as fast as it gets". */
const SPEED_REFERENCE = 3.2;
/** Beyond this, a pointer sample is a teleport rather than a movement. */
const TELEPORT_DISTANCE = 0.55;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
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

function link(gl: WebGL2RenderingContext, fragment: string): Program | null {
  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const uniforms: Uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i += 1) {
    const info = gl.getActiveUniform(program, i);
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
}

export class LiquidField {
  private readonly gl: WebGL2RenderingContext;
  private readonly programs: Record<string, Program>;
  private readonly quad: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private velocity: DoubleFbo;
  private dye: DoubleFbo;
  private curl: Fbo;
  private simWidth = 0;
  private simHeight = 0;
  private dyeWidth = 0;
  private dyeHeight = 0;
  private aspect = 1;
  /** Where the last splat ended, in viewport uv. Null until the pointer arrives. */
  private anchor: { x: number; y: number } | null = null;
  private queued: { x: number; y: number }[] = [];
  private settings: LiquidFieldSettings;
  /** Peak pointer speed this frame, 0 to 1, for anything that wants to read it. */
  speed = 0;
  /** Seconds of simulation still worth running after the last disturbance. */
  private restFor = 0;
  /** Published sculpture regions, packed as x, y, rx, ry per subject. */

  private constructor(gl: WebGL2RenderingContext, programs: Record<string, Program>, settings: LiquidFieldSettings) {
    this.gl = gl;
    this.programs = programs;
    this.settings = settings;

    const quad = gl.createBuffer()!;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.quad = quad;
    this.vao = vao;

    // Sized properly by the first `resize`; created here so the fields are never
    // null and every path can assume a bound target exists.
    this.velocity = this.createDouble(2, 2);
    this.dye = this.createDouble(2, 2);
    this.curl = this.createFbo(2, 2);
  }

  /**
   * Null when the browser cannot render to a half-float target. The site is
   * expected to carry on without the effect rather than fall back to something
   * that looks like a different idea.
   */
  static create(canvas: HTMLCanvasElement, settings: LiquidFieldSettings = DEFAULT_SETTINGS) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return null;
    if (!gl.getExtension("EXT_color_buffer_float") && !gl.getExtension("EXT_color_buffer_half_float")) {
      return null;
    }
    const programs: Record<string, Program> = {};
    for (const [name, source] of Object.entries({
      advect: ADVECT,
      curl: CURL,
      vorticity: VORTICITY,
      splat: SPLAT,
      composite: COMPOSITE,
    })) {
      const built = link(gl, source);
      if (!built) return null;
      programs[name] = built;
    }
    return new LiquidField(gl, programs, settings);
  }

  private createFbo(width: number, height: number): Fbo {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { texture, framebuffer, width, height };
  }

  private createDouble(width: number, height: number): DoubleFbo {
    const first = this.createFbo(width, height);
    const second = this.createFbo(width, height);
    const pair = {
      read: first,
      write: second,
      swap: () => {
        const held = pair.read;
        pair.read = pair.write;
        pair.write = held;
      },
    };
    return pair;
  }

  private disposeFbo(fbo: Fbo) {
    this.gl.deleteTexture(fbo.texture);
    this.gl.deleteFramebuffer(fbo.framebuffer);
  }

  private disposeDouble(pair: DoubleFbo) {
    this.disposeFbo(pair.read);
    this.disposeFbo(pair.write);
  }

  /**
   * @param width CSS pixels of the viewport.
   * @param height CSS pixels of the viewport.
   * @param pixelRatio Device pixels per CSS pixel for the *visible* canvas only.
   */
  resize(width: number, height: number, pixelRatio: number) {
    const gl = this.gl;
    gl.canvas.width = Math.round(width * pixelRatio);
    gl.canvas.height = Math.round(height * pixelRatio);
    this.aspect = width / Math.max(height, 1);

    // The simulation runs coarse and the mask is read back through linear
    // filtering, so the boundary arrives smooth rather than stepped. What must
    // not be coarse is the canvas above, which stays at device resolution: the
    // page underneath is never resampled, only told what to become.
    const simWidth = Math.max(160, Math.min(384, Math.round(width * 0.34)));
    const simHeight = Math.max(96, Math.round(simWidth / this.aspect));
    const dyeWidth = Math.max(256, Math.min(768, Math.round(width * 0.62)));
    const dyeHeight = Math.max(160, Math.round(dyeWidth / this.aspect));
    if (simWidth === this.simWidth && dyeWidth === this.dyeWidth && simHeight === this.simHeight) return;

    this.disposeDouble(this.velocity);
    this.disposeDouble(this.dye);
    this.disposeFbo(this.curl);
    this.velocity = this.createDouble(simWidth, simHeight);
    this.dye = this.createDouble(dyeWidth, dyeHeight);
    this.curl = this.createFbo(simWidth, simHeight);
    this.simWidth = simWidth;
    this.simHeight = simHeight;
    this.dyeWidth = dyeWidth;
    this.dyeHeight = dyeHeight;
    this.anchor = null;
  }

  /**
   * A pointer sample, in viewport uv with y up.
   *
   * Samples are queued rather than splatted, because several arrive between two
   * frames on a fast mouse and each pair of them is a segment of the same
   * stroke. Splatting them all is what keeps the stroke continuous at speed.
   */
  push(x: number, y: number) {
    if (this.anchor && Math.hypot(x - this.anchor.x, (y - this.anchor.y) / this.aspect) > TELEPORT_DISTANCE) {
      // The pointer left the window and came back somewhere else. Re-anchor
      // silently: drawing the segment between would stripe the screen.
      this.anchor = { x, y };
      this.queued.length = 0;
      return;
    }
    if (!this.anchor) this.anchor = { x, y };
    this.queued.push({ x, y });
    if (this.queued.length > 12) this.queued.splice(0, this.queued.length - 12);
    this.restFor = 2.6;
  }

  /** True while the field still has something to say. */
  get alive() {
    return this.restFor > 0;
  }

  private bind(name: string) {
    const program = this.programs[name];
    this.gl.useProgram(program.program);
    return program.uniforms;
  }

  private draw(target: Fbo | null) {
    const gl = this.gl;
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private texture(unit: number, texture: WebGLTexture) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return unit;
  }

  private splat(from: { x: number; y: number }, to: { x: number; y: number }, dt: number) {
    const gl = this.gl;
    const settings = this.settings;
    const travelled = Math.hypot(to.x - from.x, (to.y - from.y) / this.aspect);
    const speed = Math.min(travelled / Math.max(dt, 0.001) / SPEED_REFERENCE, 1);
    this.speed = Math.max(this.speed, speed);
    const radius = settings.radius + settings.radiusSpeedGain * speed;

    // Velocity, capped: a cursor that jumps a third of the screen in one frame
    // should push the fluid hard, not detonate it.
    const push = {
      x: (to.x - from.x) / Math.max(dt, 0.004),
      y: (to.y - from.y) / Math.max(dt, 0.004),
    };
    const magnitude = Math.hypot(push.x, push.y);
    const capped = Math.min(magnitude, SPEED_REFERENCE * 2.4);
    const scale = magnitude > 0.0001 ? (capped / magnitude) * settings.force : 0;

    let uniforms = this.bind("splat");
    gl.uniform1i(uniforms.uTarget, this.texture(0, this.velocity.read.texture));
    gl.uniform2f(uniforms.uFrom, from.x, from.y);
    gl.uniform2f(uniforms.uTo, to.x, to.y);
    gl.uniform3f(uniforms.uValue, push.x * scale, push.y * scale, 0);
    gl.uniform1f(uniforms.uRadius, radius);
    gl.uniform1f(uniforms.uAspect, this.aspect);
    gl.uniform1f(uniforms.uReplace, 0);
    this.draw(this.velocity.write);
    this.velocity.swap();

    uniforms = this.bind("splat");
    gl.uniform1i(uniforms.uTarget, this.texture(0, this.dye.read.texture));
    gl.uniform2f(uniforms.uFrom, from.x, from.y);
    gl.uniform2f(uniforms.uTo, to.x, to.y);
    gl.uniform3f(uniforms.uValue, 1, 1, 1);
    gl.uniform1f(uniforms.uRadius, radius);
    gl.uniform1f(uniforms.uAspect, this.aspect);
    gl.uniform1f(uniforms.uReplace, 1);
    this.draw(this.dye.write);
    this.dye.swap();
  }

  /** One simulation step and one composite. `dt` in seconds. */
  step(dt: number) {
    const gl = this.gl;
    const settings = this.settings;
    const clamped = Math.min(Math.max(dt, 0.001), 1 / 30);
    this.speed = 0;
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);

    const simTexel = [1 / this.simWidth, 1 / this.simHeight] as const;

    let uniforms = this.bind("curl");
    gl.uniform1i(uniforms.uVelocity, this.texture(0, this.velocity.read.texture));
    gl.uniform2f(uniforms.uTexel, simTexel[0], simTexel[1]);
    this.draw(this.curl);

    uniforms = this.bind("vorticity");
    gl.uniform1i(uniforms.uVelocity, this.texture(0, this.velocity.read.texture));
    gl.uniform1i(uniforms.uCurl, this.texture(1, this.curl.texture));
    gl.uniform2f(uniforms.uTexel, simTexel[0], simTexel[1]);
    gl.uniform1f(uniforms.uCurlStrength, settings.curlStrength);
    gl.uniform1f(uniforms.uDt, clamped);
    this.draw(this.velocity.write);
    this.velocity.swap();

    uniforms = this.bind("advect");
    gl.uniform1i(uniforms.uVelocity, this.texture(0, this.velocity.read.texture));
    gl.uniform1i(uniforms.uSource, this.texture(0, this.velocity.read.texture));
    gl.uniform1f(uniforms.uDt, clamped);
    gl.uniform1f(uniforms.uAspect, this.aspect);
    gl.uniform1f(uniforms.uDissipation, Math.pow(settings.velocityDissipation, clamped));
    this.draw(this.velocity.write);
    this.velocity.swap();

    // Every sample taken since the last frame, as one unbroken stroke.
    if (this.anchor && this.queued.length) {
      const share = clamped / this.queued.length;
      for (const point of this.queued) {
        this.splat(this.anchor, point, share);
        this.anchor = point;
      }
      this.queued.length = 0;
    }

    uniforms = this.bind("advect");
    gl.uniform1i(uniforms.uVelocity, this.texture(0, this.velocity.read.texture));
    gl.uniform1i(uniforms.uSource, this.texture(1, this.dye.read.texture));
    gl.uniform1f(uniforms.uDt, clamped);
    gl.uniform1f(uniforms.uAspect, this.aspect);
    gl.uniform1f(uniforms.uDissipation, Math.pow(settings.dyeDissipation, clamped));
    this.draw(this.dye.write);
    this.dye.swap();

    uniforms = this.bind("composite");
    gl.uniform1i(uniforms.uDye, this.texture(0, this.dye.read.texture));
    gl.uniform1i(uniforms.uVelocity, this.texture(1, this.velocity.read.texture));
    gl.uniform1f(uniforms.uAspect, this.aspect);
    gl.uniform1f(uniforms.uThreshold, settings.threshold);
    gl.uniform1f(uniforms.uSoftness, settings.softness);
    gl.uniform1f(uniforms.uInvert, settings.invert);
    gl.uniform1f(uniforms.uFringe, settings.fringe);
    gl.uniform1f(uniforms.uRefraction, settings.refraction);
    gl.uniform1f(uniforms.uFlow, settings.flow);
    gl.uniform1f(uniforms.uSheen, settings.sheen);
    gl.uniform1f(uniforms.uDispersion, settings.dispersion);
    // A step and a half of the dye grid: wide enough to find the boundary,
    // narrow enough that the band stays a boundary rather than a halo.
    gl.uniform1f(uniforms.uEdgeStep, 1.5 / this.dyeWidth);
    this.draw(null);

    this.restFor = Math.max(this.restFor - clamped, 0);
  }

  /** Black, which under a difference composite is the page exactly as it was. */
  clear() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  dispose() {
    const gl = this.gl;
    this.disposeDouble(this.velocity);
    this.disposeDouble(this.dye);
    this.disposeFbo(this.curl);
    gl.deleteBuffer(this.quad);
    gl.deleteVertexArray(this.vao);
    for (const program of Object.values(this.programs)) gl.deleteProgram(program.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
