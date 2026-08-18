import { SPECTRUM_CHUNK } from "../liquid/spectrum";

/**
 * The dissolve's shaders.
 *
 * The plane is flat and stays flat. There is no displacement, no depth map, no
 * relief and no subdivision — the vertex shader exists only to put a fullscreen
 * quad in front of an orthographic camera and hand the fragment shader its UVs.
 * Everything anyone will actually see is decided per pixel below.
 *
 * What this material draws is *only the boundary*. Not the outgoing page, not
 * the incoming one, not a veil over either: the document itself carries the
 * handover, by clipping the incoming route along the contour of the same field
 * this shader samples. So there is nothing here to cover the screen with, and no
 * intermediate buffer for anything to lose resolution in. This layer is the
 * material coming apart at the cut, and everywhere else it is exactly nothing.
 */

const NOISE = /* glsl */ `
  float haHash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }

  float haValueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = haHash(i);
    float b = haHash(i + vec2(1.0, 0.0));
    float c = haHash(i + vec2(0.0, 1.0));
    float d = haHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  /*
   * Octave count is a compile-time constant, not a uniform.
   *
   * GLSL ES 1.00 only guarantees loops whose bounds the compiler can see, and a
   * phone genuinely running two octaves is the point of the define — the same
   * program exiting a loop early would cost the same as running it.
   */
  float haFbm(vec2 p) {
    float sum = 0.0;
    float amplitude = 0.5;
    float total = 0.0;
    for (int i = 0; i < HA_OCTAVES; i++) {
      sum += haValueNoise(p) * amplitude;
      total += amplitude;
      p *= 2.03;
      amplitude *= 0.5;
    }
    return sum / total;
  }
`;

export const DISSOLVE_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const DISSOLVE_FRAGMENT = /* glsl */ `
  precision highp float;

  /** The coarse field, generated once on the CPU and shared with the clip path. */
  uniform sampler2D uField;
  /** 0 at the start of the movement, 1 at the end. */
  uniform float uProgress;
  /** The threshold that progress currently corresponds to, in the field's range. */
  uniform float uThreshold;
  /** Drawing-buffer size in device pixels. Keeps the boundary aspect-correct. */
  uniform vec2 uResolution;
  /** Half-width of the boundary, in field units. */
  uniform float uEdgeSoftness;
  /** Broad travel direction, document coordinates. */
  uniform vec2 uDirection;
  uniform float uTime;
  /** Scale of the fine breakup added on top of the coarse field. */
  uniform float uNoiseScale;
  /** How far that fine breakup is allowed to move the boundary. */
  uniform float uNoiseDetail;
  /** Overall strength of the chromatic edge. Zero leaves a monochrome dissolve. */
  uniform float uSpectralStrength;
  /** Separation between the sampled thresholds. Small: this is refraction, not RGB. */
  uniform float uSpectralWidth;
  /** Fades the whole layer in and out so nothing is ever left on screen. */
  uniform float uOpacity;

  varying vec2 vUv;

  ${NOISE}
  ${SPECTRUM_CHUNK}

  void main() {
    /*
     * The field, in two parts.
     *
     * The coarse part is read from the texture the document also cut its clip
     * path from, so this boundary and that one are the same boundary. The fine
     * part is added here, where per-pixel detail costs nothing, and is kept
     * deliberately smaller than the edge softness — enough to keep the edge
     * irregular below the grid's resolution, never enough to move it off the
     * contour the document is clipping along.
     */
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    float coarse = texture2D(uField, vUv).r;
    vec2 fieldUv = vUv * vec2(aspect, 1.0);
    float fine = haFbm(fieldUv * uNoiseScale + uTime * 0.05) - 0.5;
    float field = coarse + fine * uNoiseDetail;

    /*
     * Five thresholds a hair apart, and the differences between them.
     *
     * This is the whole chromatic effect, and it is done to the *threshold*
     * rather than to any image. Offsetting an image in three channels produces
     * three visible copies of the page, which is the failure everybody
     * recognises as broken RGB. Offsetting the threshold instead means the five
     * boundaries sit fractionally apart from one another, and colour can only
     * exist in the slivers where they disagree — which is precisely the rim, and
     * nowhere else. Interiors stay clean on both sides.
     */
    float offset = uSpectralWidth;
    float m0 = smoothstep(uThreshold - 2.0 * offset - uEdgeSoftness, uThreshold - 2.0 * offset + uEdgeSoftness, field);
    float m1 = smoothstep(uThreshold - offset - uEdgeSoftness, uThreshold - offset + uEdgeSoftness, field);
    float m2 = smoothstep(uThreshold - uEdgeSoftness, uThreshold + uEdgeSoftness, field);
    float m3 = smoothstep(uThreshold + offset - uEdgeSoftness, uThreshold + offset + uEdgeSoftness, field);
    float m4 = smoothstep(uThreshold + 2.0 * offset - uEdgeSoftness, uThreshold + 2.0 * offset + uEdgeSoftness, field);

    float band0 = m0 - m1;
    float band1 = m1 - m2;
    float band2 = m2 - m3;
    float band3 = m3 - m4;
    float band = band0 + band1 + band2 + band3;

    /*
     * Colour across the rim, taken from the site's own four-stop ramp rather
     * than a rainbow: the same spectrum the liquid lens and the relief refract
     * through, so a reader meets one material and not three that happen to be
     * colourful. Cool on the leading side, warm on the trailing side.
     */
    vec3 spectral =
      houseAdelSpectrum(0.06) * band0 +
      houseAdelSpectrum(0.36) * band1 +
      houseAdelSpectrum(0.64) * band2 +
      houseAdelSpectrum(0.92) * band3;

    /*
     * Colour arrives, flashes, and is gone.
     *
     * A bell around the middle of the movement, zero at both ends by
     * construction, so the destination page cannot inherit a tint no matter
     * where the transition is interrupted. The exponent shifts the weight later
     * than a plain sine would, which keeps the opening beat nearly monochrome.
     */
    float bell = sin(clamp(uProgress, 0.0, 1.0) * 3.14159265);
    float envelope = pow(bell, 2.0);

    /*
     * Colour, and nothing else.
     *
     * There is no particulate layer here. An earlier version scattered fine
     * monochrome specks along the cut to suggest pigment being carried off; it
     * read as grain sitting on top of the page rather than as the page
     * refracting, so the edge is now purely spectral. The boundary still breaks
     * up organically — that comes from the field itself, above — but everything
     * this layer draws is light.
     */
    vec3 light = spectral * uSpectralStrength * envelope * 1.7;

    /*
     * Coverage follows the colour exactly, so at both ends of the movement this
     * layer draws literally nothing rather than a faint edge nobody asked for.
     */
    float alpha = clamp(band * envelope * 0.9, 0.0, 1.0) * uOpacity;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(light * alpha, alpha);
  }
`;
