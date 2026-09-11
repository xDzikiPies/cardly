import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";
import { X } from "lucide-react-native";
import { SpecialistFilters, SpecialistSortKey } from "@/types";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { colors, spacing, typography } from "@/theme";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  categories: string[];
  filters: SpecialistFilters;
  onChange: (patch: Partial<SpecialistFilters>) => void;
  onReset: () => void;
}

const RADIUS_OPTIONS = [
  { label: "Dowolna odległość", value: 0 },
  { label: "Do 5 km", value: 5 },
  { label: "Do 10 km", value: 10 },
  { label: "Do 25 km", value: 25 },
];

const SORT_OPTIONS: { label: string; value: SpecialistSortKey }[] = [
  { label: "Najwyżej oceniani", value: "rating" },
  { label: "Najbliżej", value: "distance" },
  { label: "Alfabetycznie", value: "name" },
];

export function FilterSheet({ visible, onClose, categories, filters, onChange, onReset }: FilterSheetProps) {
  const toggleCategory = (c: string) => {
    const has = filters.categories.includes(c);
    onChange({
      categories: has ? filters.categories.filter((x) => x !== c) : [...filters.categories, c],
    });
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtry i sortowanie</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
        <Text style={styles.sectionLabel}>Kategoria</Text>
        <View style={styles.wrap}>
          {categories.map((c) => (
            <Chip key={c} label={c} selected={filters.categories.includes(c)} onPress={() => toggleCategory(c)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Promień wyszukiwania</Text>
        <View style={styles.wrap}>
          {RADIUS_OPTIONS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              selected={filters.radiusKm === r.value}
              onPress={() => onChange({ radiusKm: r.value })}
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
