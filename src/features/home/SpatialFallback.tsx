import styles from "./SpatialFallback.module.css";

export function SpatialFallback() {
  return (
    <div className={styles.composition} aria-hidden="true" data-spatial-fallback>
      <div className={styles.field} />
      <div className={`${styles.plane} ${styles.planeLeft}`} />
      <div className={`${styles.plane} ${styles.planeRight}`} />
      <div className={`${styles.plane} ${styles.planeFloor}`} />
      <div className={styles.aperture}>
        <div className={styles.apertureInner} />
      </div>
      <div className={styles.vellum} />
      <div className={styles.measurement} />
    </div>
  );
}
