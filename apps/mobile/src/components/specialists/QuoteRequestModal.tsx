import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { submitQuoteRequest, uploadImage } from "@/services/api";
import { colors, radius, spacing, typography } from "@/theme";

interface QuoteRequestModalProps {
  visible: boolean;
  specialistProfileId: string;
  specialistName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function QuoteRequestModal({
  visible,
  specialistProfileId,
  specialistName,
  onClose,
  onSubmitted,
}: QuoteRequestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [images, setImages] = useState<{ uri: string; uploadedUrl?: string; isUploading: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setBudget("");
    setImages([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickImage = async () => {
    if (images.length >= 4) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    setImages((prev) => [...prev, { uri, isUploading: true }]);

    try {
      const uploadedUrl = await uploadImage(uri);
      setImages((prev) => prev.map((img) => (img.uri === uri ? { ...img, uploadedUrl, isUploading: false } : img)));
    } catch {
      setImages((prev) => prev.filter((img) => img.uri !== uri));
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !images.some((i) => i.isUploading);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitQuoteRequest({
        specialistProfileId,
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim() ? Number(budget.replace(",", ".")) : null,
        attachmentUrls: images.map((i) => i.uploadedUrl).filter((u): u is string => !!u),
      });
      reset();
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Zapytaj o wycenę</Text>
          <Text style={styles.subtitle}>Wyślij zapytanie do {specialistName}</Text>
        </View>
        <Pressable onPress={handleClose} hitSlop={12}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
        <View style={{ gap: spacing.md }}>
          <Input
            label="Co jest do zrobienia?"
            placeholder="np. Remont łazienki 6m²"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Opis"
            placeholder="Opisz szczegóły — im więcej informacji, tym dokładniejsza wycena"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: "top" }}
          />

          <Input
            label="Budżet (opcjonalnie)"
            placeholder="np. 3000"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          <View>
            <Text style={styles.label}>Zdjęcia (opcjonalnie, max 4)</Text>
            <View style={styles.imagesRow}>
              {images.map((img) => (
                <View key={img.uri} style={styles.imageThumb}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumbImg} />
                  {img.isUploading ? (
                    <View style={styles.imageOverlay}>
                      <ActivityIndicator color="#fff" size="small" />
                    </View>
                  ) : (
                    <Pressable style={styles.imageRemove} onPress={() => removeImage(img.uri)}>
                      <X size={12} color="#fff" />
                    </Pressable>
                  )}
                </View>
              ))}
              {images.length < 4 && (
                <Pressable style={styles.imageAdd} onPress={pickImage}>
                  <Camera size={20} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <Button
        label={isSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}
        onPress={handleSubmit}
        disabled={!canSubmit}
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
  label: { ...typography.captionStrong, color: colors.textSecondary, marginBottom: spacing.sm },
  imagesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  imageThumb: { width: 64, height: 64, borderRadius: radius.sm, overflow: "hidden" },
  imageThumbImg: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageRemove: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageAdd: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
