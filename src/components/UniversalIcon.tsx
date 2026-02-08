import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image } from "react-native";

// Helper to get domain
export const getFaviconUrl = (url: string) => {
  try {
    // Remove protocol to find domain
    const clean = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
    if (!clean) return null;
    return `https://www.google.com/s2/favicons?domain=${clean}&sz=128`;
  } catch {
    return null;
  }
};

interface UniversalIconProps {
  icon: string; // Can be "logo-google" OR "https://..."
  size?: number;
  color?: string;
  style?: any;
}

export default function UniversalIcon({
  icon,
  size = 24,
  color = "#000",
  style,
}: UniversalIconProps) {
  const [error, setError] = useState(false);

  // 1. If it's a URL and hasn't failed loading
  if (icon?.startsWith("http") && !error) {
    return (
      <Image
        source={{ uri: icon }}
        style={[{ width: size, height: size, borderRadius: size / 4 }, style]}
        onError={() => setError(true)} // Fallback to icon on error
      />
    );
  }

  // 2. Fallback / Default Ionicon
  // If icon is a URL but failed, we show a generic globe
  const iconName = icon?.startsWith("http") || error ? "globe-outline" : icon;

  return (
    <Ionicons name={iconName as any} size={size} color={color} style={style} />
  );
}
