import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// 👇 Import the component
import CustomAlert from "../src/components/CustomAlert";
import { useVault } from "../src/context/VaultContext";
import { checkPasswordLeak } from "../src/core/security/breachCheck";
import { Colors } from "../src/theme";

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const { deleteVaultItem, items, isLoading } = useVault();
  const item = items.find((p) => p.id === params.id);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);

  // 👇 NEW: Alert State Control
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    buttons?: any[];
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    type: any = "info",
    buttons: any[] = [],
  ) => {
    setAlertConfig({ visible: true, title, message, type, buttons });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Run Breach Check on Load
  useEffect(() => {
    if (item?.password) {
      runBreachCheck(item.password);
    }
  }, [item?.password]);

  const runBreachCheck = async (password: string) => {
    setIsCheckingBreach(true);
    // Don't check empty or dummy passwords
    if (!password) {
      setIsCheckingBreach(false);
      return;
    }
    const count = await checkPasswordLeak(password);
    setBreachCount(count);
    setIsCheckingBreach(false);
  };

  // CASE 1: Loading
  if (isLoading) {
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
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // CASE 2: Not Found
  if (!item) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={50} color={theme.subText} />
        <Text style={{ color: theme.subText, marginTop: 10, fontSize: 16 }}>
          Password not found.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, padding: 10 }}
        >
          <Text style={{ color: theme.primary, fontSize: 18 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- ACTIONS ---

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    showAlert("Copied", `${label} copied to clipboard.`, "success");
  };

  const handleDelete = () => {
    showAlert(
      "Delete Password",
      "Are you sure? This action cannot be undone.",
      "warning",
      [
        { text: "Cancel", style: "cancel", onPress: closeAlert },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            closeAlert();
            deleteVaultItem(item.id);
            router.back();
          },
        },
      ],
    );
  };

  const renderIcon = () => {
    const { icon, color, name } = item;
    if (icon && icon.startsWith("logo-")) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
          <Ionicons name={icon as any} size={40} color={color || theme.text} />
        </View>
      );
    }
    return (
      <View
        style={[styles.iconCircle, { backgroundColor: color || theme.primary }]}
      >
        <Text style={{ fontSize: 30, color: "#FFF", fontWeight: "bold" }}>
          {name?.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/edit",
              params: { ...item, isDeleted: undefined },
            })
          }
        >
          <Text
            style={{ color: theme.primary, fontSize: 17, fontWeight: "600" }}
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          {renderIcon()}
          <Text style={[styles.title, { color: theme.text }]}>{item.name}</Text>
          <Text style={{ color: theme.subText, fontSize: 16 }}>
            {item.email}
          </Text>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>
            CREDENTIALS
          </Text>
        </View>
        <View style={[styles.groupContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>Username</Text>
            <Text
              style={[styles.value, { color: theme.subText }]}
              numberOfLines={1}
            >
              {item.email ?? "No email"}
            </Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(item.email ?? "", "Username")}
            >
              <Ionicons name="copy-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.row, { borderBottomColor: "transparent" }]}>
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text
                style={[
                  styles.value,
                  {
                    color: theme.text,
                    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                  },
                ]}
              >
                {isPasswordVisible ? item.password : "••••••••••••••••"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={22}
                  color={theme.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => copyToClipboard(item.password ?? "", "Password")}
              >
                <Ionicons name="copy-outline" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* BREACH RADAR BANNER */}
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          {isCheckingBreach ? (
            <View style={[styles.radarCard, { backgroundColor: theme.card }]}>
              <ActivityIndicator size="small" color={theme.subText} />
              <Text style={{ color: theme.subText, marginLeft: 10 }}>
                Scanning Breach Radar...
              </Text>
            </View>
          ) : breachCount !== null && breachCount > 0 ? (
            <View
              style={[
                styles.radarCard,
                {
                  backgroundColor: "#FF3B3020",
                  borderColor: "#FF3B30",
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons name="warning" size={24} color="#FF3B30" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
                  Leaked Password!
                </Text>
                <Text style={{ color: theme.text, fontSize: 13 }}>
                  Found in{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {breachCount.toLocaleString()}
                  </Text>{" "}
                  data breaches. Change this immediately.
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.radarCard,
                {
                  backgroundColor: "#34C75920",
                  borderColor: "#34C759",
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={24} color="#34C759" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#34C759", fontWeight: "bold" }}>
                  Safe & Secure
                </Text>
                <Text style={{ color: theme.text, fontSize: 13 }}>
                  No leaks detected in known data breaches.
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>
            DETAILS
          </Text>
        </View>
        <View style={[styles.groupContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>Website</Text>
            <Text
              style={[styles.value, { color: theme.subText }]}
              numberOfLines={1}
            >
              {item.url ?? "None"}
            </Text>
          </View>
          <View
            style={[
              styles.row,
              {
                borderBottomColor: "transparent",
                alignItems: "flex-start",
                paddingVertical: 12,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
              Notes
            </Text>
            <Text
              style={[styles.value, { color: theme.subText, lineHeight: 20 }]}
            >
              {item.notes || "No notes added."}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.card }]}
          onPress={handleDelete}
        >
          <Text
            style={{ color: theme.danger, fontSize: 17, fontWeight: "600" }}
          >
            Delete Password
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 👇 RENDER CUSTOM ALERT HERE */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={closeAlert}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  roundBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(128,128,128, 0.15)",
  },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: "500" },
  groupContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { width: 90, fontSize: 16, fontWeight: "500" },
  value: { flex: 1, fontSize: 16, marginRight: 10 },
  deleteButton: {
    marginTop: 30,
    marginHorizontal: 16,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radarCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 10,
    borderRadius: 12,
  },
});
