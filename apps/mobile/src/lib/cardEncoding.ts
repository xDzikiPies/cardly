import { BusinessCard } from "@/types";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://cardly.app";

/** Buduje publiczny link do wizytówki — /c/{id}. Zawsze pokazuje AKTUALNE dane
 *  (bo web czyta je live z backendu po ID), nie zamrożoną kopię sprzed edycji. */
export function buildCardShareUrl(card: BusinessCard): string {
  return `${WEB_URL}/c/${card.id}`;
}

/** Wyciąga samo ID karty z zeskanowanego/odczytanego linku (`.../c/<id>`). */
export function extractCardIdFromShareUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const segments = url.pathname.split("/").filter(Boolean);
    const cIndex = segments.indexOf("c");
    if (cIndex === -1 || !segments[cIndex + 1]) return null;
    return segments[cIndex + 1];
  } catch {
    return null;
  }
}
