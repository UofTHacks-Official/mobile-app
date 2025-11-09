import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function QRCodeScanner({
  onScanned,
  onCancel,
}: {
  onScanned?: (data: string) => void;
  onCancel?: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white mb-4">
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          className="bg-uoft__orange px-6 py-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white font-bold">Continue</Text>
        </TouchableOpacity>
        {onCancel && (
          <TouchableOpacity
            className="mt-4 px-6 py-3 rounded-lg border border-white"
            onPress={onCancel}
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
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
