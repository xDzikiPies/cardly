import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Lock, Mail, User as UserIcon } from "lucide-react-native";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, spacing, typography } from "@/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isSubmitting, error, clearError } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6;

  const handleRegister = async () => {
    try {
      await register({ firstName, lastName, email, password });
      // Po udanej rejestracji Stack.Protected w app/_layout.tsx samo przełączy na (tabs)
    } catch {
      // błąd już jest w store (error) i pokazany niżej
    }
  };

  const clearErrorIfAny = () => {
    if (error) clearError();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo size={64} />
          <Text style={styles.title}>Załóż konto</Text>
          <Text style={styles.subtitle}>Stwórz swoją cyfrową wizytówkę w minutę</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.pair}>
            <Input
              label="Imię"
              value={firstName}
              onChangeText={(v) => {
                setFirstName(v);
                clearErrorIfAny();
              }}
              icon={<UserIcon size={17} color={colors.textMuted} />}
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Nazwisko"
              value={lastName}
              onChangeText={(v) => {
                setLastName(v);
                clearErrorIfAny();
              }}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Input
            label="Email"
            placeholder="ty@przyklad.pl"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearErrorIfAny();
            }}
            icon={<Mail size={17} color={colors.textMuted} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Hasło"
            placeholder="min. 6 znaków"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearErrorIfAny();
            }}
            icon={<Lock size={17} color={colors.textMuted} />}
            secureTextEntry
            autoComplete="password-new"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            label={isSubmitting ? "Tworzenie konta..." : "Utwórz konto"}
            onPress={handleRegister}
            disabled={!canSubmit}
            loading={isSubmitting}
            fullWidth
          />
        </View>

        <Pressable style={styles.footer} onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
          <Text style={styles.footerText}>
            Masz już konto? <Text style={styles.footerLink}>Zaloguj się</Text>
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
  pair: { flexDirection: "row", gap: spacing.md },
  errorText: { ...typography.caption, color: colors.danger },
  footer: { alignItems: "center", marginTop: spacing.md },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: "600" },
});
