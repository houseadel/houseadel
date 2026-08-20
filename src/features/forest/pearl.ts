/**
 * Nacre, as a particle.
 *
 * A pearl is not a colour, it is an interference effect: light entering the
 * surface reflects off many sub-microscopic layers of aragonite, and because
 * those layers are about a wavelength apart, some wavelengths cancel and others
 * reinforce. Which ones do depends on the angle you view it from, which is why a
 * pearl shifts through pink, gold and green as it turns while staying, overall,
 * white.
 *
 * That is what the shader below reproduces, rather than a photographic texture. A
 * texture would be wrong twice over: each particle is a few pixels across, so
 * there is nowhere to put a photograph, and a mapped image cannot change with the
 * viewing angle, which is the entire behaviour that makes a pearl read as a
 * pearl.
 *
 * The maths is a cheap thin-film approximation: a cosine palette indexed by the
 * angle between the surface and the eye, mixed lightly over a warm white body, so
 * colour lives at the grazing edge and the centre stays lit and pale.
 */
export const PEARL_CHUNK = /* glsl */ `
  // A soft spherical normal for a point sprite, from its own coordinate.
  vec3 pearlNormal(vec2 coord) {
    vec2 d = coord * 2.0 - 1.0;
    float r2 = dot(d, d);
    return vec3(d, sqrt(max(1.0 - r2, 0.0)));
  }

  vec3 pearlSpectrum(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (vec3(0.00, 0.33, 0.67) + t));
  }

  /**
   * @param coord  gl_PointCoord
   * @param facing how square-on the particle's own surface is to the eye
   * @param seed   per-particle offset, so a field does not shimmer in unison
   * @param warmth 0 cool, 1 warm; the light falling on it
   */
  vec4 pearl(vec2 coord, float facing, float seed, float warmth) {
    vec3 n = pearlNormal(coord);
    float r = length(coord * 2.0 - 1.0);
    if (r > 1.0) return vec4(0.0);

    vec3 view = vec3(0.0, 0.0, 1.0);
    float ndv = clamp(dot(n, view), 0.0, 1.0);

    // Fresnel: the rim returns far more light than the centre, which is what
    // gives a bead its wet edge.
    float fresnel = pow(1.0 - ndv, 3.0);

    // Interference. The film's apparent thickness grows toward the rim, so the
    // hue sweeps as the surface turns away.
    float film = (1.0 - ndv) * 1.9 + seed;
    vec3 iridescence = pearlSpectrum(film);

    vec3 light = normalize(vec3(-0.4, 0.75, 0.55));
    float lambert = clamp(dot(n, light), 0.0, 1.0);
    float specular = pow(clamp(dot(reflect(-light, n), view), 0.0, 1.0), 28.0);

    vec3 body = mix(vec3(0.78, 0.79, 0.82), vec3(1.0, 0.97, 0.92), warmth);
    vec3 colour = body * (0.42 + lambert * 0.9);
    // Colour is a sheen over white, never the substance of it. Push this much
    // past a third and the pearl stops being a pearl and becomes an oil slick.
    colour = mix(colour, colour * iridescence * 1.6, fresnel * 0.34);
    colour += specular * 0.85;
    colour *= 0.45 + facing * 0.75;

    // Soft edge, and the rim carries a little more presence than the middle.
    float alpha = (1.0 - smoothstep(0.72, 1.0, r)) * (0.55 + fresnel * 0.45);
    return vec4(colour, alpha);
  }
`;
