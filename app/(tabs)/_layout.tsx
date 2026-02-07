import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";
import { Colors } from "../../src/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <Tabs
      screenOptions={{
        // Active tab color (e.g., Blue)
        tabBarActiveTintColor: theme.primary,
        // Inactive tab color (e.g., Gray)
        tabBarInactiveTintColor: theme.subText,
        // Style the tab bar background and border
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          // Add some padding on Android for a better look
          ...(Platform.OS === "android"
            ? { elevation: 0, height: 60, paddingBottom: 10 }
            : {}),
        },
        // Hide the default header; each screen will have its own custom header
        headerShown: false,
      }}
    >
      {/* Tab 1: Passwords */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Passwords",
          tabBarIcon: ({ color, focused }) => (
            // Use a filled icon when focused, outline when not
            <Ionicons
              name={focused ? "key" : "key-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 2: Secure Notes */}
      <Tabs.Screen
        name="notes"
        options={{
          title: "Secure Notes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 3: Generator */}
      <Tabs.Screen
        name="generator"
        options={{
          title: "Generator",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "construct" : "construct-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 4: Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
