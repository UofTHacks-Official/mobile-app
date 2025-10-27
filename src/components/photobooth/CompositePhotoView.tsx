import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, Platform } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";

interface CompositePhotoViewProps {
  frontPhotoUrl: string;
  backPhotoUrl: string;
  timestamp?: Date;
}

export default function CompositePhotoView({
  frontPhotoUrl,
  backPhotoUrl,
  timestamp,
}: CompositePhotoViewProps) {
  const [isSwapped, setIsSwapped] = useState(false);

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

  return (
    <View style={{ alignItems: "center" }}>
      {/* Composite Photo Display */}
      <View
        style={{
          width: "96%",
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

        {/* Timestamp - Glass Effect (Top Right) */}
        {formattedTime &&
          (isLiquidGlassAvailable() ? (
            <GlassView
              glassEffectStyle="clear"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
                justifyContent: "center",
                alignItems: "center",
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
            </GlassView>
          ) : (
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
          ))}

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
