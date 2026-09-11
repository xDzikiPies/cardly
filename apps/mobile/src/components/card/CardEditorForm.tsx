import React from "react";
import { StyleSheet, View } from "react-native";
import { Briefcase, Building2, Mail, MapPin, Phone, User } from "lucide-react-native";
import { BusinessCard } from "@/types";
import { Input } from "@/components/ui/Input";
import { colors, spacing } from "@/theme";

interface CardEditorFormProps {
  draft: BusinessCard;
  onChange: (patch: Partial<BusinessCard>) => void;
}

const ICON_SIZE = 17;
const ICON_COLOR = colors.textMuted;

export function CardEditorForm({ draft, onChange }: CardEditorFormProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.pair}>
        <Input
          label="Imię"
          value={draft.firstName}
          onChangeText={(v) => onChange({ firstName: v })}
          icon={<User size={ICON_SIZE} color={ICON_COLOR} />}
          containerStyle={styles.pairItem}
        />
        <Input
          label="Nazwisko"
          value={draft.lastName}
          onChangeText={(v) => onChange({ lastName: v })}
          containerStyle={styles.pairItem}
        />
      </View>

      <Input
        label="Stanowisko"
        value={draft.jobTitle}
        onChangeText={(v) => onChange({ jobTitle: v })}
        icon={<Briefcase size={ICON_SIZE} color={ICON_COLOR} />}
        placeholder="np. Doradca finansowy"
      />

      <Input
        label="Firma (opcjonalnie)"
        value={draft.company ?? ""}
        onChangeText={(v) => onChange({ company: v })}
        icon={<Building2 size={ICON_SIZE} color={ICON_COLOR} />}
        placeholder="np. Nowicki Finance"
      />

      <Input
        label="Email"
        value={draft.email}
        onChangeText={(v) => onChange({ email: v })}
        icon={<Mail size={ICON_SIZE} color={ICON_COLOR} />}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Telefon"
        value={draft.phone}
        onChangeText={(v) => onChange({ phone: v })}
        icon={<Phone size={ICON_SIZE} color={ICON_COLOR} />}
        keyboardType="phone-pad"
      />

      <Input
        label="Adres pracy (opcjonalnie)"
        value={draft.workAddress ?? ""}
        onChangeText={(v) => onChange({ workAddress: v })}
        icon={<MapPin size={ICON_SIZE} color={ICON_COLOR} />}
        placeholder="ul. Przykładowa 1, Miasto"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.md },
  // 'pair' to display:flex + flexDirection:row; 'pairItem' to flex:1 na WRAPPERZE inputu
  // (nie na samym TextInput) — dzięki temu oba pola faktycznie dzielą szerokość po równo.
  pair: { flexDirection: "row", gap: spacing.md },
  pairItem: { flex: 1 },
});
