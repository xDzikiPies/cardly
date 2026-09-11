import { PublicBusinessCard } from "./cardEncoding";

export function buildVCard(card: PublicBusinessCard): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${card.lastName};${card.firstName};;;`,
    `FN:${card.firstName} ${card.lastName}`,
    card.company ? `ORG:${card.company}` : null,
    `TITLE:${card.jobTitle}`,
    `EMAIL:${card.email}`,
    `TEL;TYPE=WORK,VOICE:${card.phone}`,
    card.workAddress ? `ADR;TYPE=WORK:;;${card.workAddress};;;;` : null,
    "END:VCARD",
  ].filter(Boolean);

  return lines.join("\n");
}

export function vCardDataUri(card: PublicBusinessCard): string {
  const vcard = buildVCard(card);
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
}
