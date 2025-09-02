import { useState } from "react";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import DualCamera from "../../src/components/photobooth/DualCamera";
import CompositePhoto from "../../src/components/photobooth/CompositePhoto";
import { PhotoStorageService } from "../../src/services/photoStorage";

export default function PhotoboothPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<{
    front: string;
    back: string;
  } | null>(null);

  const handlePhotosCapture = async (frontPhoto: string, backPhoto: string) => {
    try {
      setIsProcessing(true);
      
      // Store the photos to show composite view
      setCapturedPhotos({
        front: frontPhoto,
        back: backPhoto
      });
      
    } catch (error) {
      console.error('Photo processing error:', error);
      Alert.alert("Error", "Failed to process photos. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  const handleSave = async () => {
    if (!capturedPhotos) return;
    
    try {
      setIsProcessing(true);
      
      // Upload photos to Cloudflare R2
      const result = await PhotoStorageService.uploadPhotoboothPhotos(
        capturedPhotos.front, 
        capturedPhotos.back
      );
      
      Alert.alert(
        "Photos Saved!",
        `Your BeReal-style photos have been uploaded successfully!`,
        [
          {
            text: "Take Another",
            onPress: () => setCapturedPhotos(null)
          },
          {
            text: "View Gallery",
            onPress: () => router.push("/(admin)/gallery")
          }
        ]
      );
      
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert("Error", "Failed to upload photos. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 justify-center items-center">
        {capturedPhotos ? (
          <CompositePhoto
            frontPhotoUri={capturedPhotos.front}
            backPhotoUri={capturedPhotos.back}
            onSave={handleSave}
          />
        ) : (
          <DualCamera 
            onPhotosCapture={handlePhotosCapture}
            isProcessing={isProcessing}
          />
        )}
      </View>
    </SafeAreaView>
  );
}