import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "../../src/components/CustomAlert";
import { Colors } from "../../src/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  // --- STATE ---
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [autoLock, setAutoLock] = useState(true);

  // Alert State
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

  // --- LOAD SETTINGS ON START ---
  useEffect(() => {
    (async () => {
      // 1. Biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      const savedBiometric = await AsyncStorage.getItem("use_biometric");
      setFaceIdEnabled(savedBiometric === "true");

      // 2. Auto Lock (Default to true if not set)
      const savedAutoLock = await AsyncStorage.getItem("auto_lock");
      setAutoLock(savedAutoLock !== "false"); // Default true
    })();
  }, []);

  // --- HANDLERS ---

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm Identity",
        fallbackLabel: "Use Password",
      });
      if (result.success) {
        setFaceIdEnabled(true);
        await AsyncStorage.setItem("use_biometric", "true");
        showAlert("Secured", "Face ID / Touch ID enabled.", "success");
      }
    } else {
      setFaceIdEnabled(false);
      await AsyncStorage.setItem("use_biometric", "false");
    }
  };

  // --- UPDATED: Save Auto-Lock Preference ---
  const handleAutoLockToggle = async (value: boolean) => {
    setAutoLock(value);
    await AsyncStorage.setItem("auto_lock", String(value));
  };

  // --- ACTIONS ---
  const handleClearData = async () => {
    showAlert("Wipe Data?", "This cannot be undone.", "warning", [
      { text: "Cancel", style: "cancel", onPress: closeAlert },
      {
        text: "Wipe",
        style: "destructive",
        onPress: async () => {
          closeAlert();
          await AsyncStorage.clear();
          Updates.reloadAsync();
        },
      },
    ]);
  };

  // --- COMPONENT ---
  const SettingRow = ({
    icon,
    color,
    label,
    isSwitch,
    value,
    onToggle,
    onPress,
    disabled,
  }: any) => (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: theme.border, opacity: disabled ? 0.5 : 1 },
      ]}
      onPress={onPress}
      disabled={isSwitch || disabled}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
          <Ionicons name={icon} size={18} color="#FFF" />
        </View>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.inputBg, true: theme.primary }}
          disabled={disabled}
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
            onToggle={handleBiometricToggle}
            disabled={!isBiometricSupported}
          />
          {/* 👇 Using the new handler */}
          <SettingRow
            icon="lock-closed-outline"
            color="#FF9500"
            label="Auto-Lock"
            isSwitch
            value={autoLock}
            onToggle={handleAutoLockToggle}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          DATA
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="sync-outline"
            color="#AF52DE"
            label="Sync with Desktop"
            onPress={() => router.push("/sync")}
          />
          <SettingRow
            icon="cloud-upload-outline"
            color="#007AFF"
            label="Backup Vault"
            onPress={() => showAlert("Backup", "Coming soon!", "info")}
          />
          <SettingRow
            icon="download-outline"
            color="#5856D6"
            label="Import Passwords"
            onPress={() => showAlert("Import", "Coming soon!", "info")}
          />
        </View>

        {/* SECTION 3: ABOUT */}
        <Text style={[styles.sectionHeader, { color: theme.subText }]}>
          ABOUT
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="shield-checkmark-outline"
            color="#32ADE6"
            label="Security Guide"
            onPress={() => router.push("/security-tips")}
          />
          <SettingRow
            icon="person-outline"
            color="#AF52DE"
            label="Developer"
            onPress={() => router.push("/about")}
          />
          <SettingRow
            icon="star-outline"
            color="#FFD60A"
            label="Rate App"
            onPress={() => showAlert("Thanks!", "You are awesome!", "success")}
          />
        </View>

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
  group: { marginHorizontal: 16, borderRadius: 12, overflow: "hidden" },
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
