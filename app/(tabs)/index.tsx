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
import { useVault } from "../../src/context/VaultContext";
import { Colors } from "../../src/theme";

// --- HELPER: Random Color Generator for Fallback Icons ---
const getFallbackColor = (name: string) => {
  const colors = [
    "#007AFF",
    "#FF9500",
    "#FF3B30",
    "#5856D6",
    "#34C759",
    "#AF52DE",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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
  // Use the specific color if provided, otherwise generate a consistent color based on name
  const displayColor = color || getFallbackColor(serviceName);

  if (icon && icon.startsWith("logo-")) {
    // Brand Logo (e.g., Google, Apple)
    return (
      <View style={[styles.iconContainer, { backgroundColor: displayColor }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
    );
  }

  // Fallback: Colored Square with Initial
  return (
    <View style={[styles.iconContainer, { backgroundColor: displayColor }]}>
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
  const { items } = useVault();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = items.filter(
    (item) =>
      item.type === "password" &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top + 10 },
      ]}
    >
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* 1. HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Passwords
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 2. SEARCH BAR */}
      <View style={styles.searchWrapper}>
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
            placeholder="Search passwords..."
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* 3. LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cardItem, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
            onPress={() => {
              if (item.type === "card") {
                router.push({
                  pathname: "/card-detail",
                  params: { id: item.id },
                });
              } else {
                router.push({ pathname: "/detail", params: { id: item.id } });
              }
            }}
          >
            {/* Left: Icon */}
            <BrandIcon
              serviceName={item.name}
              icon={item.icon}
              color={item.color}
              theme={theme}
            />

            {/* Middle: Text Info */}
            <View style={styles.textContainer}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemSubtitle, { color: theme.subText }]}>
                {item.email}
              </Text>
            </View>

            {/* Right: Chevron */}
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
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
              No passwords found.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF", // Blue circle like the design
    justifyContent: "center",
    alignItems: "center",
  },

  // Search Styles
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44, // Standard iOS search bar height
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    height: "100%",
  },

  // Card List Styles
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16, // Rounded corners for each item
    marginBottom: 12, // Space between items
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12, // Squircle shape
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
  },
});
