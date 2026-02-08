import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "cancel" | "destructive" | "default";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  theme: any;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [],
  type = "info",
  onClose,
  theme,
}: CustomAlertProps) {
  if (!visible) return null;

  // Icon Configuration
  const getIcon = () => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#34C759" };
      case "error":
        return { name: "alert-circle", color: "#FF3B30" };
      case "warning":
        return { name: "warning", color: "#FF9500" };
      default:
        return { name: "information-circle", color: "#007AFF" };
    }
  };

  const { name, color } = getIcon();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Dimmed Background */}
      <View style={styles.overlay}>
        {/* Animated Card */}
        <Animated.View
          entering={ZoomIn.duration(300)}
          exiting={ZoomOut.duration(200)}
          style={[styles.card, { backgroundColor: theme.card }]}
        >
          {/* Icon Header */}
          <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
            <Ionicons name={name as any} size={32} color={color} />
          </View>

          {/* Content */}
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.subText }]}>
            {message}
          </Text>

          {/* Buttons Area */}
          <View style={styles.buttonContainer}>
            {buttons.length === 0 ? (
              // Default "OK" Button if none provided
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={onClose}
              >
                <Text style={styles.buttonTextPrimary}>OK</Text>
              </TouchableOpacity>
            ) : (
              // Custom Buttons
              buttons.map((btn, index) => {
                const isDestructive = btn.style === "destructive";
                const isCancel = btn.style === "cancel";

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isCancel
                        ? {
                            backgroundColor: theme.inputBg,
                            flex: 1,
                            marginRight: 8,
                          }
                        : {
                            backgroundColor: isDestructive
                              ? theme.danger
                              : theme.primary,
                            flex: 2,
                          },
                    ]}
                    onPress={() => {
                      if (btn.onPress) btn.onPress();
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        isCancel
                          ? styles.buttonTextSecondary
                          : styles.buttonTextPrimary,
                        isCancel && { color: theme.text },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: width - 60,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextPrimary: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
  },
});
