import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Button, Dimensions, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const SCAN_SIZE = 250;

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();

  const { startTransaction, clearTransaction, currentTransaction } =
    useHackerBucksStore();

  const [scannedBounds, setScannedBounds] = useState<{
    origin: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);

  // NEW: A ref to control whether a scan is currently being processed
  const isProcessingScan = useRef(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    clearTransaction();
    isProcessingScan.current = false;
    console.log(`Current Status`, isProcessingScan.current);
  }, []);

  useEffect(() => {
    if (
      currentTransaction &&
      (currentTransaction.status === "completed" ||
        currentTransaction.status === "failed")
    ) {
      clearTransaction();
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reset the processing flag when the screen is focused
      isProcessingScan.current = false;
      // Optionally clear transaction or any other state here
      clearTransaction();
      return () => {};
    }, [])
  );

  const handleQRCodeScanned = ({
    data,
    bounds,
  }: {
    data: string;
    bounds: {
      origin: { x: number; y: number };
      size: { width: number; height: number };
    };
  }) => {
    // If a scan is already being processed, immediately exit.
    if (isProcessingScan.current) {
      return;
    }

    const scanAreaTop = (height - SCAN_SIZE) / 2;
    const scanAreaLeft = (width - SCAN_SIZE) / 2;

    const isInScanArea =
      bounds.origin.x >= scanAreaLeft &&
      bounds.origin.y >= scanAreaTop &&
      bounds.origin.x + bounds.size.width <= scanAreaLeft + SCAN_SIZE &&
      bounds.origin.y + bounds.size.height <= scanAreaTop + SCAN_SIZE;

    if (!isInScanArea) {
      return;
    }

    // If we reach here, it's a valid scan and not currently processing.
    // Set the flag to true immediately to prevent further calls.
    isProcessingScan.current = true;

    console.log("QR Code scanned:", data);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    //setScannedBounds(bounds); // Only uncomment if you want to visualize the bounds

    // Navigate to the next screen
    router.push("/hackerbucks/sendHbucks");
    startTransaction(
      {
        firstName: "Garry",
        lastName: "Tan",
        id: data,
      },
      null
    );
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center">
        <Text className="text-center pb-2.5">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const scanAreaTop = (height - SCAN_SIZE) / 2;
  const scanAreaLeft = (width - SCAN_SIZE) / 2;

  return (
    <View className="flex-1 justify-center">
      {isFocused && (
        <CameraView
          className="flex-1"
          facing={"back"}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={handleQRCodeScanned}
        >
          <Svg height={height} width={width} className="absolute inset-0">
            <Defs>
              <Mask id="mask" x="0" y="0" width={width} height={height}>
                <Rect x="0" y="0" width={width} height={height} fill="white" />
                <Rect
                  x={scanAreaLeft}
                  y={scanAreaTop}
                  width={SCAN_SIZE}
                  height={SCAN_SIZE}
                  rx={40}
                  fill="black"
                />
              </Mask>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="rgba(0,0,0,0.6)"
              mask="url(#mask)"
            />
            <Rect
              x={scanAreaLeft}
              y={scanAreaTop}
              width={SCAN_SIZE}
              height={SCAN_SIZE}
              rx={40}
              fill="none"
              stroke="#fff"
              strokeWidth={3}
            />
            {scannedBounds && (
              <Rect
                x={scannedBounds.origin.x}
                y={scannedBounds.origin.y}
                width={scannedBounds.size.width}
                height={scannedBounds.size.height}
                fill="none"
                stroke="#00FF00"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </Svg>

          <View className="absolute bottom-10 right-10">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                isProcessingScan.current = false;
                navigation.goBack();
              }}
              className="bg-white/20 p-3 rounded-full"
            >
              <Ionicons name="home" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}
