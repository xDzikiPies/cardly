import React, { useCallback, useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { colors } from "@/theme";

// Nie chowaj natywnego splash screena automatycznie — zrobimy to sami,
// dopiero jak sprawdzimy sesję użytkownika (patrz niżej).
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isCheckingSession, isAuthenticated, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  // Chowamy natywny splash dopiero gdy wiemy, czy user jest zalogowany —
  // dzięki temu nie ma "mrugnięcia" ekranem logowania tuż przed pokazaniem apki.
  const onLayoutRootView = useCallback(async () => {
    if (!isCheckingSession) {
      await SplashScreen.hideAsync();
    }
  }, [isCheckingSession]);

  if (isCheckingSession) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 220,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          {/* Niezalogowany -> tylko ekrany logowania/rejestracji są dostępne */}
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          {/* Zalogowany -> reszta apki */}
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="card-editor"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="become-specialist"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="specialist/[id]" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="conversations" />
            <Stack.Screen name="conversation/[id]" />
            <Stack.Screen name="job/[id]" />
            <Stack.Screen
              name="job-editor"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack.Protected>
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
