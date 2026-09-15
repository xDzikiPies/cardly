import { Metadata } from "next";
import { getPublicCard } from "@/lib/getPublicCard";
import { getCardBackground } from "@/lib/cardBackgrounds";
import { vCardDataUri } from "@/lib/vcard";
import { StoreButtons } from "@/components/StoreButtons";
import { InteractiveBusinessCard } from "@/components/InteractiveBusinessCard";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchCard(id: string) {
  return getPublicCard(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await fetchCard(id);
  if (!card) return { title: "Wizytówka — Cardly" };

  return {
    title: `${card.firstName} ${card.lastName} — Cardly`,
    description: `${card.jobTitle}${card.company ? ` w ${card.company}` : ""}. Zapisz kontakt albo pobierz Cardly.`,
  };
}

export default async function PublicCardPage({ params }: PageProps) {
  const { id } = await params;
  const card = await fetchCard(id);

  if (!card) {
    return (
      <main className={styles.main}>
        <div className={styles.notFound}>
          <p className={styles.notFoundTitle}>Nie znaleziono tej wizytówki</p>
          <p className={styles.notFoundBody}>Link może być niepoprawny albo karta została usunięta.</p>
        </div>
      </main>
    );
  }

  const background = getCardBackground(card.backgroundId);
  const vcardHref = vCardDataUri({
    firstName: card.firstName,
    lastName: card.lastName,
    jobTitle: card.jobTitle,
    company: card.company ?? undefined,
    email: card.email,
    phone: card.phone,
    workAddress: card.workAddress ?? undefined,
    backgroundId: card.backgroundId,
  });

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <a href="/" className={styles.brand}>
          <span className={styles.brandMark}>C</span>
          Cardly
        </a>

        <InteractiveBusinessCard
          card={{
            firstName: card.firstName,
            lastName: card.lastName,
            jobTitle: card.jobTitle,
            company: card.company ?? undefined,
            email: card.email,
            phone: card.phone,
            workAddress: card.workAddress ?? undefined,
            backgroundId: card.backgroundId,
          }}
          background={background}
        />

        <div className={styles.details}>
          <DetailRow label="Email" value={card.email} href={`mailto:${card.email}`} />
          <DetailRow label="Telefon" value={card.phone} href={`tel:${card.phone}`} />
          {card.workAddress && <DetailRow label="Adres" value={card.workAddress} />}
        </div>

        <a href={vcardHref} download={`${card.firstName}_${card.lastName}.vcf`} className={styles.saveButton}>
          Zapisz kontakt
        </a>

        <div className={styles.appPrompt}>
          <p className={styles.appPromptText}>
            Wizytówki jak ta wymieniasz jednym zbliżeniem telefonu w aplikacji Cardly.
          </p>
          <StoreButtons />
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={styles.detailRow}>
        {content}
      </a>
    );
  }

  return <div className={styles.detailRow}>{content}</div>;
}
