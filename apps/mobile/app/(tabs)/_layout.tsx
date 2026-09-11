import React from "react";
import { Tabs } from "expo-router";
import { History, IdCard, Radar, Repeat, User } from "lucide-react-native";
import { colors, typography } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { ...typography.tiny, marginBottom: 4 },
        tabBarStyle: {
          height: 84,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Wizytówka",
          tabBarIcon: ({ color, size }) => <IdCard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="specialists"
        options={{
          title: "Specjaliści",
          tabBarIcon: ({ color, size }) => <Radar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="exchange"
        options={{
          title: "Wymiana",
          tabBarIcon: ({ color, size }) => <Repeat color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historia",
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
