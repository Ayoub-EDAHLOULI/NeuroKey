import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreditCard from "../../src/components/CreditCard";
import { useVault } from "../../src/context/VaultContext";
import { Colors } from "../../src/theme";

export default function WalletScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  const { items } = useVault();

  // Filter only Cards
  const cards = items.filter((item) => item.type === "card");

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top + 10 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Wallet</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.inputBg }]}
          onPress={() => router.push("/add-card")}
        >
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({ pathname: "/card-detail", params: { id: item.id } })
            }
          >
            <CreditCard
              holder={item.cardHolder || "Your Name"}
              number={item.cardNumber || "0000 0000 0000 0000"}
              expiry={item.expiry || "00/00"}
              type={item.cardType || "visa"}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="card-outline" size={60} color={theme.subText} />
            <Text style={{ color: theme.subText, marginTop: 10 }}>
              No cards yet.
            </Text>
          </View>
        }
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
    marginTop: 10,
  },
  headerTitle: { fontSize: 34, fontWeight: "bold" },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
