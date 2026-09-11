import { CardFan } from "./CardFan";
import { StoreButtons } from "./StoreButtons";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Nowość · NFC i kod QR w każdej wizytówce
        </div>

        <h1 className={styles.headline}>
          Twoja wizytówka.
          <br />
          Zawsze pod ręką.
        </h1>

        <p className={styles.sub}>
          Cardly łączy cyfrowe wizytówki, katalog zweryfikowanych specjalistów i opinie,
          którym można ufać. Jedno miejsce, żeby się pokazać i znaleźć właściwą osobę.
        </p>

        <StoreButtons />
      </div>

      <div className={styles.visual}>
        <CardFan />
      </div>
    </section>
  );
}
