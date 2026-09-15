import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { colors, spacing, typography } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  description?: string;
  right?: React.ReactNode;
  /** Domyślnie true — ustaw false na ekranach modalnych, gdzie `right` to już np. przycisk zamknięcia. */
  showNotificationBell?: boolean;
  style?: ViewStyle;
}

/** Każdy ekran w Cardly zaczyna się od tego komponentu: tytuł + krótki opis sekcji. */
export function ScreenHeader({
  title,
  description,
  right,
  showNotificationBell = true,
  style,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <View style={styles.rightRow}>
        {right}
        {showNotificationBell && <NotificationBell />}
      </View>
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
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
});
