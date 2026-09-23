import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, ChevronLeft, FileText, Send, ShieldAlert } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { getConversationInfo, getMessages, sendMessage } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatMessage, ConversationInfo } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

const POLL_INTERVAL_MS = 4000;

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const [info, setInfo] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const data = await getMessages(id);
    setMessages(data);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getConversationInfo(id).then(setInfo);
    loadMessages();
    const interval = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id, loadMessages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !id) return;
    setDraft("");
    setIsSending(true);
    try {
      const message = await sendMessage(id, text);
      setMessages((prev) => [...prev, message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } finally {
      setIsSending(false);
    }
  };

  const ContextIcon = info?.context?.type === "job_application" ? Briefcase : FileText;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={22} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Avatar
              uri={info?.otherUserAvatarUrl}
              firstName={info?.otherUserName?.split(" ")[0] ?? "?"}
              lastName={info?.otherUserName?.split(" ")[1]}
              size={32}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName} numberOfLines={1}>
                {info?.otherUserName ?? "Wiadomości"}
              </Text>
              {info?.context && (
                <View style={styles.contextRow}>
                  <ContextIcon size={11} color={colors.primary} />
                  <Text style={styles.contextText} numberOfLines={1}>
                    {info.context.title}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ width: 22 }} />
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListHeaderComponent={<SafetyNotice />}
            renderItem={({ item, index }) => {
              const prev = messages[index - 1];
              const showSenderInfo = !prev || prev.senderId !== item.senderId;

              const senderName = item.isMine ? me?.firstName ?? "Ty" : info?.otherUserName ?? "Użytkownik";
              const senderAvatar = item.isMine ? me?.avatarUrl : info?.otherUserAvatarUrl;
              const [senderFirst, senderLast] = item.isMine
                ? [me?.firstName ?? "Ty", me?.lastName]
                : [info?.otherUserName?.split(" ")[0] ?? "?", info?.otherUserName?.split(" ")[1]];

              return (
                <View style={[styles.messageRow, item.isMine && styles.messageRowMine]}>
                  {!item.isMine && (
                    <View style={styles.avatarSlot}>
                      {showSenderInfo && <Avatar uri={senderAvatar} firstName={senderFirst} lastName={senderLast} size={26} />}
                    </View>
                  )}
                  <View style={[styles.bubbleCol, item.isMine && styles.bubbleColMine]}>
                    {showSenderInfo && (
                      <Text style={[styles.senderName, item.isMine && styles.senderNameMine]}>
                        {item.isMine ? "Ty" : senderName}
                      </Text>
                    )}
                    <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>{item.text}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Input placeholder="Napisz wiadomość..." value={draft} onChangeText={setDraft} multiline />
          </View>
          <Pressable
            style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || isSending}
          >
            <Send size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SafetyNotice() {
  return (
    <View style={styles.safetyCard}>
      <ShieldAlert size={16} color={colors.warning} />
      <Text style={styles.safetyText}>
        Dla własnego bezpieczeństwa nie udostępniaj tu numerów kart płatniczych, PESEL-u ani haseł.
        Administracja Cardly nigdy nie poprosi Cię o hasło do konta.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerName: { ...typography.h2, color: colors.textPrimary },
  contextRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  contextText: { ...typography.tiny, color: colors.primary, flexShrink: 1 },

  list: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm },

  safetyCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  safetyText: { ...typography.tiny, color: colors.textSecondary, flex: 1, lineHeight: 16 },

  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, justifyContent: "flex-start" },
  messageRowMine: { justifyContent: "flex-end" },
  avatarSlot: { width: 26 },
  bubbleCol: { maxWidth: "76%", alignItems: "flex-start" },
  bubbleColMine: { alignItems: "flex-end" },
  senderName: { ...typography.tiny, color: colors.textMuted, marginBottom: 2, marginLeft: 4 },
  senderNameMine: { marginLeft: 0, marginRight: 4, textAlign: "right" },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.lg },
  bubbleTheirs: { backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { ...typography.body, color: colors.textPrimary },
  bubbleTextMine: { color: colors.textOnPrimary },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { opacity: 0.4 },
});
