import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, FileText, MapPin, Star } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RatingInputModal } from "@/components/specialists/RatingInputModal";
import { QuoteRequestModal } from "@/components/specialists/QuoteRequestModal";
import { ServicesList } from "@/components/specialists/ServicesList";
import { addReview, getSpecialistById } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { SpecialistProfile } from "@/types";
import { colors, spacing, typography } from "@/theme";

export default function SpecialistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [specialist, setSpecialist] = useState<SpecialistProfile | null>(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [quoteSentVisible, setQuoteSentVisible] = useState(false);

  const loadSpecialist = () => {
    if (id) getSpecialistById(id).then((s) => setSpecialist(s ?? null));
  };

  useEffect(() => {
    loadSpecialist();
  }, [id]);

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!specialist) return;
    await addReview(specialist.id, { rating, comment: comment || undefined });
    loadSpecialist(); // odśwież, żeby nowa opinia i przeliczona średnia były widoczne
  };

  const isOwnProfile = specialist?.userId === user?.id;

  if (!specialist) {
    return (
      <SafeAreaView style={styles.loading} edges={["top"]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={22} color={colors.textPrimary} />
          <Text style={styles.backLabel}>Wstecz</Text>
        </Pressable>

        <View style={styles.headerBlock}>
          <Avatar uri={specialist.avatarUrl} firstName={specialist.firstName} lastName={specialist.lastName} size={84} />
          <Text style={styles.name}>
            {specialist.firstName} {specialist.lastName}
          </Text>
          <Text style={styles.profession}>{specialist.profession}</Text>
          <View style={styles.metaRow}>
            <RatingStars rating={specialist.ratingAvg} count={specialist.ratingCount} size={16} />
            <View style={styles.dot} />
            <MapPin size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {specialist.city} · {specialist.distanceKm.toFixed(1)} km
            </Text>
          </View>
          <View style={styles.categoriesRow}>
            {specialist.categories.map((c) => (
              <Chip key={c} label={c} />
            ))}
          </View>
        </View>

        {!isOwnProfile && (
          <Button
            label="Zapytaj o wycenę"
            icon={<FileText size={16} color={colors.textOnPrimary} />}
            onPress={() => setQuoteModalVisible(true)}
            fullWidth
          />
        )}

        <Card>
          <Text style={styles.sectionTitle}>O mnie</Text>
          <Text style={styles.bio}>{specialist.bio}</Text>
        </Card>

        {specialist.services && specialist.services.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { marginBottom: spacing.md }]}>Usługi i cennik</Text>
            <ServicesList services={specialist.services} />
          </View>
        )}

        <View>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Opinie ({specialist.reviews.length})</Text>
            {!isOwnProfile && (
              <Pressable style={styles.rateLink} onPress={() => setRatingModalVisible(true)}>
                <Star size={14} color={colors.primary} />
                <Text style={styles.rateLinkText}>Zostaw opinię</Text>
              </Pressable>
            )}
          </View>
          <View style={{ gap: spacing.md }}>
            {specialist.reviews.map((review) => (
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

        {!isOwnProfile && (
          <Button label="Wymień się wizytówką" variant="secondary" onPress={() => router.push("/(tabs)/exchange")} fullWidth />
        )}
      </ScrollView>

      <RatingInputModal
        visible={ratingModalVisible}
        targetName={`${specialist.firstName} ${specialist.lastName}`}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleSubmitReview}
      />

      <QuoteRequestModal
        visible={quoteModalVisible}
        specialistProfileId={specialist.id}
        specialistName={`${specialist.firstName} ${specialist.lastName}`}
        onClose={() => setQuoteModalVisible(false)}
        onSubmitted={() => {
          setQuoteModalVisible(false);
          setQuoteSentVisible(true);
        }}
      />

      {quoteSentVisible && (
        <Pressable style={styles.toast} onPress={() => setQuoteSentVisible(false)}>
          <Text style={styles.toastText}>Zapytanie wysłane! Odpowiedź dostaniesz w Wiadomościach.</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  backLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  headerBlock: { alignItems: "center", gap: 4 },
  name: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
  profession: { ...typography.body, color: colors.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.xs },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted, marginHorizontal: 4 },
  metaText: { ...typography.caption, color: colors.textMuted },
  categoriesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md, justifyContent: "center" },
  sectionTitle: { ...typography.h2, color: colors.textPrimary },
  bio: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 21 },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  rateLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  rateLinkText: { ...typography.captionStrong, color: colors.primary },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  reviewAuthor: { ...typography.bodyStrong, color: colors.textPrimary },
  reviewComment: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
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
