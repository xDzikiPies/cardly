import React, { useCallback, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { useFocusEffect } from "expo-router";

interface FadeInScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Owija zawartość zakładki i za każdym razem, gdy staje się ona aktywna
 * (użytkownik na nią przełącza), robi krótki fade-in zamiast twardego "cięcia".
 */
export function FadeInScreen({ children, style }: FadeInScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }, [opacity])
  );

  return <Animated.View style={[{ flex: 1 }, style, { opacity }]}>{children}</Animated.View>;
}
