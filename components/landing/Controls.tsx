import styles from "./landing.module.css";

export default function Controls({
  paused,
  onTogglePlayback,
}: {
  paused: boolean;
  onTogglePlayback: () => void;
}) {
  return (
    <button
      className={styles.playback}
      type="button"
      aria-label={paused ? "Play slideshow" : "Pause slideshow"}
      data-paused={paused}
      onClick={onTogglePlayback}
    >
      <span className={styles.playIcon} aria-hidden="true" />
      <span className={styles.pauseIcon} aria-hidden="true" />
    </button>
  );
}
