import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, Alert } from "react-native";
import { Download, Share, Images } from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

interface CompositePhotoProps {
  frontPhotoUri: string;
  backPhotoUri: string;
  onUploadAndViewGallery: () => void;
}

export default function CompositePhoto({
  frontPhotoUri,
  backPhotoUri,
  onUploadAndViewGallery,
}: CompositePhotoProps) {
  const [isSaving, setIsSaving] = useState(false);
  const compositeViewRef = React.useRef<View>(null);

  const handleSaveToLibrary = async () => {
    try {
      setIsSaving(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Cannot save photo without permission"
        );
        return;
      }

      // Capture the composite view as an image
      if (!compositeViewRef.current) return;

      const uri = await captureRef(compositeViewRef, {
        format: "jpg",
        quality: 0.9,
      });

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved!", "Photo saved to your camera roll");
    } catch (error) {
      console.error("Error saving to library:", error);
      Alert.alert("Error", "Failed to save photo to camera roll");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSaving(true);

      // Capture the composite view as an image
      if (!compositeViewRef.current) return;

      const uri = await captureRef(compositeViewRef, {
        format: "jpg",
        quality: 0.9,
      });

      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share photo");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingTop: 100,
        position: "relative",
      }}
    >
      {/* Save and Share Buttons - Top Right (Horizontal) */}
      <View
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={handleSaveToLibrary}
          disabled={isSaving}
          style={{
            backgroundColor: "#75EDEF",
            width: 46,
            height: 46,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          <Download size={24} color="#000" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          disabled={isSaving}
          style={{
            backgroundColor: "#FFF",
            width: 46,
            height: 46,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          <Share size={24} color="#000" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Composite Photo Display - 3:5 ratio */}
      <View
        ref={compositeViewRef}
        collapsable={false}
        style={{
          width: "70%",
          aspectRatio: 3 / 5,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "black",
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

      {/* Upload Button - Below Photo */}
      <TouchableOpacity
        onPress={onUploadAndViewGallery}
        disabled={isSaving}
        style={{
          marginTop: 24,
          backgroundColor: "#75EDEF",
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 32,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: isSaving ? 0.6 : 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Images size={24} color="#000" strokeWidth={2} />
        <Text
          style={{
            color: "#000",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Upload Photo
        </Text>
      </TouchableOpacity>
    </View>
  );
}
