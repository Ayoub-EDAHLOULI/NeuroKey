import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { useVault } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

export default function EditCardScreen() {
  const router = useRouter();
  // 👇 Get the existing card data passed from Detail Screen
  const params = useLocalSearchParams();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const { updateVaultItem } = useVault(); // Using update function

  // --- INITIALIZE STATE WITH EXISTING DATA ---
  const [holder, setHolder] = useState((params.cardHolder as string) || "");
  const [number, setNumber] = useState((params.cardNumber as string) || "");
  const [expiry, setExpiry] = useState((params.expiry as string) || "");
  const [cvv, setCvv] = useState((params.cvv as string) || "");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex">(
    (params.cardType as "visa" | "mastercard" | "amex") || "visa",
  );
  const [notes, setNotes] = useState((params.notes as string) || "");

  // --- HELPERS (Same as Add) ---
  const handleNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const truncated = cleaned.slice(0, 16);
    setNumber(truncated);
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  // --- UPDATE ACTION ---
  const handleUpdate = () => {
    if (!holder || number.length < 15 || !expiry) {
      Alert.alert("Incomplete Card", "Please fill in the card details.");
      return;
    }

    // 👇 Call UPDATE instead of ADD
    updateVaultItem(params.id as string, {
      name: `${cardType.toUpperCase()} ending in ${number.slice(-4)}`,
      cardHolder: holder,
      cardNumber: number,
      expiry,
      cvv,
      cardType,
      notes,
      type: "card",
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
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.primary, fontSize: 17 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Edit Card
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
        {/* LIVE PREVIEW */}
        <View style={styles.previewContainer}>
          <CreditCard
            holder={holder || "CARD HOLDER"}
            number={number || "0000000000000000"}
            expiry={expiry || "MM/YY"}
            type={cardType}
          />
        </View>

        {/* TYPE PICKER */}
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

        {/* FORM */}
        <View style={styles.formGroup}>
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
              keyboardType="number-pad"
              value={number}
              onChangeText={handleNumberChange}
              maxLength={19}
            />
            <Ionicons name="card-outline" size={20} color={theme.subText} />
          </View>

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
              value={holder}
              onChangeText={setHolder}
              autoCapitalize="characters"
            />
          </View>

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
                keyboardType="number-pad"
                value={cvv}
                onChangeText={setCvv}
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* NOTES */}
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
  previewContainer: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 10,
  },
  typeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
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
