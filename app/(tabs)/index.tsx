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
// 👇 Import the new component
import UniversalIcon from "../../src/components/UniversalIcon";

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

// --- COMPONENT: BRAND ICON (UPDATED) ---
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
  const isImage = icon?.startsWith("http");

  // Logic:
  // 1. If it's a real image URL, give it a white/neutral background so transparent PNGs look right.
  // 2. If it's an Ionicon, use the user's selected color.
  // 3. Fallback to random hash color.
  const displayColor = isImage
    ? theme.dark
      ? "#333"
      : "#FFF"
    : color || getFallbackColor(serviceName);

  return (
    <View style={[styles.iconContainer, { backgroundColor: displayColor }]}>
      {icon ? (
        <UniversalIcon
          icon={icon}
          size={isImage ? 32 : 24} // Images look better slightly larger inside the container
          color="#FFFFFF"
        />
      ) : (
        <Text style={styles.iconText}>
          {serviceName.charAt(0).toUpperCase()}
        </Text>
      )}
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
            {/* Left: Icon (Uses UniversalIcon internally now) */}
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
    backgroundColor: "#007AFF",
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
    overflow: "hidden", // Ensures image doesn't bleed out
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
