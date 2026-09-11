import { PhoneFrame } from "./PhoneFrame";
import styles from "./AppShowcase.module.css";

export function AppShowcase() {
  return (
    <section id="wizytowki" className={styles.section}>
      <h2 className={styles.title}>Zobacz aplikację w akcji</h2>

      <div className={styles.row}>
        <div className={styles.side}>
          <PhoneFrame>
            <SpecialistsScreen />
          </PhoneFrame>
        </div>
        <div className={styles.center}>
          <PhoneFrame>
            <ProfileScreen />
          </PhoneFrame>
        </div>
        <div className={styles.side}>
          <PhoneFrame>
            <ReviewsScreen />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

function Row({ withBadge }: { withBadge?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: 8,
        borderRadius: 12,
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--metal)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "65%", height: 7, background: "var(--text)", opacity: 0.9, borderRadius: 4 }} />
        <div style={{ width: "40%", height: 6, background: "var(--text-faint)", borderRadius: 4, marginTop: 5 }} />
      </div>
      {withBadge && <div style={{ width: 22, height: 8, background: "var(--amber)", borderRadius: 4 }} />}
    </div>
  );
}

function SpecialistsScreen() {
  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Specjaliści</div>
      <div style={{ height: 32, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)" }} />
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 20,
              width: 46,
              borderRadius: 100,
              background: i === 0 ? "var(--metal)" : "var(--surface)",
              border: "1px solid var(--line)",
            }}
          />
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <Row key={i} withBadge />
      ))}
    </>
  );
}

function ProfileScreen() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--metal)" }} />
      <div style={{ width: 90, height: 10, background: "var(--text)", borderRadius: 4 }} />
      <div style={{ width: 60, height: 7, background: "var(--text-faint)", borderRadius: 4 }} />
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: "var(--amber)" }} />
        ))}
      </div>
      <div style={{ width: "100%", height: 40, borderRadius: 12, background: "var(--metal)", marginTop: 16 }} />
      <div style={{ width: "100%", height: 34, borderRadius: 12, border: "1px solid var(--line)" }} />
      <div style={{ width: "100%", flex: 1, borderRadius: 14, border: "1px solid var(--line)", marginTop: 12 }} />
    </div>
  );
}

function ReviewsScreen() {
  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Opinie</div>
      <div
        style={{
          borderRadius: 14,
          border: "1px solid var(--line)",
          background: "var(--surface)",
          padding: 14,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text)" }}>4.9</div>
        <div style={{ display: "flex", gap: 3, justifyContent: "center", margin: "6px 0" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: "var(--amber)" }} />
          ))}
        </div>
        <div style={{ fontSize: 9, color: "var(--text-faint)" }}>128 opinii</div>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", padding: 10 }}
        >
          <div style={{ width: "50%", height: 7, background: "var(--text)", opacity: 0.9, borderRadius: 4 }} />
          <div style={{ width: "90%", height: 6, background: "var(--text-faint)", borderRadius: 4, marginTop: 8 }} />
          <div style={{ width: "70%", height: 6, background: "var(--text-faint)", borderRadius: 4, marginTop: 5 }} />
        </div>
      ))}
    </>
  );
}
