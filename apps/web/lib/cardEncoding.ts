export interface PublicBusinessCard {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company?: string;
  email: string;
  phone: string;
  workAddress?: string;
  backgroundId: string;
}

/**
 * MVP: dane wizytówki są zakodowane bezpośrednio w URL (base64url), więc strona
 * działa bez bazy danych — appka mobilna generuje link z pełnymi danymi karty.
 * TODO (gdy ruszy prawdziwy backend): zamienić na `/c/[cardId]` + GET /api/cards/public/:id,
 * a QR/link z apki będzie zawierał tylko ID zamiast całych danych.
 */
export function encodeCardToUrlParam(card: PublicBusinessCard): string {
  const json = JSON.stringify(card);
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCardFromUrlParam(param: string): PublicBusinessCard | null {
  try {
    const base64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json);

    if (!parsed.firstName || !parsed.lastName || !parsed.email) return null;
    return parsed as PublicBusinessCard;
  } catch {
    return null;
  }
}
