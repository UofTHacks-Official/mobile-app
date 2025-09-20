import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useNavigation } from "expo-router";
import { Camera, Settings } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";

import { useBottomNavBarStore } from "@/reducers/bottomNavBar";
import { openSettings } from "@/utils/camera/permissions";
import {
  Button,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const SCAN_SIZE = 250;

export default function App() {
  const [permission] = useCameraPermissions();
  const navigation = useNavigation();
  const [hasScanned, setHasScanned] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const setIsExpanded = useBottomNavBarStore((s) => s.setIsExpanded);

  const isProcessingScan = useRef(false);

  const isFocused = useIsFocused();

  const scanAreaTop = (height - SCAN_SIZE) / 2;
  const scanAreaLeft = (width - SCAN_SIZE) / 2;

  // Bounding box for the scanned QR code
  const [scannedBounds, setScannedBounds] = useState<{
    origin: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: "none" },
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: { display: "flex" },
      });
    };
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // Reset the processing flag when the screen is focused
      isProcessingScan.current = false;
      // Reset the hasScanned state to allow new scans
      setHasScanned(false);
      // Optionally clear transaction or any other state here
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
    // If a scan is already being processed or has already scanned, immediately exit.
    if (isProcessingScan.current || hasScanned) {
      return;
    }

    // Check if the QR code is within our scan area
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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setHasScanned(true);
    setIsExpanded(false);
    setPopupMessage("QR Code scanned: " + data);
    setScannedBounds(bounds);

    // Clear bounding box after 3 seconds
    setTimeout(() => {
      setScannedBounds(null);
    }, 3000);
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-uoft_white">
        <View className="px-6">
          <View className="flex-1 justify-center items-center">
            <View className="mb-4">
              <Camera color="black" size={32} />
            </View>

            <Text className="text-xl font-bold text-center text-lg mb-4">
              Camera Permission Required
            </Text>
            <Text className="text-black text-center mb-8">
              We need camera access to scan QR codes. Grant permission to
              continue.
            </Text>

            <TouchableOpacity
              className="bg-uoft_primary_blue w-full px-6 py-3 rounded-lg mb-4 flex-row items-center justify-center"
              onPress={openSettings}
            >
              <Settings size={20} color="black" style={{ marginRight: 8 }} />
              <Text className="text-center">Open Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-3 rounded-lg w-full bg-uoft_grey"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-center">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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

          {/* <View className="absolute bottom-40 right-10">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.goBack();
              }}
              className="bg-white/20 p-3 rounded-full"
            >
              <Home size={32} color="white" />
            </TouchableOpacity>
          </View> */}
        </CameraView>
      )}

      <Modal
        visible={!!popupMessage}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPopupMessage(null);
          setHasScanned(false);
          setScannedBounds(null);
          isProcessingScan.current = false;
        }}
      >
        <View className="flex-1 bg-black/50 items-center justify-end">
          <View className="bg-white rounded-t-xl p-6 w-full items-center">
            <Text className="text-black text-base text-center font-semibold mb-4">
              {popupMessage}
            </Text>
            <Button
              title="Close"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPopupMessage(null);
                setHasScanned(false);
                setScannedBounds(null);
                isProcessingScan.current = false;
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
