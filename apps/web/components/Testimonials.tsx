import styles from "./Testimonials.module.css";

const REVIEWS = [
  {
    quote: "W końcu nie muszę pamiętać, żeby mieć przy sobie pudełko wizytówek. Zbliżam telefon i po sprawie.",
    author: "Ola W.",
    role: "Fotografka",
    size: "large",
  },
  {
    quote: "Lista specjalistów pomogła mi znaleźć księgowego w mieście w 5 minut. Opinie zgadzały się z rzeczywistością.",
    author: "Marek T.",
    role: "Właściciel firmy",
    size: "small",
  },
  {
    quote: "Wygląda dużo lepiej niż zwykłe udostępnianie kontaktu. Rozmówcy pytają, jakiej appki używam.",
    author: "Julia K.",
    role: "Architektka wnętrz",
    size: "small",
  },
  {
    quote: "Historia wymian to strzał w dziesiątkę — nie zgubiłem kontaktu od miesięcy.",
    author: "Piotr Z.",
    role: "Doradca podatkowy",
    size: "medium",
  },
] as const;

export function Testimonials() {
  return (
    <section id="opinie" className={styles.section}>
      <h2 className={styles.title}>Ludzie już z tego korzystają</h2>
      <div className={styles.grid}>
        {REVIEWS.map((r) => (
          <figure key={r.author} className={styles.card} data-size={r.size}>
            <blockquote className={styles.quote}>&bdquo;{r.quote}&rdquo;</blockquote>
            <figcaption className={styles.caption}>
              <span className={styles.author}>{r.author}</span>
              <span className={styles.role}>{r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
