import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function motionIsReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
