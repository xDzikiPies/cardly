import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import { SpecialistProfile } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/theme";

interface SpecialistListItemProps {
  specialist: SpecialistProfile;
  onPress: () => void;
}

export function SpecialistListItem({ specialist, onPress }: SpecialistListItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Avatar uri={specialist.avatarUrl} firstName={specialist.firstName} lastName={specialist.lastName} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {specialist.firstName} {specialist.lastName}
          </Text>
          <Text style={styles.profession} numberOfLines={1}>
            {specialist.profession}
          </Text>
          <View style={styles.metaRow}>
            <RatingStars rating={specialist.ratingAvg} count={specialist.ratingCount} />
            <View style={styles.dotSep} />
            <MapPin size={12} color={colors.textMuted} />
            <Text style={styles.distance}>{specialist.distanceKm.toFixed(1)} km</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  name: { ...typography.bodyStrong, color: colors.textPrimary },
  profession: { ...typography.caption, color: colors.textSecondary, marginTop: 1, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted, marginHorizontal: 4 },
  distance: { ...typography.caption, color: colors.textMuted },
});
