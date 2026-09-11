import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Star } from "lucide-react-native";
import { colors, typography } from "@/theme";

interface RatingStarsProps {
  rating: number; // 0-5
  count?: number;
  size?: number;
}

export function RatingStars({ rating, count, size = 14 }: RatingStarsProps) {
  return (
    <View style={styles.row}>
      <Star size={size} color={colors.star} fill={colors.star} />
      <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      {typeof count === "number" ? <Text style={styles.count}>({count})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { ...typography.captionStrong, color: colors.textPrimary },
  count: { ...typography.caption, color: colors.textMuted },
});
