import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Star, X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { colors, spacing, typography } from "@/theme";

interface RatingInputModalProps {
  visible: boolean;
  targetName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void> | void;
}

export function RatingInputModal({ visible, targetName, onClose, onSubmit }: RatingInputModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setRating(0);
    setComment("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await onSubmit(rating, comment.trim());
    setIsSubmitting(false);
    reset();
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Oceń {targetName}</Text>
          <Text style={styles.subtitle}>Twoja opinia pomoże innym użytkownikom</Text>
        </View>
        <Pressable onPress={handleClose} hitSlop={12}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setRating(value)} hitSlop={6}>
            <Star size={36} color={colors.star} fill={value <= rating ? colors.star : "transparent"} />
          </Pressable>
        ))}
      </View>

      <Input
        label="Komentarz (opcjonalnie)"
        placeholder="Podziel się szczegółami swojego doświadczenia"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: "top" }}
      />

      <Button
        label={isSubmitting ? "Wysyłanie..." : "Wyślij opinię"}
        onPress={handleSubmit}
        disabled={rating === 0}
        loading={isSubmitting}
        fullWidth
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start" },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: spacing.md },
});
