import { BusinessCard } from "@/types";
import { buildCardShareUrl } from "@/lib/cardEncoding";

/**
 * UWAGA: react-native-nfc-manager to natywny moduł.
 * W Expo Go NIE zadziała — potrzebny jest development build
 * (`npx expo run:android` albo `eas build --profile development`).
 * Ten plik celowo robi `require` w try/catch, żeby reszta apki (i Expo Go)
 * dało się uruchomić bez natywnego modułu — po prostu NFC zgłosi "niedostępne"
 * i UI przechodzi na fallback QR.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
let NfcManager: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
let NfcTech: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
let Ndef: any;

try {
  const nfc = require("react-native-nfc-manager");
  NfcManager = nfc.default;
  NfcTech = nfc.NfcTech;
  Ndef = nfc.Ndef;
} catch {
  NfcManager = null;
}

export async function isNfcSupported(): Promise<boolean> {
  if (!NfcManager) return false;
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

export async function initNfc(): Promise<void> {
  if (!NfcManager) return;
  await NfcManager.start();
}

/**
 * Zapisuje URL do publicznej wizytówki jako rekord NDEF typu URI (nie JSON).
 * To ważne: telefon BEZ apki Cardly, po zbliżeniu, i tak sam otworzy ten link
 * w przeglądarce — to standardowe, natywne zachowanie systemu przy tagach NFC
 * z rekordem URI. Dzięki temu URL działa jako fallback nawet dla NFC, nie tylko dla QR.
 * W praktyce host-card-emulation / peer-to-peer NFC dla dwóch telefonów wymaga
 * dodatkowej konfiguracji natywnej (Android Beam / Reader mode + HCE) —
 * tutaj mamy gotowy szkielet: request tech -> zapis NDEF -> zamknięcie sesji.
 */
export async function shareCardOverNfc(card: BusinessCard): Promise<void> {
  if (!NfcManager) throw new Error("NFC_UNAVAILABLE");

  const shareUrl = buildCardShareUrl(card);

  await NfcManager.requestTechnology(NfcTech.Ndef);
  try {
    const payload = Ndef.encodeMessage([Ndef.uriRecord(shareUrl)]);
    if (payload) {
      await NfcManager.ndefHandler.writeNdefMessage(payload);
    }
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}

/** Nasłuch na przychodzący tag NDEF z linkiem do wizytówki drugiej osoby. */
export async function receiveCardOverNfc(): Promise<string> {
  if (!NfcManager) throw new Error("NFC_UNAVAILABLE");

  await NfcManager.requestTechnology(NfcTech.Ndef);
  try {
    const tag = await NfcManager.getTag();
    const record = tag?.ndefMessage?.[0];
    if (!record) throw new Error("NO_NDEF_RECORD");
    // Rekord URI ma na początku 1 bajt "prefiksu" (np. "https://") wg specyfikacji NDEF
    const url = Ndef.uri.decodePayload(new Uint8Array(record.payload));
    return url;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}
