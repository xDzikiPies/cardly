import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, ChevronLeft, MapPin, Users } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ApplyToJobModal } from "@/components/jobs/ApplyToJobModal";
import { getJobById } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { JobListing } from "@/types";
import { colors, spacing, typography } from "@/theme";

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
    ? `${job.budget} zł${job.budgetType === "hourly" ? "/h" : ""}`
    : "Do ustalenia";
  const deadlineLabel = job.deadline
    ? new Date(job.deadline).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={22} color={colors.textPrimary} />
          <Text style={styles.backLabel}>Wstecz</Text>
        </Pressable>

        <Chip label={job.category} />

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.author}>Wystawił: {job.authorName}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaBoxLabel}>Budżet</Text>
            <Text style={styles.metaBoxValue}>{budgetLabel}</Text>
          </View>
          <View style={styles.metaBox}>
            <MapPin size={13} color={colors.textMuted} />
            <Text style={styles.metaBoxValue}>{job.city}</Text>
          </View>
          {deadlineLabel && (
            <View style={styles.metaBox}>
              <Calendar size={13} color={colors.textMuted} />
              <Text style={styles.metaBoxValue}>{deadlineLabel}</Text>
            </View>
          )}
          <View style={styles.metaBox}>
            <Users size={13} color={colors.textMuted} />
            <Text style={styles.metaBoxValue}>{job.applicationsCount} zgłoszeń</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Opis</Text>
          <Text style={styles.description}>{job.description}</Text>
        </Card>

        {!isOwn && (
          <Button label="Zgłoś się" onPress={() => setApplyVisible(true)} fullWidth />
        )}
        {isOwn && (
          <Card style={styles.ownNotice}>
            <Text style={styles.ownNoticeText}>To Twoje zlecenie — zgłoszenia zobaczysz w Wiadomościach.</Text>
          </Card>
        )}
      </ScrollView>

      <ApplyToJobModal
        visible={applyVisible}
        jobId={job.id}
        jobTitle={job.title}
        onClose={() => setApplyVisible(false)}
        onApplied={() => {
          setApplyVisible(false);
          setAppliedToast(true);
        }}
      />

      {appliedToast && (
        <Pressable style={styles.toast} onPress={() => setAppliedToast(false)}>
          <Text style={styles.toastText}>Zgłoszenie wysłane! Sprawdź Wiadomości.</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: spacing.sm },
  backLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  author: { ...typography.caption, color: colors.textSecondary },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  metaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metaBoxLabel: { ...typography.tiny, color: colors.textMuted },
  metaBoxValue: { ...typography.captionStrong, color: colors.textPrimary },
  sectionTitle: { ...typography.h2, color: colors.textPrimary },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 21 },
  ownNotice: { backgroundColor: colors.primarySoft },
  ownNoticeText: { ...typography.body, color: colors.primaryDark, textAlign: "center" },
  toast: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.success,
    borderRadius: 14,
    padding: spacing.md,
  },
  toastText: { ...typography.captionStrong, color: "#fff", textAlign: "center" },
});
