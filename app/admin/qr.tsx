import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const SCAN_SIZE = 250;

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  // Animation for the popup message
  const slideAnim = useState(new Animated.Value(60))[0];

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

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: popupMessage ? 0 : 60,
      useNativeDriver: true,
      tension: 20,
      friction: 4,
    }).start();
  }, [popupMessage]);

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
    if (hasScanned) return;

    // Check if the QR code is within our scan area
    const isInScanArea =
      bounds.origin.x >= scanAreaLeft &&
      bounds.origin.y >= scanAreaTop &&
      bounds.origin.x + bounds.size.width <= scanAreaLeft + SCAN_SIZE &&
      bounds.origin.y + bounds.size.height <= scanAreaTop + SCAN_SIZE;

    if (!isInScanArea) return;

    console.log("QR Code scanned:", data);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScannedCodes((prev) => [...prev, data]);
    setHasScanned(true);
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
      <View className="flex-1 justify-center">
        <Text className="text-center pb-2.5">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Calculate scan area position
  const scanAreaTop = (height - SCAN_SIZE) / 2;
  const scanAreaLeft = (width - SCAN_SIZE) / 2;

  return (
    <View className="flex-1 justify-center">
      <CameraView
        className="flex-1"
        facing={"back"}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={hasScanned ? undefined : handleQRCodeScanned}
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
              navigation.goBack();
            }}
            className="bg-white/20 p-3 rounded-full"
          >
            <Ionicons name="home" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      <Animated.View
        className={`absolute w-full bottom-0 bg-white rounded-t-xl p-4 items-center z-50 ${
          hasScanned ? "pb-[100px]" : "pb-[0px]"
        }`}
        style={{
          transform: [{ translateY: slideAnim }],
        }}
      >
        {!!popupMessage && (
          <>
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
              }}
            />
          </>
        )}
      </Animated.View>
    </View>
  );
}
