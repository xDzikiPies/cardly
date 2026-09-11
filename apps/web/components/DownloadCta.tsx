import { StoreButtons } from "./StoreButtons";
import styles from "./DownloadCta.module.css";

export function DownloadCta() {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          Twoja wizytówka <em>czeka</em> w kieszeni
        </h2>
        <p className={styles.body}>Załóż konto w minutę i przestań szukać po kieszeniach kawałka kartonu.</p>
        <div className={styles.buttons}>
          <StoreButtons />
        </div>
      </div>
    </section>
  );
}
