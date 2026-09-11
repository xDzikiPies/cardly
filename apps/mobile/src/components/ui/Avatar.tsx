import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

interface AvatarProps {
  uri?: string;
  firstName: string;
  lastName?: string;
  size?: number;
}

export function Avatar({ uri, firstName, lastName, size = 48 }: AvatarProps) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimension]} />;
  }

  return (
    <View style={[styles.fallback, dimension]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceAlt,
  },
  fallback: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
});
