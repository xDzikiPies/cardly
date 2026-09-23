import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Building2, Mail, MapPin, Phone } from "lucide-react-native";
import { BusinessCard, CardBackground } from "@/types";
import { radius, shadow, spacing, typography } from "@/theme";

interface BusinessCardPreviewProps {
  card: BusinessCard;
  background: CardBackground;
  compact?: boolean;
  /** Dodatkowa zawartość renderowana NA WIERZCHU karty, wewnątrz tego samego
   *  zaokrąglonego/przyciętego kontenera co gradient — np. efekt "shine" w TiltBusinessCard. */
  overlay?: React.ReactNode;
}

/** Karta 1.586:1 (proporcje jak fizyczna wizytówka), z gradientem tła i wzorem. */
export function BusinessCardPreview({ card, background, compact, overlay }: BusinessCardPreviewProps) {
  const { colorStart, colorEnd, textColor, pattern } = background;

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact, shadow.floating]}>
      <LinearGradient
        colors={[colorStart, colorEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <PatternOverlay pattern={pattern} tint={textColor} />

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {card.firstName} {card.lastName}
            </Text>
            <Text style={[styles.job, { color: textColor }]} numberOfLines={1}>
              {card.jobTitle}
            </Text>
          </View>
          {card.logoUrl ? (
            <View style={styles.logoDot} />
          ) : null}
        </View>

        <View style={styles.footer}>
          {card.company ? (
            <Row icon={<Building2 size={13} color={textColor} />} text={card.company} textColor={textColor} />
          ) : null}
          <Row icon={<Mail size={13} color={textColor} />} text={card.email} textColor={textColor} />
          <Row icon={<Phone size={13} color={textColor} />} text={card.phone} textColor={textColor} />
          {card.workAddress ? (
            <Row icon={<MapPin size={13} color={textColor} />} text={card.workAddress} textColor={textColor} />
          ) : null}
        </View>

        {overlay}
      </LinearGradient>
    </View>
  );
}

function Row({ icon, text, textColor }: { icon: React.ReactNode; text: string; textColor: string }) {
  return (
    <View style={styles.row}>
      {icon}
      <Text style={[styles.rowText, { color: textColor }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function PatternOverlay({ pattern, tint }: { pattern: CardBackground["pattern"]; tint: string }) {
  if (pattern === "none") return null;

  if (pattern === "dots") {
    return (
      <View style={styles.patternDotsWrap} pointerEvents="none">
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: tint, opacity: 0.08 }]} />
        ))}
      </View>
    );
  }

  if (pattern === "grid") {
    return (
      <View style={styles.patternGridWrap} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { backgroundColor: tint }]} />
        ))}
      </View>
    );
  }

  return <View style={[styles.waveShape, { backgroundColor: tint, opacity: 0.08 }]} pointerEvents="none" />;
}

const CARD_ASPECT = 1.586;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
    overflow: "hidden",
    aspectRatio: CARD_ASPECT,
    width: "100%",
  },
  wrapperCompact: {
    borderRadius: radius.md,
  },
  gradient: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  name: { ...typography.h1, fontSize: 20 },
  job: { ...typography.body, opacity: 0.85, marginTop: 2 },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  footer: { gap: 5 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowText: { ...typography.caption, opacity: 0.9 },

  patternDotsWrap: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  patternGridWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-evenly",
  },
  gridLine: { height: 1, opacity: 0.06, width: "100%" },
  waveShape: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -80,
    bottom: -100,
  },
});
