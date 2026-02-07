import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreditCard from "../src/components/CreditCard"; // Import your card component
import { useVault } from "../src/context/VaultContext";
import { Colors } from "../src/theme";

export default function CardDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const { deleteVaultItem, items } = useVault();

  // Find the LIVE item
  const item = items.find((p) => p.id === params.id);
  const [isCvvVisible, setIsCvvVisible] = useState(false);

  if (!item) return null;

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === "ios") Alert.alert("Copied", `${label} copied.`);
  };

  const handleDelete = () => {
    Alert.alert("Delete Card", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteVaultItem(item.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/add-card", params: { ...item } })
          }
        >
          {/* Note: You might want to create a separate /edit-card page later */}
          <Text
            style={{ color: theme.primary, fontSize: 17, fontWeight: "600" }}
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 1. VISUAL CARD */}
        <View style={{ paddingHorizontal: 20, marginVertical: 20 }}>
          <CreditCard
            holder={item.cardHolder || "Name"}
            number={item.cardNumber || "0000"}
            expiry={item.expiry || "00/00"}
            type={item.cardType || "visa"}
          />
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.subText }]}>
            CARD DETAILS
          </Text>
        </View>

        <View style={[styles.groupContainer, { backgroundColor: theme.card }]}>
          {/* Card Number */}
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>Number</Text>
            <Text
              style={[
                styles.value,
                {
                  color: theme.subText,
                  fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                },
              ]}
            >
              {item.cardNumber}
            </Text>
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(item.cardNumber || "", "Card Number")
              }
            >
              <Ionicons name="copy-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Expiry */}
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>Expiry</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {item.expiry}
            </Text>
          </View>

          {/* CVV */}
          <View style={[styles.row, { borderBottomColor: "transparent" }]}>
            <Text style={[styles.label, { color: theme.text }]}>CVV</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.value, { color: theme.text }]}>
                {isCvvVisible ? item.cvv : "•••"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity onPress={() => setIsCvvVisible(!isCvvVisible)}>
                <Ionicons
                  name={isCvvVisible ? "eye-off" : "eye"}
                  size={22}
                  color={theme.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => copyToClipboard(item.cvv || "", "CVV")}
              >
                <Ionicons name="copy-outline" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes */}
        {item.notes ? (
          <>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: theme.subText }]}>
                NOTES
              </Text>
            </View>
            <View
              style={[styles.groupContainer, { backgroundColor: theme.card }]}
            >
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
                <Text
                  style={[styles.value, { color: theme.text, lineHeight: 20 }]}
                >
                  {item.notes}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.card }]}
          onPress={handleDelete}
        >
          <Text
            style={{ color: theme.danger, fontSize: 17, fontWeight: "600" }}
          >
            Delete Card
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
});
