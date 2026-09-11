import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SlidersHorizontal, Search as SearchIcon, UserPlus } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Input } from "@/components/ui/Input";
import { SpecialistListItem } from "@/components/specialists/SpecialistListItem";
import { FilterSheet } from "@/components/specialists/FilterSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { getCategories, getSpecialists } from "@/services/api";
import { SpecialistFilters, SpecialistProfile } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

const DEFAULT_FILTERS: SpecialistFilters = {
  query: "",
  categories: [],
  radiusKm: 0,
  sortBy: "rating",
};

export default function SpecialistsScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<SpecialistFilters>(DEFAULT_FILTERS);
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<SpecialistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      getSpecialists(filters).then((r) => {
        setResults(r);
        setIsLoading(false);
      });
    }, 200); // debounce
    return () => clearTimeout(handle);
  }, [filters]);

  const activeFilterCount = filters.categories.length + (filters.radiusKm > 0 ? 1 : 0);

  const subtitle = useMemo(
    () => `${results.length} ${results.length === 1 ? "specjalista" : "specjalistów"} w pobliżu`,
    [results.length]
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <FadeInScreen>
      <ScreenHeader
        title="Specjaliści"
        description="Znajdź zaufanych profesjonalistów w Twojej okolicy — sprawdź opinie przed kontaktem."
      />

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Szukaj po imieniu, zawodzie, mieście..."
            value={filters.query}
            onChangeText={(v) => setFilters((f) => ({ ...f, query: v }))}
            icon={<SearchIcon size={17} color={colors.textMuted} />}
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => setSheetOpen(true)}>
          <SlidersHorizontal size={18} color={colors.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Pressable style={styles.ctaLink} onPress={() => router.push("/become-specialist")}>
          <UserPlus size={14} color={colors.primary} />
          <Text style={styles.ctaLinkText}>Dołącz jako specjalista</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SpecialistListItem
              specialist={item}
              onPress={() => router.push(`/specialist/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<SearchIcon size={40} color={colors.textMuted} />}
              title="Brak wyników"
              description="Spróbuj zmienić filtry albo poszerzyć promień wyszukiwania."
            />
          }
        />
      )}

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        categories={categories}
        filters={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />
      </FadeInScreen>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight: "700" },
  subtitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: { ...typography.caption, color: colors.textMuted },
  ctaLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  ctaLinkText: { ...typography.captionStrong, color: colors.primary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
});
