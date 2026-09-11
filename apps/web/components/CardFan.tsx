import styles from "./CardFan.module.css";

const CARDS = [
  {
    name: "Anna Kowalska",
    role: "Radca prawny",
    gradient: "linear-gradient(135deg, #161A2B, #2B2F4A)",
    color: "#fff",
    rotate: -10,
    x: -60,
    z: 1,
  },
  {
    name: "Kamil Nowicki",
    role: "Doradca finansowy",
    gradient: "linear-gradient(135deg, #6C5CE7, #5B4CF0)",
    color: "#fff",
    rotate: -2,
    x: 0,
    z: 3,
  },
  {
    name: "Katarzyna Dąbrowska",
    role: "Fotografka",
    gradient: "linear-gradient(135deg, #F7B8B0, #EAA2A2)",
    color: "#3A1F1F",
    rotate: 8,
    x: 60,
    z: 2,
  },
] as const;

export function CardFan() {
  return (
    <div className={styles.fan} aria-hidden="true">
      {CARDS.map((card, i) => (
        <div
          key={card.name}
          className={styles.card}
          style={{
            background: card.gradient,
            color: card.color,
            transform: `translateX(${card.x}px) rotate(${card.rotate}deg)`,
            zIndex: card.z,
            animationDelay: `${i * 90}ms`,
          }}
        >
          <div className={styles.cardTop}>
            <div className={styles.cardName}>{card.name}</div>
            <div className={styles.cardRole}>{card.role}</div>
          </div>
          <div className={styles.cardDot} />
        </div>
      ))}
    </div>
  );
}
