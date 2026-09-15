import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, MapPin, X } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { becomeSpecialist } from "@/services/api";
import { ALL_CATEGORIES } from "@/mocks/data";
import { colors, spacing, typography } from "@/theme";

export default function BecomeSpecialistScreen() {
  const router = useRouter();
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const canSubmit = profession.trim() && bio.trim() && city.trim() && categories.length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await becomeSpecialist({ profession, bio, city, categories });
    setIsSubmitting(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScreenHeader
        title="Dołącz jako specjalista"
        description="Wypełnij profil, żeby pojawić się na liście specjalistów — to osobny krok od Twojego konta."
        right={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        }
        showNotificationBell={false}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Zawód / specjalizacja"
          placeholder="np. Radca prawny"
          value={profession}
          onChangeText={setProfession}
          icon={<Briefcase size={17} color={colors.textMuted} />}
        />

        <Input
          label="Miasto"
          placeholder="np. Wrocław"
          value={city}
          onChangeText={setCity}
          icon={<MapPin size={17} color={colors.textMuted} />}
        />

        <View>
          <Text style={styles.label}>Kategorie</Text>
          <View style={styles.wrap}>
            {ALL_CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={categories.includes(c)} onPress={() => toggleCategory(c)} />
            ))}
          </View>
        </View>

        <Input
          label="Opis (bio)"
          placeholder="Kilka zdań o tym, czym się zajmujesz i jakie masz doświadczenie"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: "top" }}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isSubmitting ? "Publikowanie..." : "Opublikuj profil"}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
          fullWidth
        />
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xl },
  label: { ...typography.captionStrong, color: colors.textSecondary, marginBottom: spacing.sm },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  footer: { padding: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});
