import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Lock } from "lucide-react-native";
import { CardBackground } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

interface BackgroundPickerProps {
  backgrounds: CardBackground[];
  selectedId: string;
  onSelect: (bg: CardBackground) => void;
}

export function BackgroundPicker({ backgrounds, selectedId, onSelect }: BackgroundPickerProps) {
  return (
    <View>
      <Text style={styles.label}>Tło wizytówki</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {backgrounds.map((bg) => {
          const isSelected = bg.id === selectedId;
          return (
            <Pressable key={bg.id} onPress={() => onSelect(bg)} style={styles.item}>
              <LinearGradient
                colors={[bg.colorStart, bg.colorEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.swatch, isSelected && styles.swatchSelected]}
              >
                {isSelected ? (
                  <View style={styles.badge}>
                    <Check size={14} color="#FFFFFF" />
                  </View>
                ) : bg.isPremium ? (
                  <View style={styles.badge}>
                    <Lock size={12} color="#FFFFFF" />
                  </View>
                ) : null}
              </LinearGradient>
              <Text style={styles.name} numberOfLines={1}>
                {bg.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const SWATCH_SIZE = 56;

const styles = StyleSheet.create({
  label: {
    ...typography.captionStrong,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: { gap: spacing.md, paddingRight: spacing.lg },
  item: { alignItems: "center", width: SWATCH_SIZE + 8, gap: 6 },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: radius.md,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: {
    borderColor: colors.primary,
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { ...typography.tiny, color: colors.textSecondary },
});
