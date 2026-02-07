// 👇 1. Essential Crypto Polyfill (Must be first)
import "react-native-get-random-values";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

// 👇 2. Import our new Data Provider
import { VaultProvider } from "../src/context/VaultContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // 👇 3. Wrap everything in the Provider
    <VaultProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Login Screen (First Screen) */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Main App (Tabs) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* 👇 4. Dynamic Screens (Modals) */}
          <Stack.Screen
            name="add"
            options={{
              presentation: "modal", // Slides up like a card
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
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </VaultProvider>
  );
}
