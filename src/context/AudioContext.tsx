import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SoundCue = "hover" | "press" | "open";

type AudioContextValue = {
  enabled: boolean;
  supported: boolean;
  toggle: () => void;
  play: (cue: SoundCue) => void;
};

const AudioStateContext = createContext<AudioContextValue | null>(null);

function audioConstructor() {
  return window.AudioContext;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const contextReference = useRef<AudioContext | null>(null);
  const lastCue = useRef(0);
  const supported = typeof window !== "undefined" && Boolean(audioConstructor());

  const ensureContext = useCallback(() => {
    if (!supported) return null;
    contextReference.current ??= new (audioConstructor())();
    if (contextReference.current.state === "suspended") {
      void contextReference.current.resume();
    }
    return contextReference.current;
  }, [supported]);

  const synthesize = useCallback(
    (cue: SoundCue, force = false) => {
      if ((!enabled && !force) || !supported) return;
      const now = performance.now();
      if (!force && now - lastCue.current < 70) return;
      lastCue.current = now;
      const context = ensureContext();
      if (!context) return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const start = context.currentTime;
      const settings = {
        hover: { frequency: 540, volume: 0.012, duration: 0.045 },
        press: { frequency: 185, volume: 0.022, duration: 0.085 },
        open: { frequency: 310, volume: 0.025, duration: 0.16 },
      }[cue];

      oscillator.type = cue === "press" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(settings.frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        settings.frequency * (cue === "open" ? 1.48 : 0.86),
        start + settings.duration,
      );
      filter.type = "lowpass";
      filter.frequency.value = 1_200;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(settings.volume, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + settings.duration);
      oscillator.connect(filter).connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + settings.duration + 0.01);
    },
    [enabled, ensureContext, supported],
  );

  const toggle = useCallback(() => {
    if (!supported) return;
    if (!enabled) {
      ensureContext();
      setEnabled(true);
      window.setTimeout(() => synthesize("open", true), 0);
      return;
    }
    synthesize("press", true);
    setEnabled(false);
  }, [enabled, ensureContext, supported, synthesize]);

  useEffect(() => {
    const hover = (event: PointerEvent | FocusEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-sonic]") : null;
      if (target) synthesize("hover");
    };
    const press = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-sonic]") : null;
      if (target) synthesize("press");
    };
    document.addEventListener("pointerover", hover, { passive: true });
    document.addEventListener("focusin", hover);
    document.addEventListener("pointerdown", press, { passive: true });
    return () => {
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("focusin", hover);
      document.removeEventListener("pointerdown", press);
    };
  }, [synthesize]);

  useEffect(
    () => () => {
      void contextReference.current?.close();
      contextReference.current = null;
    },
    [],
  );

  const value = useMemo(
    () => ({ enabled, supported, toggle, play: synthesize }),
    [enabled, supported, synthesize, toggle],
  );

  return <AudioStateContext.Provider value={value}>{children}</AudioStateContext.Provider>;
}

// The hook and provider intentionally share the private context contract.
// eslint-disable-next-line react-refresh/only-export-components
export function useAudio() {
  const value = useContext(AudioStateContext);
  if (!value) throw new Error("useAudio must be used within AudioProvider.");
  return value;
}
