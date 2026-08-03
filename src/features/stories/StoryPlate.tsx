import type { Story, StoryPlateKind } from "../../data/stories";
import { ArchivalImage } from "../../components/editorial/ArchivalImage";
import { archivalAssets } from "../../data/archivalAssets";
import styles from "./StoryPlate.module.css";

function PlateDrawing({ kind }: { kind: StoryPlateKind }) {
  if (kind === "arch") {
    return (
      <>
        <path className={styles.garnet} d="M170 370V184C170 98 238 30 324 30s154 68 154 154v186H170Z" />
        <path className={styles.paper} d="M222 370V187c0-56 46-102 102-102s102 46 102 102v183H222Z" />
        <path className={styles.line} d="M78 404h492M324 10v394" />
        <path className={styles.metalLine} d="M112 82h96M440 82h96" />
      </>
    );
  }

  if (kind === "folio") {
    return (
      <>
        <path className={styles.paper} d="M72 64h270v326H72z" />
        <path className={styles.paperRaised} d="m342 64 236 42v284H342z" />
        <path className={styles.garnetLine} d="M342 64v326M110 126h164M110 158h114M382 172h138M382 204h94" />
        <circle className={styles.garnet} cx="342" cy="286" r="25" />
        <path className={styles.metalLine} d="M54 390h542" />
      </>
    );
  }

  if (kind === "atlas") {
    return (
      <>
        <path className={styles.paper} d="M68 80h206v146H68zM358 68h232v178H358zM116 278h250v118H116z" />
        <path className={styles.paperRaised} d="m414 276 164 26-30 100-164-26z" />
        <path className={styles.garnetLine} d="M91 352c82-112 122-78 176-158 54-80 126-13 214-98" />
        <circle className={styles.garnet} cx="91" cy="352" r="8" />
        <circle className={styles.garnet} cx="481" cy="96" r="8" />
        <path className={styles.metalLine} d="M88 108h166M390 110h166M390 142h106M142 314h168M142 344h96" />
      </>
    );
  }

  return (
    <>
      <rect className={styles.paper} x="74" y="58" width="500" height="342" />
      <rect className={styles.garnetSoft} x="158" y="110" width="330" height="238" />
      <rect className={styles.paperRaised} x="230" y="151" width="186" height="156" />
      <path className={styles.metalLine} d="M54 230h540M324 32v394" />
      <path className={styles.line} d="M230 307h186" />
    </>
  );
}

export function StoryPlate({ story }: { story: Story }) {
  const archivalAsset = story.slug.includes("correspondence")
    ? archivalAssets.drawingRoom
    : archivalAssets.interior;

  return (
    <figure className={styles.figure}>
      <div className={styles.field}>
        <ArchivalImage asset={archivalAsset} alt={archivalAsset.alt} />
        <div className={styles.imageVeil} aria-hidden="true" />
        <svg viewBox="0 0 648 454" role="img" aria-label={story.plate.alt}>
          <PlateDrawing kind={story.plate.kind} />
        </svg>
        <p className={styles.category} aria-hidden="true">
          {story.category}
        </p>
        <p className={styles.year} aria-hidden="true">
          {story.year}
        </p>
      </div>
      <figcaption>
        Original House Adel plate for {story.title}. Archival reference: {archivalAsset.title}; The
        Metropolitan Museum of Art, Public Domain.
      </figcaption>
    </figure>
  );
}
