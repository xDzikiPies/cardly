import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { addService } from "@/services/api";
import { ServiceOffering } from "@/types";
import { colors, spacing, typography } from "@/theme";

interface AddServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (service: ServiceOffering) => void;
}

export function AddServiceModal({ visible, onClose, onAdded }: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [hasPrice, setHasPrice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setPrice("");
    setPriceUnit("");
    setHasPrice(true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canSubmit = name.trim().length > 0 && (!hasPrice || price.trim().length > 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const service = await addService({
        name: name.trim(),
        description: description.trim() || undefined,
        price: hasPrice && price.trim() ? Number(price.replace(",", ".")) : null,
        priceUnit: hasPrice ? priceUnit.trim() || undefined : undefined,
      });
      reset();
      onAdded(service);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Dodaj usługę</Text>
        <Pressable onPress={handleClose} hitSlop={12}>
          <X size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Input label="Nazwa usługi" placeholder="np. Montaż mebli kuchennych" value={name} onChangeText={setName} />

      <Input
        label="Opis (opcjonalnie)"
        placeholder="Kilka słów o tym, co obejmuje ta usługa"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: "top" }}
      />

      <View style={styles.priceToggleRow}>
        <Pressable style={styles.toggleOption} onPress={() => setHasPrice(true)}>
          <View style={[styles.radio, hasPrice && styles.radioActive]} />
          <Text style={styles.toggleLabel}>Podaję cenę</Text>
        </Pressable>
        <Pressable style={styles.toggleOption} onPress={() => setHasPrice(false)}>
          <View style={[styles.radio, !hasPrice && styles.radioActive]} />
          <Text style={styles.toggleLabel}>Do ustalenia</Text>
        </Pressable>
      </View>

      {hasPrice && (
        <View style={styles.pair}>
          <Input
            label="Cena"
            placeholder="np. 150"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
          <Input
            label="Jednostka (opc.)"
            placeholder="np. godzina"
            value={priceUnit}
            onChangeText={setPriceUnit}
            containerStyle={{ flex: 1 }}
          />
        </View>
      )}

      <Button
        label={isSubmitting ? "Dodawanie..." : "Dodaj usługę"}
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={isSubmitting}
        fullWidth
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { ...typography.h1, color: colors.textPrimary },
  priceToggleRow: { flexDirection: "row", gap: spacing.lg },
  toggleOption: { flexDirection: "row", alignItems: "center", gap: 8 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  toggleLabel: { ...typography.body, color: colors.textPrimary },
  pair: { flexDirection: "row", gap: spacing.md },
});
