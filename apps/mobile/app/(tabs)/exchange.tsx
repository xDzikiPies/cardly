import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, IdCard, QrCode, Wifi } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NfcExchangePanel } from "@/components/exchange/NfcExchangePanel";
import { QrPanel } from "@/components/exchange/QrPanel";
import { BusinessCardPreview } from "@/components/card/BusinessCardPreview";
import { useCardStore } from "@/store/useCardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { submitExchange } from "@/services/api";
import { isNfcSupported, initNfc } from "@/lib/nfc";
import { CARD_BACKGROUNDS } from "@/mocks/data";
import { ExchangeResult } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

type Stage = "idle" | "scanning" | "success";

export default function ExchangeScreen() {
  const router = useRouter();
  const { card, isLoading, load, startNewCard } = useCardStore();
  const user = useAuthStore((s) => s.user);
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<ExchangeResult | null>(null);

  useEffect(() => {
    load();
    (async () => {
      await initNfc();
      setNfcAvailable(await isNfcSupported());
    })();
  }, []);

  const handleCreateCard = () => {
    startNewCard({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
    router.push("/card-editor");
  };

  const startNfcExchange = async () => {
    setStage("scanning");
    // W realnym flow: nasłuch NFC (receiveCardOverNfc) równolegle z zapisem własnej karty.
    // Tu — symulacja przez warstwę mock, żeby dało się przetestować cały UX bez sprzętu.
    const res = await submitExchange("NFC");
    setResult(res);
    setStage("success");
  };

  const handleQrScanned = async (_raw: string) => {
    const res = await submitExchange("QR");
    setResult(res);
    setStage("success");
  };

  const reset = () => {
    setStage("idle");
    setResult(null);
  };

  const background = CARD_BACKGROUNDS.find((b) => b.id === card?.backgroundId) ?? CARD_BACKGROUNDS[0];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
    <FadeInScreen>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Wymiana"
        description="Zbliż telefon do rozmówcy, żeby wymienić się wizytówkami przez NFC. Bez NFC? Użyj kodu QR."
      />

      {stage === "success" && result ? (
        <SuccessState result={result} onDone={reset} />
      ) : isLoading ? (
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
      ) : (
        <View style={styles.body}>
          {card && background && (
            <View style={styles.myCardPreview}>
              <BusinessCardPreview card={card} background={background} compact />
            </View>
          )}

          {nfcAvailable ? (
            <>
              <NfcExchangePanel status={stage === "scanning" ? "scanning" : "idle"} />
              {stage === "idle" ? (
                <Button
                  label="Rozpocznij wymianę NFC"
                  icon={<Wifi size={16} color={colors.textOnPrimary} />}
                  onPress={startNfcExchange}
                  fullWidth
                />
              ) : (
                <Button label="Anuluj" variant="ghost" onPress={reset} fullWidth />
              )}

              <Divider />

              <QrFallbackEntry onOpen={() => setStage("idle")} />
            </>
          ) : (
            <>
              <Card style={styles.infoCard}>
                <QrCode size={18} color={colors.primary} />
                <Text style={styles.infoText}>
                  Twój telefon nie obsługuje NFC (albo działasz w Expo Go) — użyj kodu QR poniżej.
                </Text>
              </Card>
              {card && <QrPanel myCard={card} onScanned={handleQrScanned} />}
            </>
          )}
        </View>
      )}
    </ScrollView>
    </FadeInScreen>
    </SafeAreaView>
  );
}

function QrFallbackEntry({ onOpen }: { onOpen: () => void }) {
  return (
    <Card style={styles.infoCard}>
      <QrCode size={18} color={colors.textMuted} />
      <Text style={styles.infoText}>Rozmówca bez NFC? Przewiń niżej — kod QR działa zawsze jako fallback.</Text>
    </Card>
  );
}

function SuccessState({ result, onDone }: { result: ExchangeResult; onDone: () => void }) {
  const background = CARD_BACKGROUNDS.find((b) => b.id === result.card.backgroundId) ?? CARD_BACKGROUNDS[0];
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
      <Button label="Zapisz do kontaktów" onPress={onDone} fullWidth />
      <Button label="Wróć" variant="ghost" onPress={onDone} fullWidth />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  myCardPreview: { marginBottom: spacing.sm },
  infoCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  infoText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.sm },
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
