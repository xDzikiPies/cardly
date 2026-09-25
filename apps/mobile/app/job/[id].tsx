import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, ChevronLeft, MapPin, Users, Info, Search } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ApplyToJobModal } from "@/components/jobs/ApplyToJobModal";
import { getJobById } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { JobListing } from "@/types";
import { colors, spacing, typography, shadow, radius } from "@/theme";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [job, setJob] = useState<JobListing | null>(null);
  const [applyVisible, setApplyVisible] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  useEffect(() => {
    if (id) getJobById(id).then((j) => setJob(j ?? null));
  }, [id]);

  if (!job) {
    return (
      <SafeAreaView style={styles.loading} edges={["top"]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const isOwn = job.authorId === user?.id;
  const budgetLabel = job.budget
    ? `${job.budget} zł`
    : "Do ustalenia";
  const deadlineLabel = job.deadline
    ? new Date(job.deadline).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })
    : null;

  const authorInitials = job.authorName
    ? job.authorName.split(" ").map(n => n[0]).join("").toUpperCase()
    : "?";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerAuthor}>
          <Text style={styles.categoryBadge}>{job.category}</Text>
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{authorInitials}</Text></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.authorSub}>{job.authorName}</Text>

          <View style={styles.budgetSection}>
            <Text style={styles.budgetLabel}>{budgetLabel}</Text>
            {job.budgetType === "hourly" && <Text style={styles.budgetType}>/h</Text>}
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <MapPin size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{job.city}</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            {deadlineLabel && (
              <>
                <View style={styles.metaBox}>
                  <Calendar size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>{deadlineLabel}</Text>
                </View>
                <Text style={styles.metaDot}>•</Text>
              </>
            )}
            <View style={styles.metaBox}>
              <Users size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{job.applicationsCount} zgłoszeń</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Opis zlecenia</Text>
          <Text style={styles.description}>{job.description}</Text>

          {isOwn && (
            <View style={styles.ownNotice}>
              <Info size={16} color={colors.primaryDark} />
              <Text style={styles.ownNoticeText}>Twoje zlecenie — zgłoszenia są w Wiadomościach.</Text>
            </View>
          )}

        </Card>

      </ScrollView>

      {!isOwn && (
        <View style={styles.footer}>
          <Button label="Zgłoś się do zlecenia" onPress={() => setApplyVisible(true)} fullWidth size="lg" />
        </View>
      )}

      <ApplyToJobModal
        visible={applyVisible}
        jobId={job.id}
        jobTitle={job.title}
        onClose={() => setApplyVisible(false)}
        onApplied={() => {
          setApplyVisible(false);
          setAppliedToast(true);
          setTimeout(() => setAppliedToast(false), 3500);
        }}
      />

      {appliedToast && (
        <View style={styles.toast}>
          <View style={styles.toastIcon}><Check size={16} color="#fff" /></View>
          <Text style={styles.toastText}>Zgłoszenie wysłane! Sprawdź Wiadomości.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.bg, zIndex: 10 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerAuthor: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  categoryBadge: { ...typography.tiny, color: colors.textSecondary, backgroundColor: colors.surfaceAlt, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill },
  avatarPlaceholder: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center", borderPattern: 1, borderColor: colors.border },
  avatarInitials: { ...typography.captionStrong, color: colors.textSecondary },
  
  scrollContent: { paddingBottom: spacing.xxl + 80 }, // Dodatkowy padding na footer

  mainCard: { marginHorizontal: spacing.lg, marginTop: spacing.xs, padding: spacing.xl, ...shadow.floating },
  title: { ...typography.h1, color: colors.textPrimary },
  authorSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  budgetSection: { flexDirection: "row", alignItems: "baseline", marginTop: spacing.lg },
  budgetLabel: { ...typography.display, color: colors.primary, fontWeight: "800" },
  budgetType: { ...typography.body, color: colors.textSecondary, marginLeft: 2 },
  
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl, opacity: 0.6 },
  
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  metaBox: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { ...typography.caption, color: colors.textPrimary },
  metaDot: { ...typography.body, color: colors.textMuted, marginHorizontal: spacing.sm },

  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.xxl, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textPrimary, lineHeight: 22, opacity: 0.9 },

  ownNotice: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.xl },
  ownNoticeText: { ...typography.captionStrong, color: colors.primaryDark, flex: 1 },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, ...shadow.card },

  toast: { position: "absolute", top: spacing.xl, left: spacing.xl, right: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.textPrimary, borderRadius: radius.lg, padding: spacing.md, zIndex: 99, ...shadow.floating },
  toastIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  toastText: { ...typography.captionStrong, color: colors.surface, flex: 1 },
});