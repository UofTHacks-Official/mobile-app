import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { getThemeStyles } from "@/utils/theme";

interface CompositePhotoViewProps {
  frontPhotoUrl: string;
  backPhotoUrl: string;
  timestamp?: Date;
  prompt?: string;
}

export default function CompositePhotoView({
  frontPhotoUrl,
  backPhotoUrl,
  timestamp,
  prompt,
}: CompositePhotoViewProps) {
  const [isSwapped, setIsSwapped] = useState(false);
  const { adminData } = useAuth();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleToggle = () => {
    setIsSwapped((prev) => !prev);
  };

  // Format timestamp
  const formattedTime = timestamp
    ? timestamp.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  // Get username - for now just admin, can extend for hackers later
  const username = adminData?.admin_username || "User";

  return (
    <View style={{ alignItems: "center", width: "96%" }}>
      {/* Username and Prompt Above Photo */}
      {prompt && (
        <View style={{ alignSelf: "flex-start", marginBottom: 8 }}>
          <Text
            style={{
              color: isDark ? "#FFFFFF" : "#1F2937",
              fontSize: 14,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            {username}
          </Text>
          <Text
            style={{
              color: isDark ? "#E5E7EB" : "#4B5563",
              fontSize: 14,
              fontWeight: "400",
            }}
          >
            {prompt}
          </Text>
        </View>
      )}

      {/* Composite Photo Display */}
      <View
        style={{
          width: "100%",
          aspectRatio: 3 / 5,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "black",
          position: "relative",
        }}
      >
        {/* Back Camera Photo (Main/Background) */}
        <Image
          source={{ uri: backPhotoUrl }}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: isSwapped ? 0 : 1,
          }}
          resizeMode="cover"
        />

        {/* Front Camera Photo (Main/Background when swapped) */}
        <Image
          source={{ uri: frontPhotoUrl }}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: isSwapped ? 1 : 0,
          }}
          resizeMode="cover"
        />

        {/* Timestamp - Blur Effect (Top Right) */}
        {formattedTime && (
          <View
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <BlurView
              intensity={100}
              tint="light"
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "400",
                  color: "#FFF",
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {formattedTime}
              </Text>
            </BlurView>
          </View>
        )}

        {/* Small Overlay Photo (Top Left) - Clickable */}
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: "white",
            overflow: "hidden",
          }}
          activeOpacity={1}
        >
          <Image
            source={{ uri: frontPhotoUrl }}
            style={{
              width: 96,
              aspectRatio: 3 / 5,
              opacity: isSwapped ? 0 : 1,
            }}
            resizeMode="cover"
          />
          <Image
            source={{ uri: backPhotoUrl }}
            style={{
              width: 96,
              aspectRatio: 3 / 5,
              position: "absolute",
              top: 0,
              left: 0,
              opacity: isSwapped ? 1 : 0,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
