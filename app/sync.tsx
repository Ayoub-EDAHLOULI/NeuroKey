import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVault } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

export default function SyncScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const { items } = useVault();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "scanning" | "connecting" | "success" | "error"
  >("scanning");
  const [errorMessage, setErrorMessage] = useState("");

  // --- CAMERA PERMISSIONS ---
  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]} />
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Ionicons
          name="camera-outline"
          size={64}
          color={theme.subText}
          style={{ marginBottom: 20 }}
        />
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            marginBottom: 20,
            textAlign: "center",
            paddingHorizontal: 40,
          }}
        >
          NeuroKey needs camera access to scan the desktop QR code.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
          onPress={requestPermission}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- SCAN & TRANSFER LOGIC ---
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setConnectionStatus("connecting");

    try {
      // 1. Ping the Desktop Server to verify identity
      const response = await fetch(`${data}/ping`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = (await response.json()) as { status: string };

      // 2. If the handshake is successful, initiate the transfer!
      if (json.status === "NeuroKey Desktop is ready!") {
        // Blast the mobile vault data over the local Wi-Fi tunnel
        const syncResponse = await fetch(`${data}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: items }),
        });

        const syncJson = (await syncResponse.json()) as { status: string };

        if (syncJson.status === "success") {
          setConnectionStatus("success");

          // Close the scanner automatically after 2 seconds
          setTimeout(() => {
            router.back();
          }, 2000);
        } else {
          throw new Error("Desktop rejected the transfer.");
        }
      } else {
        throw new Error("Unrecognized device.");
      }
    } catch {
      setConnectionStatus("error");
      setErrorMessage(
        "Transfer failed. Ensure both devices are on the exact same Wi-Fi network.",
      );

      // Reset scanner after 3 seconds so the user can try again
      setTimeout(() => {
        setScanned(false);
        setConnectionStatus("scanning");
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      {/* FULL SCREEN CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* OVERLAY UI */}
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Desktop QR</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Center Target Box */}
        <View style={styles.targetContainer}>
          <View style={styles.targetBox} />
        </View>

        {/* Status Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.statusCard}>
            {connectionStatus === "scanning" && (
              <>
                <Ionicons name="qr-code-outline" size={24} color="#FFF" />
                <Text style={styles.statusText}>
                  Point camera at the QR code on your computer screen.
                </Text>
              </>
            )}

            {connectionStatus === "connecting" && (
              <>
                <ActivityIndicator color="#007AFF" />
                <Text style={styles.statusText}>Transferring Vault...</Text>
              </>
            )}

            {connectionStatus === "success" && (
              <>
                <Ionicons name="checkmark-circle" size={28} color="#34C759" />
                <Text
                  style={[
                    styles.statusText,
                    { color: "#34C759", fontWeight: "bold" },
                  ]}
                >
                  Vault Synced!
                </Text>
              </>
            )}

            {connectionStatus === "error" && (
              <>
                <Ionicons name="warning" size={24} color="#FF3B30" />
                <Text style={[styles.statusText, { color: "#FF3B30" }]}>
                  {errorMessage}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  targetContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  targetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 20,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: "rgba(30,30,30,0.9)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 15,
  },
  statusText: {
    color: "#FFF",
    fontSize: 15,
    flex: 1,
  },
});
