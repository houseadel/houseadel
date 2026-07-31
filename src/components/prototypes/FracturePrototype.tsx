import { PrototypeShell } from "../PrototypeShell";
import { FractureNexus } from "./FractureNexus";

export function FracturePrototype() {
  return (
    <PrototypeShell
      className="prototype-page--fracture"
      label="Prototype A / low-cost system"
      title="SVG / DOM fracture"
      note="Semantic links own navigation. Graphic panes and GSAP supply the spatial idea; this is also the required no-WebGL fallback."
    >
      <FractureNexus />
    </PrototypeShell>
  );
}
