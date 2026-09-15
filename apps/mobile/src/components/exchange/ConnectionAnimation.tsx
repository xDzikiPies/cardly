import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Check, X } from "lucide-react-native";
import { colors } from "@/theme";

export type ConnectionState = "idle" | "searching" | "success" | "error";

interface ConnectionAnimationProps {
  state: ConnectionState;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function ConnectionAnimation({ state, icon, title, subtitle }: ConnectionAnimationProps) {
  // 3 pulsujące pierścienie w stanie "searching"
  const ringProgress = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const successScale = useSharedValue(0);
  const errorShake = useSharedValue(0);

  useEffect(() => {
    if (state === "searching") {
      ringProgress.forEach((v, i) => {
        v.value = 0;
        v.value = withDelay(
          i * 500,
          withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false)
        );
      });
    } else {
      ringProgress.forEach((v) => cancelAnimation(v));
    }

    if (state === "success") {
      successScale.value = withSequence(
        withTiming(1.15, { duration: 220, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 140 })
      );
    } else {
      successScale.value = 0;
    }

    if (state === "error") {
      errorShake.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const ring0Style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ringProgress[0].value),
    transform: [{ scale: 1 + ringProgress[0].value * 1.4 }],
  }));
  const ring1Style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ringProgress[1].value),
    transform: [{ scale: 1 + ringProgress[1].value * 1.4 }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ringProgress[2].value),
    transform: [{ scale: 1 + ringProgress[2].value * 1.4 }],
  }));
  const ringStyles = [ring0Style, ring1Style, ring2Style];

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: state === "success" ? 1 : 0,
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.circleContainer}>
        {state === "searching" &&
          ringStyles.map((s, i) => <Animated.View key={i} style={[styles.ring, s]} />)}

        <Animated.View
          style={[
            styles.circle,
            iconWrapStyle,
            state === "success" && styles.circleSuccess,
            state === "error" && styles.circleError,
          ]}
        >
          {state === "success" ? (
            <Animated.View style={successStyle}>
              <Check size={40} color={colors.textOnPrimary} strokeWidth={3} />
            </Animated.View>
          ) : state === "error" ? (
            <X size={36} color={colors.textOnPrimary} strokeWidth={3} />
          ) : (
            icon
          )}
        </Animated.View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {state === "searching" && (
        <View style={styles.dotsRow}>
          <PulsingDot delay={0} />
          <PulsingDot delay={150} />
          <PulsingDot delay={300} />
        </View>
      )}
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const scale = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0.6, { duration: 400, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={[styles.dot, style]} />;
}

const CIRCLE = 96;

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 14, paddingVertical: 24 },
  circleContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSuccess: { backgroundColor: colors.success },
  circleError: { backgroundColor: colors.danger },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  dotsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
