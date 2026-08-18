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
import { cueGain, cueUrl, scoreUrl, type SoundCue } from "../lib/soundpack";

type AudioContextValue = {
  enabled: boolean;
  supported: boolean;
  toggle: () => void;
  enable: () => void;
  play: (cue: SoundCue) => void;
  /** 0 dry, 1 fully submerged. Muffles the score without interrupting it. */
  setSubmerge: (amount: number) => void;
};

const AudioStateContext = createContext<AudioContextValue | null>(null);

/** Minimum gap between two firings of the same cue, in milliseconds. */
const CUE_THROTTLE: Partial<Record<SoundCue, number>> = {
  press: 90,
  bloom: 700,
  recede: 700,
};

function audioConstructor() {
  return window.AudioContext;
}

/**
 * Plays the delivered sonic identity rather than synthesising stand-ins.
 *
 * Nothing is fetched until sound is switched on. That is not only a bandwidth
 * decision: a browser will not let an `AudioContext` run before a gesture anyway,
 * so there is no point holding decoded buffers for a visitor who never asks for
 * sound. Once enabled, cues are fetched and decoded once and cached.
 *
 * The ten-minute score is streamed through an `<audio>` element instead of being
 * decoded, because decoding it would mean holding roughly a hundred megabytes of
 * float samples in memory to play a background bed.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const contextReference = useRef<AudioContext | null>(null);
  const busReference = useRef<GainNode | null>(null);
  const buffers = useRef(new Map<string, AudioBuffer>());
  const pending = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const lastFired = useRef(new Map<SoundCue, number>());
  const score = useRef<HTMLAudioElement | null>(null);
  const scoreChain = useRef<{
    lowpass: BiquadFilterNode;
    dry: GainNode;
    wet: GainNode;
    tilt: BiquadFilterNode;
  } | null>(null);
  const submergeTarget = useRef(0);
  const supported = typeof window !== "undefined" && Boolean(audioConstructor());

  const ensureContext = useCallback(() => {
    if (!supported) return null;
    if (!contextReference.current) {
      const context = new (audioConstructor())();
      const bus = context.createGain();
      bus.gain.value = 0.85;
      bus.connect(context.destination);
      contextReference.current = context;
      busReference.current = bus;
    }
    if (contextReference.current.state === "suspended") {
      void contextReference.current.resume();
    }
    return contextReference.current;
  }, [supported]);

  const load = useCallback(
    (url: string) => {
      const cached = buffers.current.get(url);
      if (cached) return Promise.resolve(cached);
      const inFlight = pending.current.get(url);
      if (inFlight) return inFlight;

      const context = ensureContext();
      if (!context) return Promise.resolve(null);

      const task = fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status} for ${url}`);
          return response.arrayBuffer();
        })
        .then((bytes) => context.decodeAudioData(bytes))
        .then((buffer) => {
          buffers.current.set(url, buffer);
          return buffer;
        })
        .catch((error) => {
          // A missing or undecodable cue must never take the page down with it.
          if (import.meta.env.DEV) console.warn(`[House Adel sound] ${url} did not load.`, error);
          return null;
        })
        .finally(() => {
          pending.current.delete(url);
        });

      pending.current.set(url, task);
      return task;
    },
    [ensureContext],
  );

  const play = useCallback(
    (cue: SoundCue, force = false) => {
      if ((!enabled && !force) || !supported) return;

      const now = performance.now();
      const gap = CUE_THROTTLE[cue];
      if (gap && now - (lastFired.current.get(cue) ?? -Infinity) < gap) return;
      lastFired.current.set(cue, now);

      const url = cueUrl(cue);
      void load(url).then((buffer) => {
        const context = contextReference.current;
        const bus = busReference.current;
        if (!buffer || !context || !bus) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        gain.gain.value = cueGain[cue];
        source.buffer = buffer;
        source.connect(gain).connect(bus);
        source.start();
      });
    },
    [enabled, load, supported],
  );

  /**
   * A short algorithmic impulse: exponentially decaying noise, low-passed by
   * construction because the high frequencies decay fastest. Shipping a real
   * impulse response would mean another download for something the ear reads as
   * “room” rather than as a specific room.
   */
  const buildImpulse = useCallback((context: AudioContext) => {
    const seconds = 2.6;
    const length = Math.floor(context.sampleRate * seconds);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        const t = i / length;
        // Higher powers decay faster, so the tail darkens as it falls away.
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (1 - t * 0.35);
      }
    }
    return impulse;
  }, []);

  const startScore = useCallback(() => {
    if (score.current) {
      void score.current.play().catch(() => undefined);
      return;
    }
    const element = new Audio(scoreUrl());
    element.loop = true;
    element.crossOrigin = "anonymous";
    element.volume = 0.055;
    element.preload = "none";
    // In the document rather than floating: a media element that is attached can
    // be inspected in devtools and asserted against in tests, and the browser
    // treats its lifecycle the same either way.
    element.setAttribute("aria-hidden", "true");
    element.dataset.houseAdelScore = "true";
    element.style.display = "none";
    document.body.append(element);
    score.current = element;

    // Routed through the graph rather than played straight out, so the same
    // playing file can be muffled in place. There is only ever one source and one
    // playback position: submerging is a filter, not a second track.
    const context = ensureContext();
    const bus = busReference.current;
    if (context && bus) {
      try {
        const source = context.createMediaElementSource(element);
        const lowpass = context.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 20_000;
        lowpass.Q.value = 0.6;

        // Water takes the top off and leaves the body, so the tilt pulls the
        // upper mids down as the lowpass closes.
        const tilt = context.createBiquadFilter();
        tilt.type = "highshelf";
        tilt.frequency.value = 1_400;
        tilt.gain.value = 0;

        const dry = context.createGain();
        dry.gain.value = 1;
        const wet = context.createGain();
        wet.gain.value = 0;
        const reverb = context.createConvolver();
        reverb.buffer = buildImpulse(context);

        source.connect(lowpass).connect(tilt);
        tilt.connect(dry).connect(bus);
        tilt.connect(reverb).connect(wet);
        wet.connect(bus);
        scoreChain.current = { lowpass, dry, wet, tilt };
      } catch {
        // Some browsers refuse a media element source; the score still plays, it
        // simply cannot be submerged.
        scoreChain.current = null;
      }
    }

    void element.play().catch(() => undefined);
  }, [buildImpulse, ensureContext]);

  const enable = useCallback(() => {
    if (!supported || enabled) return;
    ensureContext();
    setEnabled(true);
    play("reveal", true);
    startScore();
  }, [enabled, ensureContext, play, startScore, supported]);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (!enabled) {
      enable();
      return;
    }
    play("press", true);
    score.current?.pause();
    setEnabled(false);
  }, [enable, enabled, play, supported]);

  const setSubmerge = useCallback((amount: number) => {
    const clamped = Math.min(Math.max(amount, 0), 1);
    submergeTarget.current = clamped;
    const chain = scoreChain.current;
    const context = contextReference.current;
    if (!chain || !context) return;
    const now = context.currentTime;
    // Exponential in frequency, because pitch is heard logarithmically: a linear
    // sweep would spend most of its travel in a range the ear barely registers.
    const cutoff = 20_000 * Math.pow(320 / 20_000, clamped);
    const ramp = 0.25;
    chain.lowpass.frequency.setTargetAtTime(cutoff, now, ramp);
    chain.tilt.gain.setTargetAtTime(-18 * clamped, now, ramp);
    chain.dry.gain.setTargetAtTime(1 - clamped * 0.45, now, ramp);
    chain.wet.gain.setTargetAtTime(clamped * 0.55, now, ramp);
  }, []);

  useEffect(() => {
    const press = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-sonic]") : null;
      if (target) play("press");
    };
    // No hover cue. The pack has one press sound and a chamber-like decay; firing
    // it on every pointerover turned the header into a rattle.
    document.addEventListener("pointerdown", press, { passive: true });
    return () => document.removeEventListener("pointerdown", press);
  }, [play]);

  useEffect(
    () => () => {
      score.current?.pause();
      score.current?.remove();
      score.current = null;
      void contextReference.current?.close();
      contextReference.current = null;
      busReference.current = null;
    },
    [],
  );

  const value = useMemo(
    () => ({ enabled, supported, toggle, enable, play, setSubmerge }),
    [enable, enabled, play, setSubmerge, supported, toggle],
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
