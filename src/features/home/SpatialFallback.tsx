import styles from "./SpatialFallback.module.css";

export function SpatialFallback() {
  return (
    <div className={styles.composition} aria-hidden="true" data-spatial-fallback>
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
