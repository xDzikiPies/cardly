import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Pressable } from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { TiltBusinessCard } from "@/components/card/TiltBusinessCard";
import { BackgroundPicker } from "@/components/card/BackgroundPicker";
import { CardEditorForm } from "@/components/card/CardEditorForm";
import { useCardStore } from "@/store/useCardStore";
import { getCardBackgrounds } from "@/services/api";
import { CardBackground } from "@/types";
import { colors, spacing } from "@/theme";

export default function CardEditorScreen() {
  const router = useRouter();
  const { card, draft, load, updateDraft, save, isSaving, hasUnsavedChanges } = useCardStore();
  const [backgrounds, setBackgrounds] = useState<CardBackground[]>([]);

  useEffect(() => {
    // Jeśli draft już istnieje (np. świeżo zainicjowany pusty szkic z ekranu "Wizytówka"),
    // nie nadpisuj go danymi z "serwera" — dopiero po zapisaniu load() znów będzie miarodajne.
    if (!draft) load();
    getCardBackgrounds().then(setBackgrounds);
  }, []);

  if (!draft) return null;

  const isNewCard = !card;
  const background = backgrounds.find((b) => b.id === draft.backgroundId) ?? backgrounds[0];

  const handleSave = async () => {
    await save();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScreenHeader
        title={isNewCard ? "Stwórz wizytówkę" : "Edytor wizytówki"}
        description={
          isNewCard
            ? "Uzupełnij swoje dane — zobaczysz je od razu na podglądzie poniżej."
            : "Zmiany widzisz od razu na podglądzie na żywo poniżej."
        }
        right={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        }
        showNotificationBell={false}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {background && (
          <View style={styles.previewWrap}>
            <TiltBusinessCard card={draft} background={background} />
          </View>
        )}

        {backgrounds.length > 0 && (
          <BackgroundPicker
            backgrounds={backgrounds}
            selectedId={draft.backgroundId}
            onSelect={(bg) => updateDraft({ backgroundId: bg.id })}
          />
        )}

        <CardEditorForm draft={draft} onChange={updateDraft} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isSaving ? "Zapisywanie..." : isNewCard ? "Utwórz wizytówkę" : "Zapisz zmiany"}
          onPress={handleSave}
          loading={isSaving}
          disabled={!hasUnsavedChanges}
          fullWidth
        />
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xl },
  previewWrap: { marginTop: spacing.sm },
  footer: {
    padding: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
