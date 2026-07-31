import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type MotionPreference = "system" | "full" | "reduced";
export type GraphicsPreference = "webgl" | "fallback";

type Preferences = {
  motion: MotionPreference;
  graphics: GraphicsPreference;
  setMotion: (value: MotionPreference) => void;
  setGraphics: (value: GraphicsPreference) => void;
  reduceMotion: boolean;
};

const PreferencesContext = createContext<Preferences | null>(null);

function readPreference<T extends string>(key: string, fallback: T): T {
  const stored = window.localStorage.getItem(key);
  return (stored as T) || fallback;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [motion, setMotionState] = useState<MotionPreference>(() =>
    readPreference("house-adel:motion", "system"),
  );
  const [graphics, setGraphicsState] = useState<GraphicsPreference>(() =>
    readPreference("house-adel:graphics", "webgl"),
  );
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion;
    window.localStorage.setItem("house-adel:motion", motion);
  }, [motion]);

  useEffect(() => {
    document.documentElement.dataset.graphics = graphics;
    window.localStorage.setItem("house-adel:graphics", graphics);
  }, [graphics]);

  const value = useMemo(
    () => ({
      motion,
      graphics,
      setMotion: setMotionState,
      setGraphics: setGraphicsState,
      reduceMotion: motion === "reduced" || (motion === "system" && systemReduced),
    }),
    [graphics, motion, systemReduced],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used within PreferencesProvider");
  return value;
}
