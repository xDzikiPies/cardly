import { BusinessCard } from "@/types";

/**
 * Ten sam schemat kodowania co w apps/web/lib/cardEncoding.ts — celowo NIE używamy
 * tu `Buffer` ani `btoa` (mogą nie być dostępne w silniku Hermes), tylko czysty JS.
 *
 * TODO (gdy ruszy prawdziwy backend): zamiast kodować całą kartę w URL-u,
 * wysyłaj wizytówkę do API i buduj link tylko z jej ID: `${WEB_URL}/c/${cardId}`.
 */
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://cardly.app";

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64FromBytes(bytes: Uint8Array): string {
  let output = "";
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    const b2 = i < bytes.length ? bytes[i++] : NaN;
    const b3 = i < bytes.length ? bytes[i++] : NaN;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const enc3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const enc4 = isNaN(b3) ? 64 : b3 & 63;

    output +=
      BASE64_CHARS[enc1] +
      BASE64_CHARS[enc2] +
      (enc3 === 64 ? "=" : BASE64_CHARS[enc3]) +
      (enc4 === 64 ? "=" : BASE64_CHARS[enc4]);
  }
  return output;
}

function encodeUrlSafeBase64(json: string): string {
  const bytes = new TextEncoder().encode(json);
  const base64 = base64FromBytes(bytes);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Buduje publiczny link do wizytówki — działa w każdej przeglądarce, bez apki. */
export function buildCardShareUrl(card: BusinessCard): string {
  const payload = {
    firstName: card.firstName,
    lastName: card.lastName,
    jobTitle: card.jobTitle,
    company: card.company,
    email: card.email,
    phone: card.phone,
    workAddress: card.workAddress,
    backgroundId: card.backgroundId,
  };
  const encoded = encodeUrlSafeBase64(JSON.stringify(payload));
  return `${WEB_URL}/c/${encoded}`;
}
