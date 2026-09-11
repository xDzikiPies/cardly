import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Nfc, QrCode } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { ExchangeResult } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

interface ExchangeListItemProps {
  exchange: ExchangeResult;
  onPress?: () => void;
}

export function ExchangeListItem({ exchange, onPress }: ExchangeListItemProps) {
  const { card } = exchange;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card style={styles.row}>
        <Avatar firstName={card.firstName} lastName={card.lastName} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {card.firstName} {card.lastName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {card.jobTitle}
            {card.company ? ` · ${card.company}` : ""}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <MethodBadge method={exchange.method} />
          <Text style={styles.date}>{formatDate(exchange.createdAt)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function MethodBadge({ method }: { method: ExchangeResult["method"] }) {
  const Icon = method === "NFC" ? Nfc : QrCode;
  return (
    <View style={styles.methodBadge}>
      <Icon size={11} color={colors.primaryDark} />
      <Text style={styles.methodBadgeText}>{method}</Text>
    </View>
  );
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  name: { ...typography.bodyStrong, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  rightCol: { alignItems: "flex-end", gap: 4 },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  methodBadgeText: { ...typography.tiny, color: colors.primaryDark },
  date: { ...typography.tiny, color: colors.textMuted },
});
