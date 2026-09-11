import styles from "./Nav.module.css";

export function Nav() {
  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        <a href="#top" className={styles.logo}>
          <span className={styles.logoMark} />
          Cardly
        </a>
        <nav className={styles.links}>
          <a href="#funkcje">Funkcje</a>
          <a href="#wizytowki">Wizytówki</a>
          <a href="#opinie">Opinie</a>
        </nav>
      </div>
      <a href="#pobierz" className={styles.cta}>
        Pobierz
      </a>
    </header>
  );
}
