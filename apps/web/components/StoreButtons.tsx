import styles from "./StoreButtons.module.css";

export function StoreButtons() {
  return (
    <div id="pobierz" className={styles.row}>
      <a href="#" className={styles.button}>
        <AppleGlyph />
        <span className={styles.text}>
          <span className={styles.small}>Pobierz w</span>
          <span className={styles.big}>App Store</span>
        </span>
      </a>
      <a href="#" className={styles.button}>
        <PlayGlyph />
        <span className={styles.text}>
          <span className={styles.small}>Dostępne w</span>
          <span className={styles.big}>Google Play</span>
        </span>
      </a>
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.36 1.43c.1 1.02-.29 2.02-.9 2.75-.63.75-1.68 1.34-2.7 1.26-.12-1 .33-2.04.93-2.72.66-.76 1.8-1.34 2.67-1.29zM20.9 17.1c-.32.74-.7 1.44-1.16 2.1-.62.9-1.13 1.53-1.53 1.87-.62.58-1.28.88-1.99.9-.51 0-1.13-.15-1.85-.44-.72-.29-1.38-.44-1.98-.44-.63 0-1.31.15-2.05.44-.74.3-1.34.45-1.8.47-.68.03-1.36-.28-2.03-.92-.44-.37-.98-1.03-1.62-1.97-.69-1-1.26-2.17-1.7-3.5-.47-1.43-.7-2.82-.7-4.16 0-1.53.33-2.86.99-3.96.52-.89 1.21-1.6 2.07-2.11.86-.51 1.79-.78 2.79-.8.55 0 1.29.17 2.22.51.93.34 1.53.51 1.79.51.2 0 .86-.2 1.98-.6 1.06-.37 1.95-.52 2.68-.46 1.98.16 3.46.94 4.45 2.35-1.77 1.07-2.64 2.57-2.63 4.5.01 1.5.55 2.75 1.62 3.74.48.46 1.02.81 1.62 1.06-.13.38-.27.75-.42 1.11z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 2.6c-.35.3-.55.75-.55 1.28v16.24c0 .53.2.98.55 1.28l.09.07L14 12.1v-.2L4.6 2.53z" opacity="0.9" />
      <path d="M17.2 15.34l-3.2-3.24v-.2l3.2-3.24 3.9 2.22c.72.4.72 1.06 0 1.46z" opacity="0.9" />
      <path d="M4.6 21.47c.24.15.53.16.85 0l9.55-5.44-3.15-3.19z" opacity="0.9" />
      <path d="M14 12.1l3.2-3.24-9.55-5.44c-.32-.18-.61-.15-.85 0z" opacity="0.9" />
    </svg>
  );
}
