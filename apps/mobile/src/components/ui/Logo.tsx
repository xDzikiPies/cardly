import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 64 }: LogoProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.letter, { fontSize: size * 0.44 }]}>C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
});
