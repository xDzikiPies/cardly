import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Building2, Mail, MapPin, Phone, Search as SearchIcon, X } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { BusinessCardPreview } from "@/components/card/BusinessCardPreview";
import { ExchangeListItem, MethodBadge, formatDate } from "@/components/exchange/ExchangeListItem";
import { getMyExchanges } from "@/services/api";
import { CARD_BACKGROUNDS } from "@/mocks/data";
import { ExchangeResult } from "@/types";
import { colors, spacing, typography } from "@/theme";

export default function HistoryScreen() {
  const [exchanges, setExchanges] = useState<ExchangeResult[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExchangeResult | null>(null);

  useEffect(() => {
    getMyExchanges().then(setExchanges);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exchanges;
    return exchanges.filter((ex) => {
      const c = ex.card;
      return (
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q)
      );
    });
  }, [exchanges, query]);

  const background = selected
    ? CARD_BACKGROUNDS.find((b) => b.id === selected.card.backgroundId) ?? CARD_BACKGROUNDS[0]
    : CARD_BACKGROUNDS[0];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FadeInScreen>
        <ScreenHeader
          title="Historia"
          description="Wszystkie wizytówki, które zapisałeś podczas wymiany przez NFC lub QR."
        />

        <View style={styles.searchWrap}>
          <Input
            placeholder="Szukaj po imieniu, firmie, stanowisku..."
            value={query}
            onChangeText={setQuery}
            icon={<SearchIcon size={17} color={colors.textMuted} />}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ExchangeListItem exchange={item} onPress={() => setSelected(item)} />}
          ListEmptyComponent={
            <EmptyState
              icon={<SearchIcon size={40} color={colors.textMuted} />}
              title={exchanges.length === 0 ? "Nie masz jeszcze żadnych wymian" : "Brak wyników"}
              description={
                exchanges.length === 0
                  ? "Wymień się wizytówką na zakładce „Wymiana”, żeby zobaczyć ją tutaj."
                  : "Spróbuj innego wyszukiwania — sprawdź imię, firmę albo stanowisko."
              }
            />
          }
        />
      </FadeInScreen>

      <BottomSheetModal visible={!!selected} onClose={() => setSelected(null)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Szczegóły kontaktu</Text>
          <Pressable onPress={() => setSelected(null)} hitSlop={12}>
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {selected && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <BusinessCardPreview card={selected.card} background={background} />

            <View style={styles.detailInfo}>
              <DetailRow icon={<Mail size={16} color={colors.textMuted} />} text={selected.card.email} />
              <DetailRow icon={<Phone size={16} color={colors.textMuted} />} text={selected.card.phone} />
              {selected.card.workAddress ? (
                <DetailRow icon={<MapPin size={16} color={colors.textMuted} />} text={selected.card.workAddress} />
              ) : null}
              {selected.card.company ? (
                <DetailRow icon={<Building2 size={16} color={colors.textMuted} />} text={selected.card.company} />
              ) : null}
            </View>

            <View style={styles.exchangeMetaRow}>
              <MethodBadge method={selected.method} />
              <Text style={styles.date}>Wymieniono {formatDate(selected.createdAt)}</Text>
            </View>
          </ScrollView>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

function DetailRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.detailRow}>
      {icon}
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { paddingHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.lg },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },

  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { ...typography.h1, color: colors.textPrimary },
  detailInfo: { gap: spacing.sm, marginTop: spacing.lg },
  detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  detailText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  exchangeMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  date: { ...typography.tiny, color: colors.textMuted },
});
