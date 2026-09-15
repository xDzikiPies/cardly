import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar, MapPin, Users } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { JobListing } from "@/types";
import { colors, spacing, typography } from "@/theme";

interface JobListItemProps {
  job: JobListing;
  onPress: () => void;
}

function formatBudget(job: JobListing): string {
  if (!job.budget) return "Do ustalenia";
  const suffix = job.budgetType === "hourly" ? " zł/h" : " zł";
  return `${job.budget}${suffix}`;
}

function formatDeadline(deadline?: string): string | null {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

export function JobListItem({ job, onPress }: JobListItemProps) {
  const deadline = formatDeadline(job.deadline);

  return (
    <Pressable onPress={onPress}>
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.topRow}>
          <Chip label={job.category} />
          <Text style={styles.budget}>{formatBudget(job)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>

        <View style={styles.metaRow}>
          <MapPin size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{job.city}</Text>
          {deadline && (
            <>
              <View style={styles.dot} />
              <Calendar size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>do {deadline}</Text>
            </>
          )}
          <View style={styles.dot} />
          <Users size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{job.applicationsCount}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budget: { ...typography.bodyStrong, color: colors.primary },
  title: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 16 },
  description: { ...typography.body, color: colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { ...typography.caption, color: colors.textMuted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted, marginHorizontal: 4 },
});
