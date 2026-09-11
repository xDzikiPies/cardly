import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { DEMO_CREDENTIALS } from "@/services/api";
import { colors, spacing, typography } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isSubmitting, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Po udanym logowaniu Stack.Protected w app/_layout.tsx samo przełączy na (tabs)
    } catch {
      // błąd już jest w store (error) i pokazany niżej
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo size={64} />
          <Text style={styles.title}>Witaj w Cardly</Text>
          <Text style={styles.subtitle}>Zaloguj się, żeby zobaczyć swoją wizytówkę</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="ty@przyklad.pl"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) clearError();
            }}
            icon={<Mail size={17} color={colors.textMuted} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Hasło"
            placeholder="••••••••"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error) clearError();
            }}
            icon={<Lock size={17} color={colors.textMuted} />}
            secureTextEntry
            autoComplete="password"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            label={isSubmitting ? "Logowanie..." : "Zaloguj się"}
            onPress={handleLogin}
            disabled={!canSubmit}
            loading={isSubmitting}
            fullWidth
          />

          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>
              Konto testowe: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            </Text>
          </View>
        </View>

        <Pressable style={styles.footer} onPress={() => router.push("/(auth)/register")} hitSlop={8}>
          <Text style={styles.footerText}>
            Nie masz konta? <Text style={styles.footerLink}>Zarejestruj się</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, padding: spacing.xl, justifyContent: "center", gap: spacing.xxl },
  header: { alignItems: "center", gap: spacing.sm },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  form: { gap: spacing.md },
  errorText: { ...typography.caption, color: colors.danger },
  demoHint: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  demoHintText: { ...typography.caption, color: colors.textMuted, textAlign: "center" },
  footer: { alignItems: "center", marginTop: spacing.md },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: "600" },
});
