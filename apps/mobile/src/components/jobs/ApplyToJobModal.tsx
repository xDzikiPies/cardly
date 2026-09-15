import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { applyToJob } from "@/services/api";
import { colors, spacing, typography } from "@/theme";

interface ApplyToJobModalProps {
  visible: boolean;
  jobTitle: string;
  jobId: string;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyToJobModal({ visible, jobTitle, jobId, onClose, onApplied }: ApplyToJobModalProps) {
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setMessage("");
    setPrice("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await applyToJob(jobId, {
        message: message.trim() || undefined,
        price: price.trim() ? Number(price.replace(",", ".")) : null,
      });
      reset();
      onApplied();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Zgłoś się</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {jobTitle}
          </Text>
        </View>
        <Pressable onPress={handleClose} hitSlop={12}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Input
        label="Wiadomość (opcjonalnie)"
        placeholder="Napisz kilka słów o sobie i swojej ofercie"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" }}
      />

      <Input
        label="Twoja cena (opcjonalnie)"
        placeholder="np. 1800"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Button
        label={isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
        onPress={handleSubmit}
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
});
