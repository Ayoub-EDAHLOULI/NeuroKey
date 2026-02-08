import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Required for reset
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // Required for reset
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import CustomAlert from "../components/CustomAlert";
import {
  decryptData,
  deriveKey,
  encryptData,
  generateSalt,
  getSecureItem,
  saveSecureItem,
} from "../core/security/encryption";
import { Colors } from "../theme";

// --- COMPONENT 1: NEUROKEY LOGO (SVG) ---
const NeuroKeyLogo = () => (
  <View style={{ alignItems: "center", marginBottom: 20 }}>
    <Svg
      width={80}
      height={80}
      viewBox="0 0 64 64"
      style={{ shadowColor: "#AF52DE", shadowOpacity: 0.5, shadowRadius: 10 }}
    >
      <Defs>
        <LinearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#007AFF" />
          <Stop offset="100%" stopColor="#AF52DE" />
        </LinearGradient>
      </Defs>
      <Path
        d="M20 18C14 18 10 24 10 30C10 34 12 37 14 39C12 41 11 44 11 47C11 52 15 56 20 56C22 56 24 55 26 54C27 56 29 58 32 58"
        stroke="url(#brainGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M44 18C50 18 54 24 54 30C54 34 52 37 50 39C52 41 53 44 53 47C53 52 49 56 44 56C42 56 40 55 38 54C37 56 35 58 32 58"
        stroke="url(#brainGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M18 28C22 28 24 32 24 36M16 38C20 38 22 42 22 46"
        stroke="url(#brainGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M46 28C42 28 40 32 40 36M48 38C44 38 42 42 42 46"
        stroke="url(#brainGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M32 20V58"
        stroke="url(#brainGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Rect
        x="24"
        y="38"
        width="16"
        height="14"
        rx="3"
        fill="url(#brainGradient)"
      />
      <Path
        d="M27 38V32C27 29.2 29.2 27 32 27C34.8 27 37 29.2 37 32V38"
        stroke="url(#brainGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="32" cy="44" r="2" fill="white" />
      <Rect x="31" y="44" width="2" height="4" rx="1" fill="white" />
    </Svg>
    <Text
      style={{
        fontSize: 32,
        fontWeight: "bold",
        color: "#007AFF",
        marginTop: 10,
      }}
    >
      Neuro<Text style={{ color: "#AF52DE" }}>Key</Text>
    </Text>
    <Text style={{ color: "#8E8E93", marginTop: 5 }}>Your mind, secured.</Text>
  </View>
);

const SegmentControl = ({ values, selectedIndex, onChange, theme }: any) => {
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    indicatorPosition.value = withSpring(selectedIndex * 50, {
      damping: 20,
      stiffness: 150,
    });
  }, [selectedIndex, indicatorPosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: `${indicatorPosition.value}%`,
  }));

  return (
    <View
      style={{
        height: 50,
        backgroundColor: theme.inputBg,
        borderRadius: 12,
        flexDirection: "row",
        padding: 4,
        marginBottom: 24,
        position: "relative",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 4,
            bottom: 4,
            width: "50%",
            backgroundColor: theme.card,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 3,
            marginLeft: 4,
          },
          animatedStyle,
        ]}
      />
      {values.map((v: string, i: number) => (
        <TouchableOpacity
          key={v}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
          onPress={() => onChange(i)}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontWeight: "600",
              color: selectedIndex === i ? theme.text : theme.subText,
            }}
          >
            {v}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AuthInput = ({
  icon,
  placeholder,
  isPassword,
  value,
  onChange,
  theme,
  error,
}: any) => {
  const [showPass, setShowPass] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 56,
          backgroundColor: theme.inputBg,
          borderRadius: 12,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: error ? theme.danger : "transparent",
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={theme.subText}
          style={{ marginRight: 12 }}
        />
        <TextInput
          style={{ flex: 1, fontSize: 16, color: theme.text, height: "100%" }}
          placeholder={placeholder}
          placeholderTextColor={theme.subText}
          secureTextEntry={isPassword && !showPass}
          value={value}
          onChangeText={onChange}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons
              name={showPass ? "eye-off" : "eye"}
              size={20}
              color={theme.subText}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            color: theme.danger,
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

// --- MAIN SCREEN ---
export default function AuthScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === "dark" ? "dark" : "light"];

  const [mode, setMode] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // 👇 NEW: State to control the Custom Alert
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    buttons?: any[];
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  // Helper to trigger alert
  const showAlert = (
    title: string,
    message: string,
    type: any = "info",
    buttons: any[] = [],
  ) => {
    setAlertConfig({ visible: true, title, message, type, buttons });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const savedEmail = await getSecureItem("user_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setMode(0);
    } else {
      setMode(1);
    }
    setIsLoading(false);
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};
    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email";
      valid = false;
    }
    if (formData.password.length < 8) {
      newErrors.password = "Min 8 chars";
      valid = false;
    }
    if (mode === 1) {
      if (!formData.name) {
        newErrors.name = "Name required";
        valid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      if (mode === 1) {
        // REGISTER
        const salt = generateSalt();
        const key = deriveKey(formData.password, salt);
        const token = encryptData("VALID_TOKEN", key);
        if (token) {
          await saveSecureItem("user_email", formData.email);
          await saveSecureItem("vault_salt", salt);
          await saveSecureItem("vault_validation", token);

          // 👇 Custom Success Alert
          showAlert(
            "Welcome!",
            "Your account has been created successfully.",
            "success",
            [{ text: "Get Started", onPress: () => router.replace("/(tabs)") }],
          );
        }
      } else {
        // LOGIN
        const salt = await getSecureItem("vault_salt");
        const token = await getSecureItem("vault_validation");
        if (!salt || !token) {
          showAlert(
            "Account Not Found",
            "No account exists on this device.",
            "error",
          );
          return;
        }
        const key = deriveKey(formData.password, salt);
        const decrypted = decryptData(token, key);

        if (decrypted === "VALID_TOKEN") {
          router.replace("/(tabs)");
        } else {
          // 👇 Custom Error Alert
          showAlert(
            "Access Denied",
            "Incorrect password. Please try again.",
            "error",
          );
        }
      }
    } catch {
      showAlert(
        "System Error",
        "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 UPDATED: Handle Forgot Password with Custom Alert
  const handleForgotPassword = () => {
    showAlert(
      "Reset Vault?",
      "For security, your password acts as your encryption key.\n\nWe cannot recover it. Do you want to wipe your vault and start over?",
      "warning",
      [
        { text: "Cancel", style: "cancel", onPress: closeAlert },
        {
          text: "Wipe & Reset",
          style: "destructive",
          onPress: async () => {
            closeAlert(); // Close warning first
            try {
              setIsLoading(true);
              await SecureStore.deleteItemAsync("user_email");
              await SecureStore.deleteItemAsync("vault_salt");
              await SecureStore.deleteItemAsync("vault_validation");
              await AsyncStorage.clear();

              setMode(1);
              setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              });

              // Show success after wipe
              setTimeout(() => {
                showAlert(
                  "Reset Complete",
                  "Your vault has been wiped. You can now create a new account.",
                  "success",
                );
              }, 500);
            } catch {
              showAlert("Error", "Failed to reset data.", "error");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 18,
          marginTop: 40,
        }}
      >
        {/* LOGO ANIMATION */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <NeuroKeyLogo />
        </Animated.View>

        {/* CARD CONTAINER */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(800)}
          style={{
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 18,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 5,
          }}
        >
          <SegmentControl
            values={["Log In", "Sign Up"]}
            selectedIndex={mode}
            onChange={setMode}
            theme={theme}
          />

          <Animated.View layout={Layout.springify().damping(20).stiffness(150)}>
            {mode === 1 && (
              <Animated.View
                entering={FadeInUp.duration(300)}
                exiting={FadeOutUp.duration(200)}
              >
                <AuthInput
                  icon="person-outline"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(t: string) =>
                    setFormData({ ...formData, name: t })
                  }
                  theme={theme}
                  error={errors.name}
                />
              </Animated.View>
            )}

            <AuthInput
              icon="mail-outline"
              placeholder="Email Address"
              value={formData.email}
              onChange={(t: string) => setFormData({ ...formData, email: t })}
              theme={theme}
              error={errors.email}
            />
            <AuthInput
              icon="lock-closed-outline"
              isPassword
              placeholder="Password"
              value={formData.password}
              onChange={(t: string) =>
                setFormData({ ...formData, password: t })
              }
              theme={theme}
              error={errors.password}
            />

            {mode === 1 && (
              <Animated.View
                entering={FadeInUp.duration(300)}
                exiting={FadeOutUp.duration(200)}
              >
                <AuthInput
                  icon="lock-closed-outline"
                  isPassword
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(t: string) =>
                    setFormData({ ...formData, confirmPassword: t })
                  }
                  theme={theme}
                  error={errors.confirmPassword}
                />
              </Animated.View>
            )}
          </Animated.View>

          <TouchableOpacity
            style={{
              height: 56,
              backgroundColor: theme.primary,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              shadowColor: theme.primary,
              shadowOpacity: 0.4,
              shadowRadius: 10,
            }}
            onPress={handleSubmit}
          >
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
              {mode === 0 ? "Sign In" : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginTop: 20, gap: 15 }}>
            {mode === 0 && (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={{ color: theme.subText, fontWeight: "500" }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Text
          style={{
            textAlign: "center",
            color: theme.subText,
            fontSize: 12,
            marginTop: 40,
            opacity: 0.6,
          }}
        >
          Protected with end-to-end encryption
        </Text>
      </View>

      {/* 👇 RENDER THE CUSTOM ALERT */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={closeAlert}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
}
