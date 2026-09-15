import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle2,
  IdCard,
  QrCode,
  Send,
  Wifi,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionAnimation, ConnectionState } from "@/components/exchange/ConnectionAnimation";
import { QrPanel } from "@/components/exchange/QrPanel";
import { BusinessCardPreview } from "@/components/card/BusinessCardPreview";
import { useCardStore } from "@/store/useCardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { submitExchange } from "@/services/api";
import { initNfc, isNfcSupported, receiveCardOverNfc } from "@/lib/nfc";
import { isHceSupported, startBroadcastingUrl } from "@/lib/nfcHce";
import { buildCardShareUrl, extractCardIdFromShareUrl } from "@/lib/cardEncoding";
import { CARD_BACKGROUNDS } from "@/mocks/data";
import { ExchangeResult } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

type Role = "send" | "receive" | null;
type SendMode = "choice" | "nfc" | "qr";
type ReceiveMode = "choice" | "nfc" | "qr";

export default function ExchangeScreen() {
  const router = useRouter();
  const { card, isLoading, load, startNewCard } = useCardStore();
  const user = useAuthStore((s) => s.user);

  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [hceAvailable, setHceAvailable] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [sendMode, setSendMode] = useState<SendMode>("choice");
  const [receiveMode, setReceiveMode] = useState<ReceiveMode>("choice");
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [result, setResult] = useState<ExchangeResult | null>(null);
  const [stopBroadcast, setStopBroadcast] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    load();
    (async () => {
      await initNfc();
      setNfcAvailable(await isNfcSupported());
      setHceAvailable(isHceSupported());
    })();
  }, []);

  const reset = () => {
    stopBroadcast?.();
    setStopBroadcast(null);
    setRole(null);
    setSendMode("choice");
    setReceiveMode("choice");
    setConnectionState("idle");
    setResult(null);
  };

  const handleCreateCard = () => {
    startNewCard({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
    router.push("/card-editor");
  };

  // -------------------------------------------------------------------------
  // NADAWANIE (send)
  // -------------------------------------------------------------------------
  const startNfcSend = async () => {
    if (!card) return;
    setSendMode("nfc");
    setConnectionState("searching");

    try {
      const url = buildCardShareUrl(card);
      const stop = await startBroadcastingUrl(url, () => {
        setConnectionState("success");
      });
      setStopBroadcast(() => stop);
    } catch {
      setConnectionState("error");
    }
  };

  // -------------------------------------------------------------------------
  // ODBIERANIE (receive)
  // -------------------------------------------------------------------------
  const startNfcReceive = async () => {
    setReceiveMode("nfc");
    setConnectionState("searching");

    try {
      const url = await receiveCardOverNfc();
      await finishReceive("NFC", url);
    } catch {
      setConnectionState("error");
    }
  };

  const handleQrScanned = async (raw: string) => {
    await finishReceive("QR", raw);
  };

  const finishReceive = async (method: "NFC" | "QR", raw: string) => {
    const cardId = extractCardIdFromShareUrl(raw);
    if (!cardId) {
      setConnectionState("error");
      return;
    }
    try {
      const exchange = await submitExchange(method, cardId);
      setResult(exchange);
      setConnectionState("success");
    } catch {
      setConnectionState("error");
    }
  };

  const background = CARD_BACKGROUNDS.find((b) => b.id === card?.backgroundId) ?? CARD_BACKGROUNDS[0];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FadeInScreen>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <ScreenHeader
            title="Wymiana"
            description="Udostępnij swoją wizytówkę albo odbierz czyjąś — przez NFC (gdzie to możliwe) lub kod QR."
            right={
              role && (
                <Pressable onPress={reset} hitSlop={10}>
                  <ArrowLeft size={22} color={colors.textSecondary} />
                </Pressable>
              )
            }
          />

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : !card ? (
            <View style={styles.body}>
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <IdCard size={28} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Najpierw stwórz wizytówkę</Text>
                <Text style={styles.emptyDescription}>
                  Żeby wymienić się kontaktem, potrzebujesz własnej wizytówki do udostępnienia.
                </Text>
                <Button label="Stwórz wizytówkę" onPress={handleCreateCard} fullWidth />
              </Card>
            </View>
          ) : !role ? (
            <View style={styles.body}>
              <View style={styles.myCardPreview}>
                <BusinessCardPreview card={card} background={background} compact />
              </View>

              <Pressable onPress={() => setRole("send")}>
                <Card style={styles.roleCard}>
                  <View style={[styles.roleIconWrap, { backgroundColor: colors.primarySoft }]}>
                    <Send size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>Udostępnij swoją wizytówkę</Text>
                    <Text style={styles.roleSubtitle}>
                      {Platform.OS === "android" ? "Przez NFC albo kod QR" : "Pokaż kod QR do zeskanowania"}
                    </Text>
                  </View>
                </Card>
              </Pressable>

              <Pressable onPress={() => setRole("receive")}>
                <Card style={styles.roleCard}>
                  <View style={[styles.roleIconWrap, { backgroundColor: colors.successSoft }]}>
                    <QrCode size={22} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>Odbierz wizytówkę</Text>
                    <Text style={styles.roleSubtitle}>Zbliż telefon nadawcy albo zeskanuj jego kod QR</Text>
                  </View>
                </Card>
              </Pressable>
            </View>
          ) : role === "send" ? (
            <SendFlow
              card={card}
              background={background}
              sendMode={sendMode}
              setSendMode={setSendMode}
              connectionState={connectionState}
              hceAvailable={hceAvailable}
              onStartNfc={startNfcSend}
              onDone={reset}
            />
          ) : (
            <ReceiveFlow
              receiveMode={receiveMode}
              setReceiveMode={setReceiveMode}
              connectionState={connectionState}
              nfcAvailable={nfcAvailable}
              result={result}
              onStartNfc={startNfcReceive}
              onQrScanned={handleQrScanned}
              onDone={reset}
            />
          )}
        </ScrollView>
      </FadeInScreen>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Flow: nadawanie
// ---------------------------------------------------------------------------
function SendFlow({
  card,
  background,
  sendMode,
  setSendMode,
  connectionState,
  hceAvailable,
  onStartNfc,
  onDone,
}: any) {
  if (sendMode === "choice") {
    return (
      <View style={styles.body}>
        {hceAvailable ? (
          <>
            <Button label="Nadawaj przez NFC" icon={<Wifi size={16} color={colors.textOnPrimary} />} onPress={onStartNfc} fullWidth />
            <Text style={styles.orLabel}>albo</Text>
            <Button label="Pokaż kod QR" variant="secondary" onPress={() => setSendMode("qr")} fullWidth />
          </>
        ) : (
          <>
            <Card style={styles.infoCard}>
              <QrCode size={18} color={colors.primary} />
              <Text style={styles.infoText}>
                {Platform.OS === "ios"
                  ? "iPhone nie może wysyłać wizytówki przez NFC (ograniczenie systemu iOS) — użyj kodu QR."
                  : "NFC niedostępne na tym urządzeniu — użyj kodu QR."}
              </Text>
            </Card>
            <QrPanel myCard={card} onScanned={() => {}} shareOnly />
          </>
        )}
      </View>
    );
  }

  if (sendMode === "nfc") {
    return (
      <View style={styles.body}>
        <ConnectionAnimation
          state={connectionState}
          icon={<Wifi size={40} color={colors.primary} />}
          title={
            connectionState === "success"
              ? "Odczytano!"
              : connectionState === "error"
              ? "Coś poszło nie tak"
              : "Nadawanie aktywne"
          }
          subtitle={
            connectionState === "success"
              ? "Druga osoba odebrała Twoją wizytówkę"
              : connectionState === "error"
              ? "Spróbuj ponownie albo użyj kodu QR"
              : "Zbliż telefon odbiorcy do swojego"
          }
        />
        {connectionState === "success" ? (
          <Button label="Gotowe" onPress={onDone} fullWidth />
        ) : (
          <Button label="Anuluj" variant="ghost" onPress={onDone} fullWidth />
        )}
      </View>
    );
  }

  // qr
  return (
    <View style={styles.body}>
      <QrPanel myCard={card} onScanned={() => {}} shareOnly />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Flow: odbieranie
// ---------------------------------------------------------------------------
function ReceiveFlow({
  receiveMode,
  setReceiveMode,
  connectionState,
  nfcAvailable,
  result,
  onStartNfc,
  onQrScanned,
  onDone,
}: any) {
  if (connectionState === "success" && result) {
    const background = CARD_BACKGROUNDS.find((b: any) => b.id === result.card.backgroundId) ?? CARD_BACKGROUNDS[0];
    return (
      <View style={styles.successWrap}>
        <View style={styles.successBadge}>
          <CheckCircle2 size={40} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Wymieniono wizytówki!</Text>
        <Text style={styles.successSubtitle}>
          Otrzymałeś kontakt od {result.card.firstName} {result.card.lastName}
        </Text>
        <BusinessCardPreview card={result.card} background={background} />
        <Button label="Wróć" onPress={onDone} fullWidth />
      </View>
    );
  }

  if (receiveMode === "choice") {
    return (
      <View style={styles.body}>
        {nfcAvailable ? (
          <Button label="Odczytaj przez NFC" icon={<Wifi size={16} color={colors.textOnPrimary} />} onPress={onStartNfc} fullWidth />
        ) : (
          <Card style={styles.infoCard}>
            <QrCode size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>NFC niedostępne na tym urządzeniu — zeskanuj kod QR.</Text>
          </Card>
        )}
        {nfcAvailable && <Text style={styles.orLabel}>albo</Text>}
        <Button label="Zeskanuj kod QR" variant="secondary" onPress={() => setReceiveMode("qr")} fullWidth />
      </View>
    );
  }

  if (receiveMode === "nfc") {
    return (
      <View style={styles.body}>
        <ConnectionAnimation
          state={connectionState}
          icon={<Wifi size={40} color={colors.primary} />}
          title={connectionState === "error" ? "Nie udało się odczytać" : "Szukam nadawcy"}
          subtitle={
            connectionState === "error"
              ? "Spróbuj ponownie albo zeskanuj kod QR"
              : "Zbliż telefon osoby, która nadaje swoją wizytówkę"
          }
        />
        <Button label="Anuluj" variant="ghost" onPress={onDone} fullWidth />
      </View>
    );
  }

  // qr scan
  return (
    <View style={styles.body}>
      <QrPanel myCard={null as any} onScanned={onQrScanned} scanOnly />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  myCardPreview: { marginBottom: spacing.sm },

  roleCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  roleSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  orLabel: { ...typography.caption, color: colors.textMuted, textAlign: "center" },

  infoCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  infoText: { ...typography.caption, color: colors.textSecondary, flex: 1 },

  successWrap: { paddingHorizontal: spacing.xl, gap: spacing.lg, alignItems: "center" },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { ...typography.h1, color: colors.textPrimary },
  successSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center" },

  emptyCard: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xxl },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
  emptyDescription: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
