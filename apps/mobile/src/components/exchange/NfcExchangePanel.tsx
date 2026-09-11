import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Smartphone } from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/theme";

interface NfcExchangePanelProps {
  status: "idle" | "scanning" | "error";
}

/** Pulsujący okrąg + telefon — wizualna wskazówka "zbliż telefony do siebie". */
export function NfcExchangePanel({ status }: NfcExchangePanelProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== "scanning") return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={styles.wrapper}>
      <View style={styles.circleContainer}>
        {status === "scanning" && (
          <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity }]} />
        )}
        <View style={styles.circle}>
          <Smartphone size={40} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.title}>
        {status === "scanning" ? "Zbliż telefony do siebie" : "Gotowy do wymiany"}
      </Text>
      <Text style={styles.subtitle}>
        {status === "scanning"
          ? "Trzymaj oba telefony tyłem do siebie, blisko górnej krawędzi"
          : "Otwórz tę zakładkę na obu telefonach i zbliż je do siebie"}
      </Text>
    </View>
  );
}

const CIRCLE = 96;

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl },
  circleContainer: { alignItems: "center", justifyContent: "center", width: 160, height: 160 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.primary,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center", paddingHorizontal: spacing.xl },
});
