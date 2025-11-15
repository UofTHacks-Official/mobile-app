import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { Alert, Text, TouchableOpacity, View, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import CameraOwlSvg from "../../../assets/images/animals/camera_owl.svg";

interface DualCameraProps {
  onPhotosCapture: (frontPhoto: string, backPhoto: string) => void;
  isProcessing?: boolean;
}

function DualCamera({
  onPhotosCapture,
  isProcessing = false,
}: DualCameraProps) {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentCamera, setCurrentCamera] = useState<CameraType>("front");
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Auto-request permission on mount (no pre-dialog)
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check permissions
  if (!permission) {
    return (
      <View className="w-80 h-80 bg-gray-200 rounded-2xl items-center justify-center">
        <Text className="text-gray-500">Loading camera...</Text>
      </View>
    );
  }

  // Show full screen AFTER permission is denied (not before)
  if (!permission.granted) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 px-8">
          <View className="flex-1 justify-center items-center">
            <View className="mb-8">
              <CameraOwlSvg width={200} height={200} />
            </View>

            <Text
              className={cn(
                "text-2xl font-semibold mb-2",
                themeStyles.primaryText
              )}
            >
              No Camera Access!
            </Text>
            <Text
              className={cn("text-center px-4 mb-8", themeStyles.secondaryText)}
            >
              To participate in the photobooth, please enable camera access in
              your device settings.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openSettings()}
              className={cn(
                "py-4 px-8 rounded-lg w-full items-center",
                themeStyles.primaryButtonColorBg
              )}
            >
              <Text
                className={cn(
                  "font-semibold text-base",
                  themeStyles.primaryText1
                )}
              >
                Open Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing || isProcessing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo) {
        Alert.alert("Error", "Failed to capture photo");
        return;
      }

      if (currentCamera === "front") {
        // First photo (front camera) captured
        setFrontPhoto(photo.uri);
        setCurrentCamera("back");
        Alert.alert(
          "Selfie Captured!",
          "Flipping to back camera for the second photo",
          [{ text: "OK" }]
        );
      } else {
        // Second photo (back camera) captured - combine both
        if (frontPhoto) {
          onPhotosCapture(frontPhoto, photo.uri);
          // Reset for next capture
          setFrontPhoto(null);
          setCurrentCamera("front");
        } else {
          Alert.alert(
            "Error",
            "Front photo not found. Please retake both photos."
          );
        }
      }
    } catch (error) {
      console.error("Camera capture error:", error);
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setIsCapturing(false);
    }
  };

  // const resetCapture = () => {
  //   setFrontPhoto(null);
  //   setCurrentCamera("front");
  // };

  // const switchCamera = () => {
  //   setCurrentCamera(currentCamera === "front" ? "back" : "front");
  // };

  return (
    <View className="items-center">
      {/* Larger Camera Square */}
      <View
        className="rounded-2xl overflow-hidden bg-black mb-6"
        style={{ width: 360, height: 360 }}
      >
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={currentCamera}
        />
      </View>

      {/* Take Photo Button Below Camera */}
      <TouchableOpacity
        onPress={capturePhoto}
        disabled={isCapturing || isProcessing}
        className={
          isCapturing || isProcessing
            ? "w-20 h-20 rounded-full border-4 border-gray-400 items-center justify-center bg-gray-500"
            : "w-20 h-20 rounded-full border-4 border-gray-400 items-center justify-center bg-transparent"
        }
      >
        <View className="w-16 h-16 rounded-full bg-gray-600" />
      </TouchableOpacity>
    </View>
  );
}

DualCamera.displayName = "DualCamera";

export default DualCamera;
