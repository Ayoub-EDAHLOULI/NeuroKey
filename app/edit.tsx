import CustomAlert from "@/src/components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useVault } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

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

  // Find initial icon
  const initialIcon =
    BRAND_ICONS.find((b) => b.icon === params.icon) || BRAND_ICONS[10];
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdate = () => {
    if (!serviceName || !password) {
      CustomAlert({
        visible: true,
        title: "Missing Info",
        message: "Name and Password are required.",
        onClose: () => {},
        theme,
      });
      return;
    }

    // 2. CALL UPDATE
    updateVaultItem(params.id as string, {
      type: "password",
      name: serviceName,
      email,
      password,
      url,
      notes,
      icon: selectedIcon.icon,
      color: selectedIcon.color,
    });

    // 3. GO BACK (Closes the modal)
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20 }}
          >
            {BRAND_ICONS.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                onPress={() => setSelectedIcon(brand)}
                style={{ alignItems: "center", marginRight: 20 }}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        selectedIcon.id === brand.id ? brand.color : theme.card,
                      borderWidth: 2,
                      borderColor:
                        selectedIcon.id === brand.id
                          ? "transparent"
                          : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={brand.icon as any}
                    size={28}
                    color={
                      selectedIcon.id === brand.id ? "#FFF" : theme.subText
                    }
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
              { borderBottomColor: "transparent", paddingRight: 10 },
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
        </View>

        <View style={[styles.formGroup, { marginTop: 24 }]}>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.card, borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>URL</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
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
});
