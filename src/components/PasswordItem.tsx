import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../theme";

// Define what data we pass to this component
interface PasswordItemProps {
  title: string;
  email: string;
  colorScheme: "light" | "dark";
  onPress: () => void;
}

export default function PasswordItem({
  title,
  email,
  colorScheme,
  onPress,
}: PasswordItemProps) {
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 1. The Icon Placeholder (like the logos in your image) */}
      <View style={[styles.iconContainer, { backgroundColor: theme.inputBg }]}>
        <Text style={[styles.iconText, { color: theme.text }]}>
          {title.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* 2. The Text Info */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>{email}</Text>
      </View>

      {/* 3. The Arrow/Menu Dots */}
      <Entypo size={20} name="chevron-right" color={theme.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 1, // Tiny separator effect
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});
