import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import CameraOwlSvg from "../../assets/images/animals/camera_owl.svg";

export default function QRCodeScanner({
  onScanned,
  onCancel,
}: {
  onScanned?: (data: string) => void;
  onCancel?: () => void;
}) {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Auto-request permission on mount (no pre-dialog)
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
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
              Camera Access Required
            </Text>
            <Text
              className={cn("text-center px-4 mb-8", themeStyles.secondaryText)}
            >
              To scan QR codes, please enable camera access in your device
              settings.
            </Text>

            <TouchableOpacity
              className={cn(
                "py-4 px-8 rounded-lg w-full items-center mb-4",
                themeStyles.primaryButtonColorBg
              )}
              onPress={() => Linking.openSettings()}
            >
              <Text
                className={cn("font-bold text-base", themeStyles.primaryText1)}
              >
                Open Settings
              </Text>
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity
                className={cn(
                  "py-4 px-8 rounded-lg w-full items-center border-2",
                  isDark ? "border-gray-600" : "border-gray-300"
                )}
                onPress={onCancel}
              >
                <Text
                  className={cn("font-bold text-base", themeStyles.primaryText)}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (!scanned) {
      setScanned(true);
      onScanned?.(result.data);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {/* Overlay UI */}
      <View className="absolute inset-0 justify-end items-center pb-12">
        <TouchableOpacity
          className="absolute top-6 right-6 z-10 bg-black/60 px-4 py-2 rounded-lg"
          onPress={onCancel}
        >
          <Text className="text-white text-lg">Cancel</Text>
        </TouchableOpacity>
        {scanned && (
          <TouchableOpacity
            className="bg-uoft__orange px-6 py-3 rounded-lg mb-4"
            onPress={() => setScanned(false)}
          >
            <Text className="text-white font-bold">Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
        <View className="w-64 h-64 border-4 border-uoft__orange rounded-xl mb-8" />
        <Text className="text-white text-lg">
          Align QR code within the frame
        </Text>
      </View>
    </View>
  );
}
