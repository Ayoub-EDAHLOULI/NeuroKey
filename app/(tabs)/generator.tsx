import CustomAlert from "@/src/components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
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

export default function GeneratorScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  // --- STATE ---
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strengthScore, setStrengthScore] = useState(0);

  // --- GENERATOR LOGIC ---
  const generatePassword = useCallback(() => {
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let chars = "";
    if (includeUpper) chars += uppers;
    if (includeLower) chars += lowers;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    // Fallback if nothing selected
    if (chars === "") {
      chars = lowers;
      setIncludeLower(true);
    }

    let generated = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generated += chars[randomIndex];
    }
    setPassword(generated);
    calculateStrength(generated);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // Run on first load and whenever settings change
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // --- STRENGTH LOGIC ---
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrengthScore(score);
  };

  const getStrengthColor = () => {
    if (strengthScore <= 2) return theme.strengthWeak;
    if (strengthScore === 3) return theme.strengthMedium;
    return theme.strengthStrong;
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return "Weak";
    if (strengthScore === 3) return "Good";
    return "Strong";
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(password);
    CustomAlert({
      visible: true,
      title: "Copied",
      message: "Password copied to clipboard.",
      onClose: () => {},
      theme,
    });
  };

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
          Generator
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 1. PASSWORD DISPLAY CARD */}
        <View
          style={[styles.card, { backgroundColor: theme.card, marginTop: 20 }]}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text
              style={[
                styles.passwordText,
                {
                  color: theme.text,
                  fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                },
              ]}
              selectable
            >
              {password}
            </Text>
            <Text
              style={{
                color: getStrengthColor(),
                marginTop: 8,
                fontWeight: "600",
              }}
            >
              {getStrengthLabel()}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.inputBg }]}
              onPress={generatePassword}
            >
              <Ionicons name="refresh" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: theme.primary }]}
              onPress={copyToClipboard}
            >
              <Ionicons
                name="copy-outline"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 16 }}>
                Copy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. SETTINGS GROUP */}
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>
          OPTIONS
        </Text>

        <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
          {/* Length Slider */}
          <View
            style={[
              styles.row,
              {
                borderBottomColor: theme.border,
                flexDirection: "column",
                alignItems: "stretch",
                paddingVertical: 16,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={[styles.label, { color: theme.text }]}>Length</Text>
              <Text style={[styles.value, { color: theme.primary }]}>
                {length}
              </Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={8}
              maximumValue={32}
              step={1}
              value={length}
              onValueChange={setLength}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.inputBg}
              thumbTintColor={theme.primary}
            />
          </View>

          {/* Toggles */}
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Uppercase (A-Z)
            </Text>
            <Switch
              value={includeUpper}
              onValueChange={setIncludeUpper}
              trackColor={{ false: theme.inputBg, true: theme.primary }}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Lowercase (a-z)
            </Text>
            <Switch
              value={includeLower}
              onValueChange={setIncludeLower}
              trackColor={{ false: theme.inputBg, true: theme.primary }}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Numbers (0-9)
            </Text>
            <Switch
              value={includeNumbers}
              onValueChange={setIncludeNumbers}
              trackColor={{ false: theme.inputBg, true: theme.primary }}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: "transparent" }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Symbols (!@#)
            </Text>
            <Switch
              value={includeSymbols}
              onValueChange={setIncludeSymbols}
              trackColor={{ false: theme.inputBg, true: theme.primary }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 10, marginTop: 10 },
  headerTitle: { fontSize: 34, fontWeight: "bold" },

  card: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  passwordText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
    width: "100%",
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  copyButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    marginLeft: 20,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  settingsGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 16, fontWeight: "500" },
  value: { fontSize: 16, fontWeight: "bold" },
});
