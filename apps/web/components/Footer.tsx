import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>C</span>
          Cardly
        </div>
        <nav className={styles.links}>
          <a href="#top">O aplikacji</a>
          <a href="#pobierz">Pobierz</a>
          <a href="mailto:kontakt@cardly.app">Kontakt</a>
        </nav>
      </div>
      <p className={styles.fine}>
        Otrzymałeś link do czyjejś wizytówki? Wygląda jak <code>cardly.app/c/...</code> — to publiczny
        podgląd karty, działa w każdej przeglądarce bez instalowania appki. To fallback na wypadek, gdy NFC nie
        zadziała.
      </p>
      <p className={styles.copyright}>© {new Date().getFullYear()} Cardly. Wszelkie prawa zastrzeżone.</p>
    </footer>
  );
}
