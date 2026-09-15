import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MessageCircle } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getConversations } from "@/services/api";
import { ConversationSummary } from "@/types";
import { colors, spacing, typography } from "@/theme";

export default function ConversationsScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader
        title="Wiadomości"
        description="Rozmowy z zapytań o wycenę i zgłoszeń do zleceń."
        right={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={22} color={colors.textSecondary} />
          </Pressable>
        }
        showNotificationBell={false}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/conversation/${item.id}`)}>
              <Card style={styles.row}>
                <Avatar firstName={item.otherUserName.split(" ")[0]} lastName={item.otherUserName.split(" ")[1]} size={48} />
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.otherUserName}
                    </Text>
                    {item.isUnread && <View style={styles.dot} />}
                  </View>
                  {item.context && (
                    <Text style={styles.context} numberOfLines={1}>
                      {item.context.type === "quote_request" ? "Zapytanie: " : "Zlecenie: "}
                      {item.context.title}
                    </Text>
                  )}
                  {item.lastMessageText && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessageText}
                    </Text>
                  )}
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<MessageCircle size={40} color={colors.textMuted} />}
              title="Brak wiadomości"
              description="Rozmowy pojawią się tu po zapytaniu o wycenę albo zgłoszeniu się do zlecenia."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { ...typography.bodyStrong, color: colors.textPrimary, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  context: { ...typography.tiny, color: colors.primary, marginTop: 2 },
  lastMessage: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
