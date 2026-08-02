import styles from "./DrawnLine.module.css";

export function DrawnLine() {
  return (
    <div className={styles.line} aria-hidden="true">
      <svg viewBox="0 0 1600 3600" preserveAspectRatio="none" role="presentation">
        <path
          data-house-path
          pathLength="1"
          d="M122 70H792v328H389v410h904v406H716v-176H251v734h1128v461H1002v-184H516v707h803v368H813v420H203"
        />
      </svg>
    </div>
  );
}
