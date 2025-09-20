import React from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { Send } from "lucide-react-native";

interface CompositePhotoProps {
  frontPhotoUri: string;
  backPhotoUri: string;
  onSave: () => void;
}

export default function CompositePhoto({
  frontPhotoUri,
  backPhotoUri,
  onSave,
}: CompositePhotoProps) {
  const handleSave = () => {
    onSave();
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
          marginBottom: 24,
          position: "relative",
        }}
      >
        {/* Back Camera Photo (Main/Background) */}
        <Image
          source={{ uri: backPhotoUri }}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          resizeMode="cover"
        />

        {/* Front Camera Photo (Small Overlay - Top Left) */}
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: "white",
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: frontPhotoUri }}
            style={{
              width: 96,
              height: 128,
            }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: "#75EDEF",
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 24,
          marginTop: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Send size={20} color="#000" strokeWidth={2} />
        <Text style={{ color: "#000", fontWeight: "600" }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}
