import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";
import { X } from "lucide-react-native";
import { JobBudgetType, JobFilters } from "@/types";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { ALL_CATEGORIES } from "@/mocks/data";
import { colors, spacing, typography } from "@/theme";

interface JobFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: JobFilters;
  onChange: (patch: Partial<JobFilters>) => void;
  onReset: () => void;
}

const BUDGET_TYPES: { label: string; value: JobBudgetType | "" }[] = [
  { label: "Dowolny", value: "" },
  { label: "Stała cena", value: "fixed" },
  { label: "Za godzinę", value: "hourly" },
  { label: "Do ustalenia", value: "negotiable" },
];

const SORT_OPTIONS: { label: string; value: JobFilters["sortBy"] }[] = [
  { label: "Najnowsze", value: "recent" },
  { label: "Najwyższy budżet", value: "budget" },
  { label: "Najbliższy termin", value: "deadline" },
];

export function JobFilterSheet({ visible, onClose, filters, onChange, onReset }: JobFilterSheetProps) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtry i sortowanie</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
        <Input
          label="Miejscowość"
          placeholder="np. Wrocław"
          value={filters.city}
          onChangeText={(v) => onChange({ city: v })}
        />

        <Text style={styles.sectionLabel}>Kategoria</Text>
        <View style={styles.wrap}>
          <Chip label="Wszystkie" selected={filters.category === ""} onPress={() => onChange({ category: "" })} />
          {ALL_CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={filters.category === c} onPress={() => onChange({ category: c })} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Budżet</Text>
        <View style={styles.wrap}>
          {BUDGET_TYPES.map((b) => (
            <Chip
              key={b.label}
              label={b.label}
              selected={filters.budgetType === b.value}
              onPress={() => onChange({ budgetType: b.value })}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Sortuj według</Text>
        <View style={styles.wrap}>
          {SORT_OPTIONS.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              selected={filters.sortBy === s.value}
              onPress={() => onChange({ sortBy: s.value })}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button label="Wyczyść" variant="ghost" onPress={onReset} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Pokaż wyniki" onPress={onClose} />
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { ...typography.h1, color: colors.textPrimary },
  sectionLabel: { ...typography.captionStrong, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  footer: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
});
