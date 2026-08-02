import type { CSSProperties } from "react";
import type { Edition, EditionPlateKind } from "../../data/editions";
import styles from "./EditionPlate.module.css";

type EditionPlateProps = {
  edition: Edition;
  assetIndex?: number;
  caption?: boolean;
};

type EditionPlateStyle = CSSProperties & {
  "--plate-field": string;
  "--plate-paper": string;
  "--plate-ink": string;
  "--plate-signature": string;
  "--plate-metal": string;
};

function PlateDrawing({ kind }: { kind: EditionPlateKind }) {
  if (kind === "aperture") {
    return (
      <>
        <path className={styles.signatureFill} d="M192 388V192C192 105 263 34 350 34s158 71 158 158v196H192Z" />
        <path className={styles.paperFill} d="M248 388V196c0-57 46-103 102-103s102 46 102 103v192H248Z" />
        <path className={styles.inkLine} d="M121 432h458M350 16v416" />
        <circle className={styles.metalFill} cx="350" cy="93" r="5" />
      </>
    );
  }

  if (kind === "fold") {
    return (
      <>
        <path className={styles.paperFill} d="M104 62h276v352H104z" />
        <path className={styles.paperRaised} d="m380 62 216 48v304H380z" />
        <path className={styles.signatureLine} d="M380 62v352M132 112h169M132 142h111M421 166h132M421 196h91" />
        <path className={styles.metalLine} d="M84 414h532" />
        <circle className={styles.signatureFill} cx="380" cy="298" r="27" />
      </>
    );
  }

  if (kind === "ledger") {
    return (
      <>
        <path className={styles.paperRaised} d="M124 50h452v364H124z" />
        <path className={styles.inkLine} d="M178 116h344M178 178h344M178 240h344M178 302h344M270 86v260" />
        <path className={styles.signatureLine} d="M300 146h180M300 208h112M300 270h150" />
        <circle className={styles.signatureFill} cx="213" cy="147" r="6" />
        <circle className={styles.metalFill} cx="213" cy="209" r="6" />
        <circle className={styles.inkFill} cx="213" cy="271" r="6" />
      </>
    );
  }

  if (kind === "window") {
    return (
      <>
        <rect className={styles.paperFill} x="116" y="48" width="468" height="364" />
        <rect className={styles.signatureSoftFill} x="188" y="100" width="324" height="260" />
        <rect className={styles.paperRaised} x="262" y="145" width="176" height="170" />
        <path className={styles.metalLine} d="M90 230h520M350 30v404" />
        <path className={styles.inkLine} d="M262 315h176" />
      </>
    );
  }

  if (kind === "seal") {
    return (
      <>
        <path className={styles.paperRaised} d="M92 94h516v276H92z" />
        <path className={styles.metalLine} d="M92 150h516M92 316h516" />
        <path className={styles.inkLine} d="M166 226h368" />
        <circle className={styles.signatureFill} cx="350" cy="226" r="68" />
        <circle className={styles.paperFill} cx="350" cy="226" r="49" />
        <path className={styles.signatureLine} d="m325 226 17 17 35-39" />
      </>
    );
  }

  return (
    <>
      <rect className={styles.paperRaised} x="98" y="58" width="504" height="348" />
      <path className={styles.inkLine} d="M145 124h410M145 188h410M145 252h410M145 316h410" />
      <path className={styles.metalLine} d="M218 92v252M482 92v252" />
      <path className={styles.signatureLine} d="M248 155h204M248 219h148M248 283h184" />
      <rect className={styles.signatureFill} x="204" y="149" width="9" height="12" />
      <rect className={styles.signatureFill} x="204" y="213" width="9" height="12" />
      <rect className={styles.signatureFill} x="204" y="277" width="9" height="12" />
    </>
  );
}

export function EditionPlate({ edition, assetIndex = 0, caption = true }: EditionPlateProps) {
  const asset = edition.theme.imageSet[assetIndex] ?? edition.theme.imageSet[0];
  const plateStyle: EditionPlateStyle = {
    "--plate-field": edition.theme.palette.field,
    "--plate-paper": edition.theme.palette.paper,
    "--plate-ink": edition.theme.palette.ink,
    "--plate-signature": edition.theme.palette.signature,
    "--plate-metal": edition.theme.palette.metal,
  };

  return (
    <figure className={styles.figure} style={plateStyle} data-reveal-mask={edition.theme.revealMask}>
      <div className={styles.field}>
        <svg
          className={styles.drawing}
          viewBox="0 0 700 460"
          role="img"
          aria-label={asset.alt}
          xmlns="http://www.w3.org/2000/svg"
        >
          <PlateDrawing kind={asset.kind} />
        </svg>
        <p className={styles.number} aria-hidden="true">
          {edition.theme.metadata.editionNumber}
        </p>
        <p className={styles.title} aria-hidden="true">
          {edition.title}
        </p>
      </div>
      {caption ? (
        <figcaption className={styles.caption}>
          {edition.title} — original House Adel Edition plate.
        </figcaption>
      ) : null}
    </figure>
  );
}
