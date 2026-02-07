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

// --- TYPE DEFINITION ---
// This is what a single password entry looks like
interface PasswordEntry {
  id: string;
  serviceName: string; // e.g., "Amazon"
  email: string;
  icon?: string; // e.g., "logo-amazon"
  color?: string; // For the placeholder circle
}

// --- DUMMY DATA (For Testing) ---
const MOCK_DATA: PasswordEntry[] = [
  {
    id: "1",
    serviceName: "Amazon",
    email: "jane.smith@email.com",
    icon: "logo-amazon",
    color: "#FF9900",
  },
  {
    id: "2",
    serviceName: "Apple ID",
    email: "jane.smith@work.com",
    icon: "logo-apple",
    color: "#000000",
  },
  {
    id: "3",
    serviceName: "Google",
    email: "jane.doe@gmail.com",
    icon: "logo-google",
    color: "#4285F4",
  },
  {
    id: "4",
    serviceName: "Facebook",
    email: "jane.social@fb.com",
    icon: "logo-facebook",
    color: "#1877F2",
  },
  {
    id: "5",
    serviceName: "Netflix",
    email: "jane.movies@email.com",
    color: "#E50914",
  }, // No icon, just color
  { id: "6", serviceName: "Airbnb", email: "+1 555 0199", color: "#FF5A5F" },
  {
    id: "7",
    serviceName: "Spotify",
    email: "jane.music@email.com",
    color: "#1DB954",
  },
  {
    id: "8",
    serviceName: "Twitter / X",
    email: "@janedoe",
    icon: "logo-twitter",
    color: "#1DA1F2",
  },
];

// --- COMPONENT: BRAND ICON ---
// Renders a logo if we have it, or a colored circle with initials if we don't
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
  if (icon) {
    // Known Brand Logo
    return (
      <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
        {/* Using Ionicons logos. Note: Not all brands exist in Ionicons, but major ones do */}
        <Ionicons name={icon as any} size={28} color={color || theme.text} />
      </View>
    );
  }

  // Fallback: Colored Circle with Initial
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

  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredData = MOCK_DATA.filter(
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

      {/* 1. HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Passwords
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.inputBg }]}
          onPress={() => router.push("/add")} // We will create this route next
        >
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. SEARCH BAR */}
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
          clearButtonMode="while-editing" // iOS only feature
        />
      </View>

      {/* 3. PASSWORD LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom tabs
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
            onPress={() => {
              // Navigate to Detail View
              router.push({
                pathname: "/detail",
                params: { title: item.serviceName, email: item.email },
              });
            }}
          >
            {/* Left: Icon */}
            <BrandIcon
              serviceName={item.serviceName}
              icon={item.icon}
              color={item.color}
              theme={theme}
            />

            {/* Middle: Text Info */}
            <View style={styles.textContainer}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {item.serviceName}
              </Text>
              <Text style={[styles.itemSubtitle, { color: theme.subText }]}>
                {item.email}
              </Text>
            </View>

            {/* Right: Action Icon */}
            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={theme.subText}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        // Empty State (No results)
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="search-outline" size={50} color={theme.subText} />
            <Text style={{ color: theme.subText, marginTop: 10 }}>
              No passwords found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 44, // Standard iOS search bar height
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    height: "100%",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 1, // Tiny separator line effect
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12, // Squircle shape
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
  },
});
