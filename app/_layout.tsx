import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "react-native-get-random-values";
import "react-native-reanimated";

import { VaultProvider } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Get the active theme colors
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  // 👇 DYNAMICALLY SET ROOT BACKGROUND
  // This paints the native "canvas" behind the app to match your theme.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [colorScheme, theme.background]);

  return (
    <VaultProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            // Force the navigation container background
            contentStyle: { backgroundColor: theme.background },
            headerStyle: { backgroundColor: theme.background },
            // Ensure headers in modals don't flash
            presentation: "card",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="add"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="detail"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="edit"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-card"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="card-detail"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </VaultProvider>
  );
}
