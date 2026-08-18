import type { PointerEvent as ReactPointerEvent } from "react";

const MAX_OFFSET_PX = 14;

export function useMagneticHover(strength = 0.35) {
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const el = event.currentTarget;
    const bounds = el.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left - bounds.width / 2) * strength;
    const offsetY = (event.clientY - bounds.top - bounds.height / 2) * strength;
    el.style.setProperty("--magnet-x", `${clamp(offsetX)}px`);
    el.style.setProperty("--magnet-y", `${clamp(offsetY)}px`);
  };

  const onPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--magnet-x", "0px");
    event.currentTarget.style.setProperty("--magnet-y", "0px");
  };

  return { onPointerMove, onPointerLeave };
}

function clamp(value: number) {
  return Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, value));
}
