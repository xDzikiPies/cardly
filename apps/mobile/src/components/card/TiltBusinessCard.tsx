import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BusinessCard, CardBackground } from "@/types";
import { BusinessCardPreview } from "./BusinessCardPreview";
import { radius } from "@/theme";

interface TiltBusinessCardProps {
  card: BusinessCard;
  background: CardBackground;
  compact?: boolean;
}

const MAX_TILT_DEG = 10; // subtelne wygięcie, nie karykaturalne
const SPRING_CONFIG = { damping: 18, stiffness: 90, mass: 0.7 };

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

/**
 * Wersja BusinessCardPreview reagująca na przechył telefonu (akcelerometr) —
 * karta lekko się "ugina" w 3D + delikatny refleks światła przesuwa się po niej,
 * tak jak prawdziwa plastikowa/metaliczna wizytówka. Używana tam, gdzie karta jest
 * głównym elementem ekranu (Wizytówka, edytor) — NIE w listach/miniaturkach.
 *
 * Wymaga `expo-sensors` — nowy natywny moduł, potrzebny świeży build (dev/EAS),
 * samo `expo start` w już zainstalowanej apce tego nie podciągnie.
 */
export function TiltBusinessCard({ card, background, compact }: TiltBusinessCardProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const shinePosition = useSharedValue(50);
  const [sensorAvailable, setSensorAvailable] = useState(true);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    (async () => {
      const available = await Accelerometer.isAvailableAsync().catch(() => false);
      if (!available) {
        setSensorAvailable(false);
        return;
      }

      Accelerometer.setUpdateInterval(40);
      subscription = Accelerometer.addListener(({ x, y }) => {
        // x/y ~ -1..1 przy trzymaniu telefonu pionowo w dłoni — mnożnik daje subtelny,
        // nie przesadzony ruch. Reanimated wygładza (spring) surowe, "szarpiące" odczyty czujnika.
        rotateY.value = withSpring(clamp(x * MAX_TILT_DEG * 2.2, -MAX_TILT_DEG, MAX_TILT_DEG), SPRING_CONFIG);
        rotateX.value = withSpring(clamp(-y * MAX_TILT_DEG * 2.2, -MAX_TILT_DEG, MAX_TILT_DEG), SPRING_CONFIG);
        shinePosition.value = withSpring(50 + clamp(x, -1, 1) * 55, SPRING_CONFIG);
      });
    })();

    return () => subscription?.remove();
  }, []);

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${shinePosition.value - 50}%` }],
  }));

  const shine = sensorAvailable ? (
    <Animated.View style={[StyleSheet.absoluteFill, shineStyle]} pointerEvents="none">
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.32)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.shineGradient}
      />
    </Animated.View>
  ) : null;

  return (
    <Animated.View style={sensorAvailable ? tiltStyle : undefined}>
      <BusinessCardPreview card={card} background={background} compact={compact} overlay={shine} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shineGradient: {
    width: "220%",
    height: "100%",
    marginLeft: "-60%",
    borderRadius: radius.xl,
  },
});
