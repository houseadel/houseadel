import { resolveAppUrl } from "./basePath";

/**
 * The House Adel sonic identity, as delivered.
 *
 * The pack arrived as WAV; these are AAC transcodes in `public/assets/house-adel/sound`.
 * Cue names here are what the site means by them, not the file numbering, so a
 * replacement pack only has to change the paths below.
 *
 * The score is deliberately not in this table. It is ten minutes long and is
 * streamed by an `<audio>` element rather than decoded into memory, so it never
 * blocks a cue and never costs anything until sound is switched on.
 */
export type SoundCue =
  /** Any link or control being pressed. */
  | "press"
  /** A route dissolving out. */
  | "transition"
  /** The loader's bed, while it waits on real readiness. */
  | "loading"
  /** The loader resolving. */
  | "reveal"
  /** A line of type resolving out of blur. */
  | "bloom"
  /** A line of type dissolving back into it. */
  | "recede";

const SOUND_ROOT = "/assets/house-adel/sound";

const files: Record<SoundCue, string> = {
  press: "01_button_press_chamber",
  transition: "02_page_transition_opening",
  loading: "03_loading_chamber_loop_14s",
  reveal: "04_load_complete_reveal",
  bloom: "05_text_bloom",
  recede: "06_text_recede",
};

/*
 * Currently voiced: press, transition, reveal, bloom.
 *
 * `loading` has no moment to play in — sound is offered as a choice at the end of
 * the loader, by which point the bed it was written for is over. `recede` was
 * written for type dissolving on the way out, which the site no longer does.
 *
 * The pack also ships 07_particle_sand_01-09, built so overlapping brush gestures
 * would land on different samples and form accidental harmony. Voiced on hover
 * they read as static over the relief rather than as texture, so they are not
 * wired to anything either. All of it stays catalogued here rather than deleted,
 * because the gestures may come back.
 */

export function cueUrl(cue: SoundCue): string {
  return resolveAppUrl(`${SOUND_ROOT}/${files[cue]}.m4a`);
}

export const scoreUrl = () => resolveAppUrl(`${SOUND_ROOT}/09_score_theme.m4a`);

/**
 * Per-cue level. The pack is mastered consistently, so these are balance
 * decisions rather than corrections: the score sits well under everything, and
 * the brush sits under the type it accompanies.
 */
export const cueGain: Record<SoundCue, number> = {
  press: 0.5,
  transition: 0.42,
  loading: 0.3,
  reveal: 0.5,
  bloom: 0.26,
  recede: 0.24,
};
