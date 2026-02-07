import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../src/theme";
// 👇 Import the Hook
import { useVault } from "../../src/context/VaultContext";

// --- COMPONENT: BRAND ICON ---
const BrandIcon = ({
  serviceName,
  icon,
  color,
  theme,
}: {
  serviceName: string;
  icon?: string;
  color?: string;
  theme: any;
}) => {
  if (icon && icon.startsWith("logo-")) {
    return (
      <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
        <Ionicons name={icon as any} size={28} color={color || theme.text} />
      </View>
    );
  }

  if (icon) {
    return (
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: color || theme.primary },
        ]}
      >
        <Ionicons name={icon as any} size={24} color="#FFF" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: color || theme.primary },
      ]}
    >
      <Text style={styles.iconText}>{serviceName.charAt(0).toUpperCase()}</Text>
    </View>
  );
};

// --- MAIN SCREEN ---
export default function VaultScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  // 👇 Get Dynamic Data from Context
  const { passwords } = useVault();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = passwords.filter(
    (item) =>
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Passwords
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.inputBg }]}
          onPress={() => router.push("/add")}
        >
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: theme.inputBg }]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.subText}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search Password"
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
            onPress={() => {
              // 👇 NAVIGATE WITH ID
              router.push({
                pathname: "/detail",
                params: {
                  id: item.id, // 👈 THIS WAS MISSING! CRITICAL!
                  title: item.serviceName,
                  email: item.email,
                  password: item.password,
                  icon: item.icon,
                  color: item.color,
                },
              });
            }}
          >
            <BrandIcon
              serviceName={item.serviceName}
              icon={item.icon}
              color={item.color}
              theme={theme}
            />

            <View style={styles.textContainer}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {item.serviceName}
              </Text>
              <Text style={[styles.itemSubtitle, { color: theme.subText }]}>
                {item.email}
              </Text>
            </View>

            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.subText}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons
              name="shield-checkmark-outline"
              size={50}
              color={theme.subText}
            />
            <Text style={{ color: theme.subText, marginTop: 10 }}>
              Your vault is empty.
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 17, height: "100%" },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  textContainer: { flex: 1 },
  itemTitle: { fontSize: 17, fontWeight: "600", marginBottom: 2 },
  itemSubtitle: { fontSize: 14 },
});
