import React from "react";
import { FlatList, StyleSheet, Text, useColorScheme, View } from "react-native";
import PasswordItem from "../../src/components/PasswordItem";
import { Colors } from "../../src/theme";

// Dummy data to test the UI (Matches your image)
const DUMMY_DATA = [
  { id: "1", title: "Amazon", email: "jane.smith@email.com" },
  { id: "2", title: "Apple", email: "jane.smith@work.com" },
  { id: "3", title: "Allybank", email: "jane.smith@email.com" },
  { id: "4", title: "Airbnb", email: "+6281234567890" },
];

export default function VaultScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. Header (Like "Password" in your design) */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Passwords
        </Text>
      </View>

      {/* 2. Search Bar Placeholder */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
        <Text style={{ color: theme.subText }}>Search Password</Text>
      </View>

      {/* 3. The List */}
      <FlatList
        data={DUMMY_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PasswordItem
            title={item.title}
            email={item.email}
            colorScheme={scheme || "light"}
            onPress={() => console.log("Clicked", item.title)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60, // Space for status bar
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 20,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
