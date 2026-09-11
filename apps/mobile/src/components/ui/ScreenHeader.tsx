import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, spacing, typography } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  description?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

/** Każdy ekran w Cardly zaczyna się od tego komponentu: tytuł + krótki opis sekcji. */
export function ScreenHeader({ title, description, right, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  right: {
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
});
