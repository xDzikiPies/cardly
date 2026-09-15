import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BusinessCard } from "@/types";
import { buildCardShareUrl } from "@/lib/cardEncoding";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, radius, spacing, typography } from "@/theme";

interface QrPanelProps {
  myCard: BusinessCard | null;
  onScanned: (raw: string) => void;
  /** Tylko pokazuje QR, bez przełącznika na skan (używane w osobnym flow "Udostępnij"). */
  shareOnly?: boolean;
  /** Tylko skanuje, bez przełącznika na pokaż (używane w osobnym flow "Odbierz"). */
  scanOnly?: boolean;
}

export function QrPanel({ myCard, onScanned, shareOnly, scanOnly }: QrPanelProps) {
  const [mode, setMode] = useState<"show" | "scan">(scanOnly ? "scan" : "show");
  const [permission, requestPermission] = useCameraPermissions();

  if (mode === "show" && myCard) {
    // Kodujemy URL, nie surowe dane — dzięki temu ten sam kod QR działa jako fallback:
    // otwarty w przeglądarce (bez apki) pokazuje wizytówkę na stronie cardly.app/c/...
    const shareUrl = buildCardShareUrl(myCard);

    return (
      <View style={styles.wrapper}>
        <Card style={styles.qrCard}>
          <QRCode value={shareUrl} size={220} color={colors.textPrimary} backgroundColor={colors.surface} />
        </Card>
        <Text style={styles.hint}>
          Pokaż ten kod drugiej osobie — zadziała w apce Cardly, a bez niej otworzy Twoją wizytówkę w przeglądarce
        </Text>
        {!shareOnly && <Button label="Zamiast tego zeskanuj kod" variant="ghost" onPress={() => setMode("scan")} />}
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.hint}>Potrzebujemy dostępu do aparatu, żeby zeskanować kod</Text>
        <Button label="Zezwól na dostęp do aparatu" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.scannerBox}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => onScanned(data)}
        />
      </View>
      <Text style={styles.hint}>Wyceluj aparat w kod QR drugiej osoby</Text>
      {!scanOnly && myCard && (
        <Button label="Zamiast tego pokaż mój kod" variant="ghost" onPress={() => setMode("show")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg },
  qrCard: { alignItems: "center", justifyContent: "center", padding: spacing.xl },
  scannerBox: {
    width: 260,
    height: 260,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
  },
  hint: { ...typography.body, color: colors.textSecondary, textAlign: "center", paddingHorizontal: spacing.xl },
});
