import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
export { motionIsReduced, forcedColorsActive, pointerIsFine, interactionLayerDisabled } from "./preferences";
