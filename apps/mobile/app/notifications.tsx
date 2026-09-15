import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, ChevronLeft, FileText, MessageCircle, Star } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { AppNotification } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

const ICONS: Record<AppNotification["type"], React.ComponentType<any>> = {
  quote_request: FileText,
  quote_status: FileText,
  job_application: Briefcase,
  message: MessageCircle,
  review: Star,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, isLoading, fetchAll, markAllRead, markRead } = useNotificationsStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePress = async (n: AppNotification) => {
    if (!n.isRead) await markRead(n.id);
    if (n.data?.conversationId) {
      router.push(`/conversation/${n.data.conversationId}`);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader
        title="Powiadomienia"
        description="Zapytania o wycenę, zgłoszenia do zleceń i wiadomości."
        right={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={22} color={colors.textSecondary} />
          </Pressable>
        }
        showNotificationBell={false}
      />

      {notifications.some((n) => !n.isRead) && (
        <Pressable style={styles.markAllRow} onPress={markAllRead}>
          <Text style={styles.markAllText}>Oznacz wszystkie jako przeczytane</Text>
        </Pressable>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const Icon = ICONS[item.type] ?? MessageCircle;
            return (
              <Pressable onPress={() => handlePress(item)}>
                <Card style={[styles.row, !item.isRead && styles.rowUnread]}>
                  <View style={styles.iconWrap}>
                    <Icon size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.body} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                  {!item.isRead && <View style={styles.dot} />}
                </Card>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={<MessageCircle size={40} color={colors.textMuted} />}
              title="Brak powiadomień"
              description="Tu pojawią się zapytania o wycenę, zgłoszenia do zleceń i wiadomości."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  markAllRow: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  markAllText: { ...typography.captionStrong, color: colors.primary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowUnread: { borderColor: colors.primary },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.bodyStrong, color: colors.textPrimary },
  body: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
