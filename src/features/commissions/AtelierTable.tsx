import styles from "./AtelierTable.module.css";

export function AtelierTable() {
  return (
    <figure className={styles.figure} aria-labelledby="atelier-table-caption">
      <div className={styles.table} aria-hidden="true">
        <div className={`${styles.fragment} ${styles.photoFragment}`}>
          <svg viewBox="0 0 360 260" role="presentation">
            <defs>
              <linearGradient id="atelier-light" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ded5c6" />
                <stop offset="0.48" stopColor="#8e8173" />
                <stop offset="1" stopColor="#392b2c" />
              </linearGradient>
            </defs>
            <rect width="360" height="260" fill="url(#atelier-light)" />
            <path d="M-10 224 145 70l78 190Z" fill="#f3eee4" fillOpacity=".55" />
            <path d="M190-15 366 32v116L242 91Z" fill="#6f2431" fillOpacity=".42" />
            <rect x="22" y="20" width="316" height="220" fill="none" stroke="#eee6da" strokeOpacity=".58" />
          </svg>
          <span>Light study / oblique interior</span>
        </div>

        <div className={`${styles.fragment} ${styles.mapFragment}`}>
          <svg viewBox="0 0 360 230" role="presentation">
            <path d="M18 193C67 174 69 121 116 106s77 24 118-6 37-61 109-73" />
            <path d="M-4 154c62-5 88 18 132 1s48-65 100-64 57 22 140 3" />
            <path d="M35 228c2-65 56-70 77-108S112 47 159 8" />
            <circle cx="117" cy="106" r="5" />
            <circle cx="234" cy="100" r="5" />
            <path className={styles.route} d="m117 106 40 24 77-30" />
          </svg>
          <span>Route / sequence / threshold</span>
        </div>

        <div className={`${styles.fragment} ${styles.dateFragment}`}>
          <small>Date</small>
          <strong>DAY / MONTH / YEAR</strong>
          <span>Before dusk · late evening</span>
        </div>

        <div className={`${styles.fragment} ${styles.lineFragment}`}>
          <span>Keep one room for silence.</span>
        </div>

        <div className={`${styles.fragment} ${styles.paperFragment}`}>
          <span>Vellum</span>
          <span>Warm stock</span>
          <span>Oxblood ink</span>
        </div>

        <div className={`${styles.fragment} ${styles.planFragment}`}>
          <svg viewBox="0 0 350 260" role="presentation">
            <path d="M24 22h298v215H24zM24 105h117V22m0 83v132m0-72h181M245 22v143M141 207h104" />
            <path d="M110 105a31 31 0 0 0 31 31M214 165a31 31 0 0 1 31 31" />
            <path d="M36 249h276M36 243v12m276-12v12" />
          </svg>
          <span>Unlocated plan / threshold study</span>
        </div>

        <div className={`${styles.fragment} ${styles.typeFragment}`}>
          <span>ONE</span>
          <span>OF</span>
          <span>ONE</span>
        </div>

        <div className={styles.measurement}>
          <span>01</span>
          <span>Scale follows the story</span>
          <span>12</span>
        </div>
      </div>
      <figcaption id="atelier-table-caption">
        Light, route, date, language, paper and plan held apart before they are composed.
      </figcaption>
    </figure>
  );
}
