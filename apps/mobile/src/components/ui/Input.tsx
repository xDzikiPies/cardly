import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  /** Styl na CAŁY komponent (wrapper), np. { flex: 1 } żeby dwa pola w rzędzie dzieliły szerokość po równo. */
  containerStyle?: ViewStyle;
}

export function Input({ label, icon, containerStyle, style, ...rest }: InputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.field}>
        {icon}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { ...typography.captionStrong, color: colors.textSecondary },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    textAlignVertical: "center",
    includeFontPadding: false,
    ...typography.body,
    color: colors.textPrimary,
  },
});
