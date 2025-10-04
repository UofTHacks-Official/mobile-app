import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";

interface CompositePhotoViewProps {
  frontPhotoUrl: string;
  backPhotoUrl: string;
}

export default function CompositePhotoView({
  frontPhotoUrl,
  backPhotoUrl,
}: CompositePhotoViewProps) {
  const [isSwapped, setIsSwapped] = useState(false);

  const handleToggle = () => {
    setIsSwapped((prev) => !prev);
  };

  return (
    <View style={{ alignItems: "center" }}>
      {/* Composite Photo Display */}
      <View
        style={{
          width: 384,
          height: 384,
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

        {/* Small Overlay Photo (Top Left) - Clickable */}
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: "white",
            overflow: "hidden",
          }}
          activeOpacity={1}
        >
          <Image
            source={{ uri: frontPhotoUrl }}
            style={{
              width: 96,
              height: 128,
              opacity: isSwapped ? 0 : 1,
            }}
            resizeMode="cover"
          />
          <Image
            source={{ uri: backPhotoUrl }}
            style={{
              width: 96,
              height: 128,
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
