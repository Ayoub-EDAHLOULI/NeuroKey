import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../src/theme";
// 👇 Import your Custom Alert
import CustomAlert from "../../src/components/CustomAlert";

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  // Fake state for UI demo
  const [faceIdEnabled, setFaceIdEnabled] = React.useState(true);
  const [autoLock, setAutoLock] = React.useState(true);

  // 👇 NEW: State for Custom Alert
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

  // --- ACTIONS ---

  // 1. CLEAR VAULT (Danger Zone)
  const handleClearData = async () => {
    showAlert(
      "Wipe All Data?",
      "This will permanently delete all passwords and cards. This cannot be undone.",
      "warning",
      [
        { text: "Cancel", style: "cancel", onPress: closeAlert },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            closeAlert(); // Close the warning modal
            try {
              await AsyncStorage.clear();
              // Show success modal after a small delay
              setTimeout(() => {
                showAlert(
                  "Success",
                  "Vault wiped. The app will now reload.",
                  "success",
                  [{ text: "OK", onPress: () => Updates.reloadAsync() }],
                );
              }, 500);
            } catch {
              setTimeout(() => {
                showAlert("Error", "Failed to clear data.", "error");
              }, 500);
            }
          },
        },
      ],
    );
  };

  // 2. OPEN LINK
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  // --- COMPONENT: SETTING ROW ---
  const SettingRow = ({
    icon,
    color,
    label,
    isSwitch = false,
    value = false,
    onToggle,
    isDestructive = false,
    onPress,
  }: any) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
          <Ionicons name={icon} size={18} color="#FFF" />
        </View>
        <Text
          style={[
            styles.label,
            { color: isDestructive ? theme.danger : theme.text },
          ]}
        >
          {label}
        </Text>
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.inputBg, true: theme.primary }}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.subText} />
      )}
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top + 10 },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* SECTION 1: SECURITY */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          SECURITY
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="scan-outline"
            color="#34C759"
            label="Face ID / Touch ID"
            isSwitch
            value={faceIdEnabled}
            onToggle={setFaceIdEnabled}
          />
          <SettingRow
            icon="lock-closed-outline"
            color="#FF9500"
            label="Auto-Lock"
            isSwitch
            value={autoLock}
            onToggle={setAutoLock}
          />
        </View>

        {/* SECTION 2: DATA */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          DATA
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="cloud-upload-outline"
            color="#007AFF"
            label="Backup Vault"
            onPress={() =>
              showAlert("Backup", "Cloud backup feature coming soon!", "info")
            }
          />
          <SettingRow
            icon="download-outline"
            color="#5856D6"
            label="Import Passwords"
            onPress={() =>
              showAlert("Import", "CSV Import feature coming soon!", "info")
            }
          />
        </View>

        {/* SECTION 3: ABOUT */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          ABOUT
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="information-circle-outline"
            color="#8E8E93"
            label="Privacy Policy"
            onPress={() => openLink("https://google.com")}
          />
          <SettingRow
            icon="star-outline"
            color="#FFD60A"
            label="Rate App"
            onPress={() => showAlert("Thanks!", "You are awesome!", "success")}
          />
        </View>

        {/* SECTION 4: DANGER ZONE */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          DANGER ZONE
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.row} onPress={handleClearData}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.iconBox, { backgroundColor: theme.danger }]}>
                <Ionicons name="trash-outline" size={18} color="#FFF" />
              </View>
              <Text style={[styles.label, { color: theme.danger }]}>
                Wipe All Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text
          style={{ textAlign: "center", color: theme.subText, marginTop: 20 }}
        >
          NeuroKey v1.0.0
        </Text>
      </ScrollView>

      {/* 👇 RENDER CUSTOM ALERT */}
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
  header: { paddingHorizontal: 20, paddingBottom: 10, marginTop: 10 },
  headerTitle: { fontSize: 34, fontWeight: "bold" },

  sectionHeader: {
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  group: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 50,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: { fontSize: 17 },
});
