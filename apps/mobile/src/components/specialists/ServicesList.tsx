import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { ServiceOffering } from "@/types";
import { colors, spacing, typography } from "@/theme";

interface ServicesListProps {
  services: ServiceOffering[];
  onDelete?: (id: string) => void;
}

export function ServicesList({ services, onDelete }: ServicesListProps) {
  return (
    <View style={{ gap: spacing.sm }}>
      {services.map((s) => (
        <Card key={s.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{s.name}</Text>
            {s.description ? <Text style={styles.description}>{s.description}</Text> : null}
          </View>
          <Text style={styles.price}>
            {s.price ? `${s.price} zł${s.priceUnit ? ` / ${s.priceUnit}` : ""}` : "Do ustalenia"}
          </Text>
          {onDelete && (
            <Pressable onPress={() => onDelete(s.id)} hitSlop={8} style={{ marginLeft: spacing.sm }}>
              <Trash2 size={16} color={colors.danger} />
            </Pressable>
          )}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  name: { ...typography.bodyStrong, color: colors.textPrimary },
  description: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  price: { ...typography.captionStrong, color: colors.primary },
});
