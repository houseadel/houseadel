/**
 * The one spectrum the site refracts through.
 *
 * Four stops, in the order light leaves a dispersing edge on this page: cyan,
 * blue-violet, magenta, then warm red. Every place that splits light uses this
 * ramp — the liquid lens's stacked fringe, the relief's dispersal under the
 * hand, the pearl clouds' lift — so a hand moving from the type to the sculpture
 * to the wood is met by one material rather than three that happen to be
 * colourful.
 *
 * Kept as a GLSL source string rather than a table of numbers because the
 * consumers are shaders in two different dialects; the function below uses
 * nothing that GLSL ES 1.00 and 3.00 do not share.
 */
export const SPECTRUM_CHUNK = `
vec3 houseAdelSpectrum(float t) {
  vec3 cyan = vec3(0.24, 0.86, 1.00);
  vec3 violet = vec3(0.42, 0.34, 1.00);
  vec3 magenta = vec3(1.00, 0.28, 0.84);
  vec3 warm = vec3(1.00, 0.44, 0.22);
  float s = clamp(t, 0.0, 1.0) * 3.0;
  vec3 c = mix(cyan, violet, clamp(s, 0.0, 1.0));
  c = mix(c, magenta, clamp(s - 1.0, 0.0, 1.0));
  c = mix(c, warm, clamp(s - 2.0, 0.0, 1.0));
  return c;
}
`;

/**
 * The same four stops for anything drawing on a 2D canvas, where a shader is
 * not available — the routed transition's leading edge, principally.
 */
export const SPECTRUM_STOPS = ["#3ddbff", "#6b57ff", "#ff47d6", "#ff7038"] as const;
