import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Briefcase,
  ChevronRight,
  LogOut,
  Pencil,
  Shield,
  UserPlus,
  X,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FadeInScreen } from "@/components/ui/FadeInScreen";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { RatingStars } from "@/components/ui/RatingStars";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getCurrentUser, getMyProfileDetails, updateMyProfileDetails } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { ALL_CATEGORIES } from "@/mocks/data";
import { SpecialistProfile, User } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SpecialistProfile | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draftProfession, setDraftProfession] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert("Wylogować się?", "Będziesz musiał(a) zalogować się ponownie.", [
      { text: "Anuluj", style: "cancel" },
      { text: "Wyloguj", style: "destructive", onPress: () => logout() },
    ]);
  };

  useEffect(() => {
    getCurrentUser().then(setUser);
    getMyProfileDetails().then((p) => {
      setProfile(p);
      setDraftProfession(p.profession);
      setDraftBio(p.bio);
      setDraftCategories(p.categories);
    });
  }, []);

  const startEditing = () => {
    if (!profile) return;
    setDraftProfession(profile.profession);
    setDraftBio(profile.bio);
    setDraftCategories(profile.categories);
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const toggleCategory = (c: string) =>
    setDraftCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const saveProfile = async () => {
    setIsSaving(true);
    const updated = await updateMyProfileDetails({
      profession: draftProfession,
      bio: draftBio,
      categories: draftCategories,
    });
    setProfile(updated);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FadeInScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ScreenHeader ma WŁASNY paddingHorizontal — dlatego zostaje poza padded container
            poniżej. Wcześniej content miał paddingHorizontal I ScreenHeader też, stąd
            podwójny odstęp od lewej krawędzi. */}
        <ScreenHeader title="Profil" description="Twoje konto i dane zawodowe widoczne dla innych." />

        <View style={styles.padded}>
          {user && (
            <Card style={styles.userCard}>
              <Avatar uri={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </Card>
          )}

          {profile && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>O mnie</Text>
                {!isEditing && (
                  <Pressable style={styles.editLink} onPress={startEditing} hitSlop={8}>
                    <Pencil size={14} color={colors.primary} />
                    <Text style={styles.editLinkText}>Edytuj</Text>
                  </Pressable>
                )}
              </View>

              <Card style={{ gap: spacing.md }}>
                {!isEditing ? (
                  <>
                    <View style={styles.badgeRow}>
                      <View style={styles.professionBadge}>
                        <Briefcase size={14} color={colors.primaryDark} />
                        <Text style={styles.professionBadgeText}>{profile.profession}</Text>
                      </View>
                      <RatingStars rating={profile.ratingAvg} count={profile.ratingCount} />
                    </View>

                    {profile.categories.length > 0 && (
                      <View style={styles.chipsWrap}>
                        {profile.categories.map((c) => (
                          <Chip key={c} label={c} />
                        ))}
                      </View>
                    )}

                    <Text style={styles.bioText}>{profile.bio}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.editHeaderRow}>
                      <Text style={styles.editHint}>Edytujesz dane widoczne na Twoim profilu specjalisty</Text>
                      <Pressable onPress={cancelEditing} hitSlop={8}>
                        <X size={18} color={colors.textSecondary} />
                      </Pressable>
                    </View>

                    <Input
                      label="Zawód"
                      value={draftProfession}
                      onChangeText={setDraftProfession}
                      icon={<Briefcase size={17} color={colors.textMuted} />}
                    />

                    <View>
                      <Text style={styles.label}>Kategorie</Text>
                      <View style={styles.chipsWrap}>
                        {ALL_CATEGORIES.map((c) => (
                          <Chip
                            key={c}
                            label={c}
                            selected={draftCategories.includes(c)}
                            onPress={() => toggleCategory(c)}
                          />
                        ))}
                      </View>
                    </View>

                    <Input
                      label="Bio"
                      value={draftBio}
                      onChangeText={setDraftBio}
                      multiline
                      numberOfLines={4}
                      style={{ minHeight: 90, textAlignVertical: "top" }}
                    />

                    <View style={styles.editActions}>
                      <View style={{ flex: 1 }}>
                        <Button label="Anuluj" variant="ghost" onPress={cancelEditing} fullWidth />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          label={isSaving ? "Zapisywanie..." : "Zapisz"}
                          onPress={saveProfile}
                          loading={isSaving}
                          fullWidth
                        />
                      </View>
                    </View>
                  </>
                )}
              </Card>
            </View>
          )}

          {profile && profile.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opinie o mnie ({profile.reviews.length})</Text>
              <View style={{ gap: spacing.md }}>
                {profile.reviews.map((review) => (
                  <Card key={review.id}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                      <RatingStars rating={review.rating} />
                    </View>
                    {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                  </Card>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ustawienia</Text>
            <Card padded={false}>
              <MenuRow
                icon={<UserPlus size={18} color={colors.textSecondary} />}
                label="Dołącz jako specjalista"
                onPress={() => router.push("/become-specialist")}
              />
              <RowDivider />
              <MenuRow icon={<Bell size={18} color={colors.textSecondary} />} label="Powiadomienia" onPress={() => {}} />
              <RowDivider />
              <MenuRow icon={<Shield size={18} color={colors.textSecondary} />} label="Prywatność i dane" onPress={() => {}} />
              <RowDivider />
              <MenuRow
                icon={<LogOut size={18} color={colors.danger} />}
                label="Wyloguj się"
                labelColor={colors.danger}
                onPress={handleLogout}
              />
            </Card>
          </View>
        </View>
      </ScrollView>
      </FadeInScreen>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  labelColor,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      {icon}
      <Text style={[styles.menuLabel, labelColor && { color: labelColor }]}>{label}</Text>
      <ChevronRight size={16} color={colors.textMuted} style={{ marginLeft: "auto" }} />
    </Pressable>
  );
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing.xxl },
  // Cały padding od lewej/prawej krawędzi mieszka TYLKO tutaj (ScreenHeader ma swój własny).
  padded: { paddingHorizontal: spacing.xl, gap: spacing.xl, marginTop: spacing.sm },

  userCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  userName: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 17 },
  userEmail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  section: { gap: spacing.sm },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { ...typography.captionStrong, color: colors.textSecondary, marginLeft: spacing.xs },
  editLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  editLinkText: { ...typography.captionStrong, color: colors.primary },

  badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  professionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  professionBadgeText: { ...typography.captionStrong, color: colors.primaryDark },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  bioText: { ...typography.body, color: colors.textSecondary, lineHeight: 21 },

  editHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  editHint: { ...typography.caption, color: colors.textMuted, flex: 1, marginRight: spacing.sm },
  label: { ...typography.captionStrong, color: colors.textSecondary, marginBottom: spacing.sm },
  editActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },

  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  reviewAuthor: { ...typography.bodyStrong, color: colors.textPrimary },
  reviewComment: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },

  menuRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  menuLabel: { ...typography.body, color: colors.textPrimary },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.lg },
});
