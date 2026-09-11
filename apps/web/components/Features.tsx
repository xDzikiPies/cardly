import { IdCard, Radar, Repeat, History } from "lucide-react";
import styles from "./Features.module.css";

const STATS = [
  { value: "10 000+", label: "aktywnych wizytówek" },
  { value: "4.9", label: "średnia ocen specjalistów" },
  { value: "3 s", label: "średni czas wymiany kontaktu" },
];

const FEATURES = [
  {
    icon: IdCard,
    title: "Edytor na żywo",
    body: "Wpisz dane, wybierz jedno z gotowych teł, zobacz zmiany od razu na podglądzie. Bez grafika, bez Canvy.",
  },
  {
    icon: Repeat,
    title: "NFC i kod QR",
    body: "Zero wpisywania numerów. Przyłóż telefon do telefonu — a jeśli ktoś nie ma NFC, zeskanujcie kod QR.",
  },
  {
    icon: Radar,
    title: "Katalog specjalistów",
    body: "Szukaj po zawodzie, mieście i promieniu. Sprawdź opinie, zanim zadzwonisz.",
  },
  {
    icon: History,
    title: "Historia wymian",
    body: "Każda wymiana zapisuje się automatycznie — z datą i pełnymi danymi kontaktowymi.",
  },
] as const;

export function Features() {
  return (
    <section id="funkcje" className={styles.section}>
      <div className={styles.stats}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <h2 className={styles.title}>
        Wszystko, czego potrzebuje
        <br />
        nowoczesny profesjonalista
      </h2>

      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.card}>
            <div className={styles.iconWrap}>
              <f.icon size={20} color="#17171c" strokeWidth={2.2} />
            </div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardBody}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
