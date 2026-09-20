import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, IdCard, Pencil, Repeat, Share2 } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { BusinessCardPreview } from "@/components/card/BusinessCardPreview";
import { ExchangeListItem } from "@/components/exchange/ExchangeListItem";
import { useCardStore } from "@/store/useCardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getMyExchanges } from "@/services/api";
import { CARD_BACKGROUNDS } from "@/mocks/data";
import { ExchangeResult } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

const RECENT_EXCHANGES_LIMIT = 5;

export default function MyCardScreen() {
  const router = useRouter();
  const { card, isLoading, load, startNewCard } = useCardStore();
  const user = useAuthStore((s) => s.user);
  const [recentExchanges, setRecentExchanges] = useState<ExchangeResult[]>([]);
  const [isExchangesLoading, setIsExchangesLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);

  const loadAll = useCallback(
    async (silent = false) => {
      if (!silent) setIsExchangesLoading(true);
      await load();
      const all = await getMyExchanges();
      setRecentExchanges(all.slice(0, RECENT_EXCHANGES_LIMIT));
      setIsExchangesLoading(false);
      hasLoadedOnce.current = true;
    },
    [load]
  );

  useEffect(() => {
    loadAll();
  }, []);

  // Odśwież po powrocie na tę zakładkę (np. po edycji wizytówki albo świeżej
  // wymianie) — po cichu, bez spinnera, dane widać od razu.
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnce.current) loadAll(true);
    }, [loadAll])
  );

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    await loadAll(true);
    setIsRefreshing(false);
  };

  const background =
    CARD_BACKGROUNDS.find((b) => b.id === card?.backgroundId) ?? CARD_BACKGROUNDS[0];

  const handleCreateCard = () => {
    startNewCard({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
    router.push("/card-editor");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FadeInScreen>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handlePullToRefresh} tintColor={colors.primary} />}
        >
          <ScreenHeader
            title="Moja wizytówka"
            description="Tak wygląda Twoja cyfrowa wizytówka — edytuj dane albo zmień tło w dowolnym momencie."
          />

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : !card ? (
            <View style={styles.body}>
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <IdCard size={28} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Nie masz jeszcze utworzonej wizytówki</Text>
                <Text style={styles.emptyDescription}>
                  Stwórz swoją pierwszą cyfrową wizytówkę — zajmie to mniej niż minutę.
                </Text>
                <Button label="Stwórz wizytówkę" onPress={handleCreateCard} fullWidth />
              </Card>
            </View>
          ) : (
            <View style={styles.body}>
              <BusinessCardPreview card={card} background={background} />

              <View style={styles.actions}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Edytuj wizytówkę"
                    icon={<Pencil size={16} color={colors.textOnPrimary} />}
                    onPress={() => router.push("/card-editor")}
                    fullWidth
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Udostępnij"
                    variant="secondary"
                    icon={<Share2 size={16} color={colors.primaryDark} />}
                    onPress={() => router.push("/(tabs)/exchange")}
                    fullWidth
                  />
                </View>
              </View>

              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>Ostatnie wymiany</Text>
                  {recentExchanges.length > 0 && (
                    <Pressable
                      style={styles.recentLink}
                      onPress={() => router.push("/(tabs)/history")}
                      hitSlop={8}
                    >
                      <Text style={styles.recentLinkText}>Wszystkie wymiany</Text>
                      <ChevronRight size={14} color={colors.primary} />
                    </Pressable>
                  )}
                </View>

                {isExchangesLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
                ) : recentExchanges.length > 0 ? (
                  <View style={{ gap: spacing.md }}>
                    {recentExchanges.map((ex) => (
                      <ExchangeListItem key={ex.id} exchange={ex} />
                    ))}
                  </View>
                ) : (
                  <Card style={styles.emptyExchangesCard}>
                    <View style={styles.emptyExchangesIconWrap}>
                      <Repeat size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.emptyExchangesTitle}>Nie masz jeszcze żadnych wymian</Text>
                      <Text style={styles.emptyExchangesDescription}>
                        Wymień się wizytówką z kimś przez NFC lub QR — pojawi się tutaj.
                      </Text>
                    </View>
                  </Card>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </FadeInScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg, marginTop: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.md },

  emptyCard: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xxl },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
  emptyDescription: { ...typography.body, color: colors.textSecondary, textAlign: "center" },

  recentSection: { gap: spacing.sm, marginTop: spacing.md },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recentTitle: { ...typography.captionStrong, color: colors.textSecondary, marginLeft: spacing.xs },
  recentLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  recentLinkText: { ...typography.captionStrong, color: colors.primary },

  emptyExchangesCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  emptyExchangesIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyExchangesTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  emptyExchangesDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
