import { useState } from "react";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DualCamera from "../../src/components/photobooth/DualCamera";
import { PhotoCombiner } from "../../src/utils/photoCombiner";

export default function PhotoboothPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotosCapture = async (frontPhoto: string, backPhoto: string) => {
    try {
      setIsProcessing(true);
      
      // Process the photos
      const result = await PhotoCombiner.savePhotosIndividually(frontPhoto, backPhoto);
      
      Alert.alert(
        "Photos Captured!",
        "Front and back photos have been processed successfully.",
        [
          {
            text: "Take Another",
            onPress: () => {
              // Reset camera component
            }
          },
          {
            text: "Done",
            onPress: () => {}
          }
        ]
      );
      
    } catch (error) {
      console.error('Photo processing error:', error);
      Alert.alert("Error", "Failed to process photos. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 justify-center items-center">
        <DualCamera 
          onPhotosCapture={handlePhotosCapture}
          isProcessing={isProcessing}
        />
      </View>
    </SafeAreaView>
  );
}