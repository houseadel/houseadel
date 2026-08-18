import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Coarse-pointer scenes render with the browser's input cadence instead of a
 * permanent animation loop. Scroll parallax and touch painting stay immediate,
 * while an idle phone does no GPU work.
 */
export function InputFrameInvalidator({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) return;
    const requestFrame = () => invalidate();
    const options: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", requestFrame, options);
    window.addEventListener("pointermove", requestFrame, options);
    window.addEventListener("touchmove", requestFrame, options);
    window.addEventListener("resize", requestFrame, options);
    invalidate();
    return () => {
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("pointermove", requestFrame);
      window.removeEventListener("touchmove", requestFrame);
      window.removeEventListener("resize", requestFrame);
    };
  }, [enabled, invalidate]);

  return null;
}
