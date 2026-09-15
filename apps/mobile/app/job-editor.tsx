import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { createJob } from "@/services/api";
import { ALL_CATEGORIES } from "@/mocks/data";
import { JobBudgetType } from "@/types";
import { colors, spacing, typography } from "@/theme";

const BUDGET_TYPES: { label: string; value: JobBudgetType }[] = [
  { label: "Stała cena", value: "fixed" },
  { label: "Za godzinę", value: "hourly" },
  { label: "Do ustalenia", value: "negotiable" },
];

export default function JobEditorScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [budgetType, setBudgetType] = useState<JobBudgetType>("negotiable");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim() && description.trim() && category && city.trim();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createJob({
        title: title.trim(),
        description: description.trim(),
        category,
        city: city.trim(),
        budgetType,
        budget: budgetType !== "negotiable" && budget.trim() ? Number(budget.replace(",", ".")) : null,
        deadline: deadline.trim() ? new Date(deadline.trim()).toISOString() : null,
      });
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScreenHeader
          title="Wystaw zlecenie"
          description="Opisz co jest do zrobienia — specjaliści sami się zgłoszą."
          right={
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <X size={22} color={colors.textSecondary} />
            </Pressable>
          }
          showNotificationBell={false}
        />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Tytuł" placeholder="np. Malowanie mieszkania 40m²" value={title} onChangeText={setTitle} />

          <Input
            label="Opis"
            placeholder="Opisz szczegóły zlecenia"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            style={{ minHeight: 110, textAlignVertical: "top" }}
          />

          <View>
            <Text style={styles.label}>Kategoria</Text>
            <View style={styles.wrap}>
              {ALL_CATEGORIES.map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </View>
          </View>

          <Input label="Miejscowość" placeholder="np. Wrocław" value={city} onChangeText={setCity} />

          <View>
            <Text style={styles.label}>Rodzaj budżetu</Text>
            <View style={styles.wrap}>
              {BUDGET_TYPES.map((b) => (
                <Chip key={b.value} label={b.label} selected={budgetType === b.value} onPress={() => setBudgetType(b.value)} />
              ))}
            </View>
          </View>

          {budgetType !== "negotiable" && (
            <Input
              label={budgetType === "hourly" ? "Stawka za godzinę (zł)" : "Budżet (zł)"}
              placeholder="np. 2000"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          )}

          <Input
            label="Termin (opcjonalnie)"
            placeholder="RRRR-MM-DD"
            value={deadline}
            onChangeText={setDeadline}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={isSubmitting ? "Publikowanie..." : "Opublikuj zlecenie"}
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
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  label: { ...typography.captionStrong, color: colors.textSecondary, marginBottom: spacing.sm },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  footer: { padding: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});
