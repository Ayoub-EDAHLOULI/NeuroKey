import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus, useColorScheme } from "react-native";
import "react-native-get-random-values";
import "react-native-reanimated";

import { VaultProvider } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  // 1. DYNAMIC BACKGROUND
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [colorScheme, theme.background]);

  // 2. SECURITY: AUTO-LOCK LISTENER
  // Refs keep one subscription alive and always read the current route.
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        const previousState = appStateRef.current;
        appStateRef.current = nextAppState;

        // Only lock after a real trip to the background. System prompts
        // (Face ID, Control Center) only make the app "inactive" on iOS;
        // locking on those caused an endless Face ID loop.
        if (nextAppState === "active" && previousState === "background") {
          // Check if user is already on Auth screen (Don't lock if already locked)
          const inAuthGroup = segmentsRef.current[0] === "auth";
          if (inAuthGroup) return;

          const autoLockPref = await AsyncStorage.getItem("auto_lock");

          // STRICT CHECK: Only lock if preference is NOT "false" (Default: Lock)
          const isAutoLockEnabled = autoLockPref !== "false";

          if (isAutoLockEnabled) {
            console.log("🔒 Auto-Lock Triggered");
            router.replace("/auth");
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <VaultProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.background },
            headerStyle: { backgroundColor: theme.background },
            animation: "fade_from_bottom", // The specific effect you asked for
            animationDuration: 300, // Smooth 300ms transition
            presentation: "card", // Default mode
          }}
        >
          <Stack.Screen
            name="auth"
            options={{ headerShown: false, animation: "fade" }}
          />

          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Modals still slide up fully because of presentation: 'modal' */}
          <Stack.Screen
            name="add"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="detail"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="edit"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="add-card"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="card-detail"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="edit-card"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="security-tips"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="about"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="sync"
            options={{ presentation: "modal", headerShown: false }}
          />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </VaultProvider>
  );
}
