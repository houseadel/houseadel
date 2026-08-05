import { resolveAppUrl } from "../../lib/basePath";
import styles from "./SpatialFallback.module.css";

export function SpatialFallback() {
  return (
    <div className={styles.composition} aria-hidden="true" data-spatial-fallback>
      <picture className={styles.archivalImage} data-spatial-plane="image">
        <source srcSet={resolveAppUrl("/assets/open-access/met-390163-1600w.avif")} type="image/avif" />
        <img
          src={resolveAppUrl("/assets/open-access/met-390163-1600w.webp")}
          alt=""
          loading="eager"
          decoding="async"
        />
      </picture>
      <div className={styles.field} />
      <div className={`${styles.plane} ${styles.planeLeft}`} data-spatial-plane="left" />
      <div className={`${styles.plane} ${styles.planeRight}`} data-spatial-plane="right" />
      <div className={`${styles.plane} ${styles.planeFloor}`} data-spatial-plane="floor" />
      <div className={styles.aperture} data-spatial-aperture>
        <div className={styles.apertureInner} />
      </div>
      <div className={styles.vellum} data-spatial-plane="vellum" />
      <div className={styles.measurement} />
    </div>
  );
}
