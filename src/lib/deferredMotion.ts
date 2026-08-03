type GsapRuntime = (typeof import("./motion"))["gsap"];

export function deferMotion(
  setup: (gsap: GsapRuntime) => void | (() => void),
  delay = 1600,
) {
  let disposed = false;
  let cleanup: void | (() => void);
  const timer = window.setTimeout(() => {
    void import("./motion").then(({ gsap }) => {
      if (disposed) return;
      cleanup = setup(gsap);
    });
  }, delay);

  return () => {
    disposed = true;
    window.clearTimeout(timer);
    cleanup?.();
  };
}
