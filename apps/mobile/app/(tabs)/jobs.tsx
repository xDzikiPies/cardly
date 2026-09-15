import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search as SearchIcon, SlidersHorizontal } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { JobListItem } from "@/components/jobs/JobListItem";
import { JobFilterSheet } from "@/components/jobs/JobFilterSheet";
import { getJobs } from "@/services/api";
import { JobFilters, JobListing } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

const DEFAULT_FILTERS: JobFilters = { query: "", category: "", city: "", budgetType: "", sortBy: "recent" };

export default function JobsScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const handle = setTimeout(() => {
      getJobs(filters).then((r) => {
        setJobs(r);
        setIsLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [filters]);

  const activeFilterCount = (filters.category ? 1 : 0) + (filters.city ? 1 : 0) + (filters.budgetType ? 1 : 0);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FadeInScreen>
        <ScreenHeader
          title="Zlecenia"
          description="Przeglądaj dostępne zlecenia albo wystaw własne."
          right={
            <Pressable style={styles.addBtn} onPress={() => router.push("/job-editor")} hitSlop={8}>
              <Plus size={20} color={colors.textOnPrimary} />
            </Pressable>
          }
        />

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Szukaj po tytule, opisie..."
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

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <JobListItem job={item} onPress={() => router.push(`/job/${item.id}`)} />}
            ListEmptyComponent={
              <EmptyState
                icon={<SearchIcon size={40} color={colors.textMuted} />}
                title="Brak zleceń"
                description="Spróbuj zmienić filtry albo wystaw pierwsze zlecenie."
              />
            }
          />
        )}

        <JobFilterSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          filters={filters}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </FadeInScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.md,
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
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
});
