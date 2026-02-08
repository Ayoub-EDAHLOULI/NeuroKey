import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import CreditCard from "../src/components/CreditCard";
import CustomAlert from "../src/components/CustomAlert";
import { useVault } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

export default function AddCardScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const { addVaultItem } = useVault();

  // --- STATE ---
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex">(
    "visa",
  );
  const [notes, setNotes] = useState("");

  // --- FORMATTING HELPERS ---

  // 1. Format Card Number (1234 5678...)
  const handleNumberChange = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, "");
    // Limit to 16 digits
    const truncated = cleaned.slice(0, 16);
    setNumber(truncated);
  };

  // 2. Format Expiry (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  // --- SAVE ACTION ---
  const handleSave = () => {
    if (!holder || number.length < 15 || !expiry) {
      CustomAlert({
        visible: true,
        title: "Incomplete Card",
        message: "Please fill in the card details.",
        onClose: () => {},
        theme,
      });
      return;
    }

    addVaultItem({
      type: "card", // 👈 Important: Mark it as a card
      name: `${cardType.toUpperCase()} ending in ${number.slice(-4)}`, // Auto-generate a name
      cardHolder: holder,
      cardNumber: number,
      expiry,
      cvv,
      cardType,
      notes,
      // Default styles for cards
      color: "#007AFF",
      icon: "card",
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 30 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.primary, fontSize: 17 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add Card
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text
            style={{ color: theme.primary, fontSize: 17, fontWeight: "bold" }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 1. LIVE PREVIEW */}
        <View style={styles.previewContainer}>
          <CreditCard
            holder={holder || "CARD HOLDER"}
            number={number || "0000000000000000"}
            expiry={expiry || "MM/YY"}
            type={cardType}
          />
        </View>

        {/* 2. CARD TYPE PICKER */}
        <View style={styles.typeSelector}>
          {["visa", "mastercard", "amex"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    cardType === type ? theme.primary : theme.inputBg,
                  borderColor:
                    cardType === type ? theme.primary : "transparent",
                  borderWidth: 1,
                },
              ]}
              onPress={() => setCardType(type as any)}
            >
              <Text
                style={{
                  color: cardType === type ? "#FFF" : theme.text,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. FORM INPUTS */}
        <View style={styles.formGroup}>
          {/* Card Number */}
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.card, borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>Number</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={theme.subText}
              keyboardType="number-pad"
              value={number} // We display the raw number, but the CreditCard component handles formatting visually
              onChangeText={handleNumberChange}
              maxLength={19} // With spaces
            />
            <Ionicons name="card-outline" size={20} color={theme.subText} />
          </View>

          {/* Holder Name */}
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.card, borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>Holder</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Name on Card"
              placeholderTextColor={theme.subText}
              value={holder}
              onChangeText={setHolder}
              autoCapitalize="characters"
            />
          </View>

          {/* Expiry & CVV Row */}
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: theme.card,
                  borderBottomColor: "transparent",
                  flex: 1,
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderRightColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.label, { color: theme.text, width: 60 }]}>
                Exp.
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="MM/YY"
                placeholderTextColor={theme.subText}
                keyboardType="number-pad"
                value={expiry}
                onChangeText={handleExpiryChange}
                maxLength={5}
              />
            </View>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: theme.card,
                  borderBottomColor: "transparent",
                  flex: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: theme.text, width: 60, paddingLeft: 10 },
                ]}
              >
                CVV
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="123"
                placeholderTextColor={theme.subText}
                keyboardType="number-pad"
                value={cvv}
                onChangeText={setCvv}
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* 4. NOTES */}
        <View style={[styles.formGroup, { marginTop: 24 }]}>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.card,
                height: 100,
                alignItems: "flex-start",
                paddingTop: 12,
                borderBottomColor: "transparent",
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
              Notes
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, height: 80 }]}
              placeholder="Billing address, PIN, etc."
              placeholderTextColor={theme.subText}
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

  previewContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },

  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 10,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  formGroup: {
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
  },
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
