import { usePreferences, type GraphicsPreference, type MotionPreference } from "../lib/preferences";

export function ModeToolbar({ compact = false }: { compact?: boolean }) {
  const { motion, graphics, setMotion, setGraphics } = usePreferences();

  return (
    <div className={compact ? "mode-toolbar mode-toolbar--compact" : "mode-toolbar"}>
      <fieldset>
        <legend>Motion</legend>
        {(["system", "full", "reduced"] as MotionPreference[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={motion === value}
            onClick={() => setMotion(value)}
          >
            {value}
          </button>
        ))}
      </fieldset>
      <fieldset>
        <legend>Graphics</legend>
        {(["webgl", "fallback"] as GraphicsPreference[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={graphics === value}
            onClick={() => setGraphics(value)}
          >
            {value === "fallback" ? "No WebGL" : "WebGL"}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
