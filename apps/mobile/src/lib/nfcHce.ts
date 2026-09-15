import { Platform } from "react-native";

/**
 * Android-only: nadawanie własnej wizytówki jako emulowana karta NFC (HCE),
 * żeby odczytał ją DOWOLNY telefon (Android w trybie odczytu, ALBO iPhone przez CoreNFC —
 * oba czytają zwykłe tagi Type 4, a HCE właśnie taki tag emuluje).
 *
 * iPhone nie może być nadawcą — Apple nie udostępnia HCE stronom trzecim.
 * To nie jest ograniczenie tej biblioteki, tylko systemu iOS. Dlatego ta funkcja
 * na iOS zawsze rzuca NFC_HCE_UNAVAILABLE — ekran Wymiana ma wtedy pokazać QR zamiast tego.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
let HCESession: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
let NFCContentType: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
let NFCTagType4: any;

if (Platform.OS === "android") {
  try {
    const hce = require("react-native-hce");
    HCESession = hce.default;
    NFCContentType = hce.NFCContentType;
    NFCTagType4 = hce.NFCTagType4;
  } catch {
    HCESession = null;
  }
}

let activeSession: any = null;

export function isHceSupported(): boolean {
  return Platform.OS === "android" && !!HCESession;
}

/** Zaczyna nadawać podany URL jako emulowaną kartę NFC. Zwraca funkcję do zatrzymania. */
export async function startBroadcastingUrl(
  url: string,
  onRead?: () => void
): Promise<() => Promise<void>> {
  if (!isHceSupported()) throw new Error("NFC_HCE_UNAVAILABLE");

  const tag = new NFCTagType4(NFCContentType.URI, url);
  const session = await new HCESession(tag).start();
  activeSession = session;

  let removeListener: (() => void) | undefined;
  if (onRead) {
    removeListener = session.on(HCESession.Events.HCE_STATE_READ, onRead);
  }

  return async () => {
    removeListener?.();
    await session.terminate();
    activeSession = null;
  };
}

export async function stopBroadcasting(): Promise<void> {
  if (activeSession) {
    await activeSession.terminate();
    activeSession = null;
  }
}
