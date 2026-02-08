import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "../src/components/CustomAlert";
import { useVault } from "../src/context/VaultContext";
import { Colors } from "../src/theme";
// 👇 Import UniversalIcon & Helper
import UniversalIcon, { getFaviconUrl } from "../src/components/UniversalIcon";

// Use same icon list config as Add Screen
const BRAND_ICONS = [
  { id: "amazon", name: "Amazon", icon: "logo-amazon", color: "#FF9900" },
  { id: "google", name: "Google", icon: "logo-google", color: "#4285F4" },
  { id: "apple", name: "Apple", icon: "logo-apple", color: "#000000" },
  { id: "facebook", name: "Facebook", icon: "logo-facebook", color: "#1877F2" },
  {
    id: "instagram",
    name: "Instagram",
    icon: "logo-instagram",
    color: "#E1306C",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "logo-twitter",
    color: "#1DA1F2",
  },
  { id: "linkedin", name: "LinkedIn", icon: "logo-linkedin", color: "#0077B5" },
  { id: "bank", name: "Bank", icon: "card", color: "#34C759" },
  { id: "crypto", name: "Crypto", icon: "wallet", color: "#F7931A" },
  { id: "mail", name: "Email", icon: "mail", color: "#5856D6" },
  { id: "other", name: "Other", icon: "key", color: "#8E8E93" },
];

export default function EditPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const { updateVaultItem } = useVault();

  // 1. LOAD INITIAL DATA from params
  const [serviceName, setServiceName] = useState((params.name as string) || "");
  const [email, setEmail] = useState((params.email as string) || "");
  const [password, setPassword] = useState((params.password as string) || "");
  const [url, setUrl] = useState((params.url as string) || "");
  const [notes, setNotes] = useState((params.notes as string) || "");

  // Initialize Icon state
  // Check if existing icon is a URL or a preset name
  const existingIcon = (params.icon as string) || BRAND_ICONS[10].icon;
  const existingColor = (params.color as string) || BRAND_ICONS[10].color;

  const [selectedIcon, setSelectedIcon] = useState(existingIcon);
  const [selectedColor, setSelectedColor] = useState(existingColor);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title: string, message: string, type: any = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // --- 👇 NEW: AUTO-FETCH FAVICON LOGIC ---
  // Only trigger if URL changes AND it's different from the initial one
  // (We don't want to overwrite a custom icon just because the page loaded)
  useEffect(() => {
    if (url && url !== params.url && url.length > 4 && url.includes(".")) {
      const fetchIcon = getFaviconUrl(url);
      if (fetchIcon) {
        setSelectedIcon(fetchIcon);
        setSelectedColor(theme.card);
      }
    }
  }, [url, theme.card, params.url]);

  // --- GENERATOR HELPERS ---
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let autoPass = "";
    for (let i = 0; i < 16; i++) {
      autoPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(autoPass);
  };

  useEffect(() => {
    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    setPasswordStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    if (password.length === 0) return theme.border;
    if (passwordStrength <= 1) return theme.strengthWeak;
    if (passwordStrength === 2) return theme.strengthMedium;
    return theme.strengthStrong;
  };

  const handleUpdate = () => {
    if (!serviceName || !password) {
      showAlert("Missing Info", "Name and Password are required.", "error");
      return;
    }

    updateVaultItem(params.id as string, {
      type: "password",
      name: serviceName,
      email,
      password,
      url,
      notes,
      icon: selectedIcon, // Could be URL or "logo-..."
      color: selectedColor,
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 30 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.primary, fontSize: 17 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Edit Password
        </Text>
        <TouchableOpacity onPress={handleUpdate}>
          <Text
            style={{ color: theme.primary, fontSize: 17, fontWeight: "bold" }}
          >
            Update
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ICON PICKER */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          {/* 👇 Preview Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 10,
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: "500", color: theme.subText }}
            >
              CHOOSE ICON
            </Text>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: selectedColor,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                },
              ]}
            >
              <UniversalIcon
                icon={selectedIcon}
                size={24}
                color={selectedIcon.startsWith("http") ? undefined : "#FFF"}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20 }}
          >
            {BRAND_ICONS.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                onPress={() => {
                  setSelectedIcon(brand.icon);
                  setSelectedColor(brand.color);
                }}
                style={{ alignItems: "center", marginRight: 20 }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        selectedIcon === brand.icon ? brand.color : theme.card,
                      borderWidth: 2,
                      borderColor:
                        selectedIcon === brand.icon
                          ? "transparent"
                          : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={brand.icon as any}
                    size={28}
                    color={selectedIcon === brand.icon ? "#FFF" : theme.subText}
                  />
                </View>
                <Text
                  style={{ marginTop: 8, fontSize: 12, color: theme.subText }}
                >
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FORM FIELDS */}
        <View style={styles.formGroup}>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.card, borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={serviceName}
              onChangeText={setServiceName}
            />
          </View>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.card, borderBottomColor: "transparent" },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.subText, marginLeft: 20, marginTop: 24 },
          ]}
        >
          PASSWORD
        </Text>
        <View style={[styles.formGroup, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.inputRow,
              { borderBottomColor: theme.border, paddingRight: 10 },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text, flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color={theme.subText}
              />
            </TouchableOpacity>
          </View>

          {/* Strength Bar */}
          <View style={{ flexDirection: "row", height: 4, width: "100%" }}>
            <View
              style={{
                flex: 1,
                backgroundColor:
                  password.length > 0 ? getStrengthColor() : "transparent",
                opacity: 0.3,
              }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor:
                  passwordStrength >= 2 ? getStrengthColor() : "transparent",
                opacity: 0.5,
              }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor:
                  passwordStrength >= 3 ? getStrengthColor() : "transparent",
                opacity: 0.8,
              }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor:
                  passwordStrength >= 4 ? getStrengthColor() : "transparent",
                opacity: 1.0,
              }}
            />
          </View>

          {/* Generator Button */}
          <TouchableOpacity style={styles.actionRow} onPress={generatePassword}>
            <Ionicons name="sparkles" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              Generate New Password
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.formGroup, { marginTop: 24 }]}>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.card, borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>URL</Text>
            {/* 👇 UPDATED: URL INPUT */}
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              placeholder="https://example.com"
              placeholderTextColor={theme.subText}
            />
          </View>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.card,
                height: 100,
                alignItems: "flex-start",
                paddingTop: 12,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
              Notes
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, height: 80 }]}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  sectionTitle: { fontSize: 13, marginBottom: 8, fontWeight: "500" },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  formGroup: { borderRadius: 12, overflow: "hidden", marginHorizontal: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { width: 80, fontSize: 16, fontWeight: "500" },
  input: { flex: 1, fontSize: 16 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 8,
  },
  actionText: { fontSize: 16, fontWeight: "600" },
});
