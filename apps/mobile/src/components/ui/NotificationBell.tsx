import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { colors } from "@/theme";

const POLL_INTERVAL_MS = 20000;

export function NotificationBell() {
  const router = useRouter();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const refreshUnreadCount = useNotificationsStore((s) => s.refreshUnreadCount);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Pressable onPress={() => router.push("/notifications")} hitSlop={10} style={styles.wrap}>
      <Bell size={22} color={colors.textPrimary} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700" },
});
