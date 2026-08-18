import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ReliefStage } from "../relief/ReliefStage";
import { CONTACT_SCULPTURE } from "../relief/sculptures";
import styles from "./CupidField.module.css";

/**
 * Cupid, standing to the right of the enquiry.
 *
 * This is Home's sculpture on a second route, not a second sculpture. Every part
 * of how it is drawn — the area-weighted point cloud, the marble lighting, the
 * silhouette that frays where the surface turns away from the camera, the
 * perimeter dust, the depth falloff, and the turn and lag the reader's own
 * travel drives — belongs to `ReliefStage` and is used here unchanged. Nothing
 * about the motion is restated: it is not passed at all, so Cupid inherits
 * exactly the numbers Love turns by. What is written out below is only what is
 * true of *this* sculpture in *this* composition: which cloud, how large it is,
 * and where in the frame it stands.
 *
 * The counterweight is the point. Contact is a column of type down the left, and
 * what sat opposite it was half a screen of nothing. Cupid is placed so the
 * figure runs off the bottom of the frame rather than being parked politely
 * inside it, because a subject that fits neatly reads as an illustration beside
 * a form; one that is cropped by the viewport reads as something the page is
 * standing in front of.
 */

/** `cupid.stl` stood upright: 65.35 wide over 130.00 tall, from the bake. */
const CUPID_ASPECT = 0.5027;

/**
 * Resolved once at module scope.
 *
 * `ReliefStage` keys its fetch on this string, so a value rebuilt per render
 * would be a new dependency every time the page re-rendered — every keystroke in
 * the questionnaire is a render — and a hundred and fifty thousand points would
 * be re-fetched and re-expanded behind each one. Held still, the cloud is read
 * once per visit, and `loadPointCloud` keeps the decode for the tab.
 */
const CUPID_CLOUD = CONTACT_SCULPTURE;

const CUPID_ALT = {
  en: "A luminous particle sculpture of a winged cupid, turning slowly.",
  id: "Patung partikel bercahaya berwujud sosok kupid bersayap, berputar perlahan.",
};

/**
 * Where Cupid stands, on a wide frame and on a narrow one.
 *
 * Two compositions, not one composition scaled. A media query cannot reach these
 * — they are arguments to a renderer, not properties of a box — so the
 * breakpoint is subscribed to and the whole placement swapped. The narrow one is
 * not the wide one squeezed: on a phone the sculpture comes back to the middle,
 * loses most of its crop and stands above the statement rather than opposite it,
 * because there is no second column for it to be opposite.
 *
 * `cameraY` carries the figure down so that the head sits high in the frame and
 * the viewport takes the shins and the base, which is the reason the sculpture
 * reads as continuing past the screen rather than as an object placed on it.
 *
 * The values are higher than for the figure that stood here before. That one was
 * tall and narrow — a little over two and a half times as high as it was wide —
 * and a third of a frame of lift left its head inside the top edge. Cupid is half
 * as wide again for its height, so the same lift cropped the head away; it needs
 * carrying further down before the crop lands on the shins rather than the face.
 */
const PLACEMENT = {
  wide: { modelScale: 1.45, modelX: 0.02, cameraY: 0.44 },
  compact: { modelScale: 1.15, modelX: 0, cameraY: 0.22 },
};

export function CupidField({
  progressRef,
  language,
}: {
  /** Travel through the Contact page, 0 to 1. Read per frame, never rendered. */
  progressRef: { current: number };
  language: "en" | "id";
}) {
  // The same breakpoint CupidField.module.css recomposes the field at.
  const compact = useMediaQuery("(max-width: 60rem)");
  const placement = compact ? PLACEMENT.compact : PLACEMENT.wide;

  return (
    <div className={styles.field} aria-hidden="true">
      <div className={styles.sculpture}>
        <ReliefStage
          mode="particles"
          restingSrc={CUPID_CLOUD}
          modelAspect={CUPID_ASPECT}
          modelScale={placement.modelScale}
          modelX={placement.modelX}
          cameraY={placement.cameraY}
          edgeParticles
          scrollRef={progressRef}
          /*
           * Home's own values. Nothing rests dispersed; the hand loosens what it
           * passes over and the surface closes again behind it.
           */
          disperse={0}
          hoverDisperse={1}
          grain={0.68}
          alt={CUPID_ALT[language]}
        />
      </div>
    </div>
  );
}
