import React from "react";
import { View, ViewStyle } from "react-native";

interface FadeInScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Wcześniej robił fade-in przy każdym przełączeniu zakładki — na telefonie
 * wyglądało to ociężale/wolno. Standardowe apki (Instagram, X itp.) w ogóle
 * nie animują zawartości przy zmianie zakładki, więc usunięto animację —
 * zakładki przełączają się teraz natychmiast. Nazwa/props zostają takie same,
 * żeby nie trzeba było zmieniać wszystkich ekranów, które go używają.
 */
export function FadeInScreen({ children, style }: FadeInScreenProps) {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
}
