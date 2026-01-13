import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { useFocusEffect, useNavigation } from "expo-router";
import { Camera, RefreshCw, Settings } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useHackerQRCode } from "@/queries/hackerBucks";
import { useBottomNavBarStore } from "@/reducers/bottomNavBar";
import { useUserTypeStore } from "@/reducers/userType";
import { openSettings } from "@/utils/camera/permissions";
import { cn, getThemeStyles } from "@/utils/theme";
import { getUserType } from "@/utils/tokens/secureStorage";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const SCAN_SIZE = 250;

type ResolvedUserType = "admin" | "volunteer" | "judge" | "hacker" | null;

const HackerQRCodeScreen = () => {
  const { hackerData } = useAuth();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const userId = hackerData?.hacker_id;

  const {
    data: qrCode,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useHackerQRCode(userId);

  const isBusy = isLoading || isFetching;
  const canRefresh = !!userId;
  const refreshDisabled = isBusy || !canRefresh;

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-6"
      >
        <View className="flex-1 py-8 gap-6">
          <View className="gap-2">
            <Text
              className={cn(
                "text-3xl font-onest-bold",
                themeStyles.primaryText
              )}
            >
              Your QR Code
            </Text>
            <Text className={cn("text-base", themeStyles.secondaryText)}>
              Show this code at check-in or whenever a volunteer needs to scan
              your badge.
            </Text>
          </View>

          <View
            className={cn(
              "rounded-2xl px-6 py-8 items-center",
              themeStyles.cardBackground
            )}
          >
            {isBusy && (
              <ActivityIndicator
                size="large"
                color={isDark ? "#75EDEF" : "#132B38"}
              />
            )}

            {!isBusy && qrCode && (
              <View
                className={cn(
                  "p-4 rounded-xl",
                  isDark ? "bg-[#303030]" : "bg-gray-100"
                )}
              >
                <QRCode value={qrCode} size={240} />
              </View>
            )}

            {!isBusy && !qrCode && (
              <Text
                className={cn("text-center mt-2", themeStyles.secondaryText)}
              >
                {error
                  ? "We could not load your QR code right now."
                  : "Your QR code will appear here."}
              </Text>
            )}

            <View className="mt-6 w-full">
              <Pressable
                onPress={() => {
                  if (!canRefresh) return;
                  haptics.impactAsync(ImpactFeedbackStyle.Light);
                  refetch();
                }}
                disabled={refreshDisabled}
                className={cn(
                  "flex-row items-center justify-center py-3 rounded-xl",
                  isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
                )}
                style={{ opacity: refreshDisabled ? 0.6 : 1 }}
              >
                <RefreshCw
                  size={18}
                  color={isDark ? "#000" : "#fff"}
                  style={{ marginRight: 8 }}
                />
                <Text
                  className={cn(
                    "text-base font-onest-bold",
                    isDark ? "text-black" : "text-white"
                  )}
                >
                  Refresh QR Code
                </Text>
              </Pressable>
            </View>

            {userId ? (
              <Text
                className={cn(
                  "text-xs text-center mt-4",
                  themeStyles.secondaryText
                )}
              >
                Linked to user ID {userId}
              </Text>
            ) : (
              <Text
                className={cn(
                  "text-xs text-center mt-4",
                  themeStyles.secondaryText
                )}
              >
                Sign in to load your QR code.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const QRScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const [hasScanned, setHasScanned] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const setIsExpanded = useBottomNavBarStore((s) => s.setIsExpanded);
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

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

    haptics.impactAsync(ImpactFeedbackStyle.Medium);

    setHasScanned(true);
    setIsExpanded(false);
    setPopupMessage("QR Code scanned: " + data);
    setScannedBounds(bounds);

    // Clear bounding box after 3 seconds
    setTimeout(() => {
      setScannedBounds(null);
    }, 3000);
  };

  if (!permission) {
    return (
      <View
        className={cn(
          "flex-1 justify-center items-center",
          themeStyles.background
        )}
      >
        <Text className={themeStyles.primaryText}>
          Loading camera permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        className={cn(
          "flex-1 justify-center items-center",
          themeStyles.background
        )}
      >
        <View className="px-6">
          <View className="flex-1 justify-center items-center">
            <View className="mb-4">
              <Camera color={themeStyles.iconColor} size={32} />
            </View>

            <Text
              className={cn(
                "text-xl font-bold text-center text-lg mb-4",
                themeStyles.primaryText
              )}
            >
              Camera Permission Required
            </Text>
            <Text className={cn("text-center mb-8", themeStyles.secondaryText)}>
              We need camera access to scan QR codes. Tap Continue to ask for
              permission.
            </Text>

            {permission.canAskAgain && (
              <TouchableOpacity
                className="bg-uoft_primary_blue w-full px-6 py-3 rounded-lg mb-4 flex-row items-center justify-center"
                onPress={requestPermission}
              >
                <Camera size={20} color="black" style={{ marginRight: 8 }} />
                <Text className="text-center text-black font-semibold">
                  Continue
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={cn(
                "w-full px-6 py-3 rounded-lg mb-4 flex-row items-center justify-center",
                isDark ? "bg-gray-700" : "bg-gray-600"
              )}
              onPress={openSettings}
            >
              <Settings size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-center text-white">Open Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={cn(
                "px-6 py-3 rounded-lg w-full",
                isDark ? "bg-gray-700" : "bg-uoft_grey"
              )}
              onPress={() => navigation.goBack()}
            >
              <Text className={cn("text-center", themeStyles.primaryText)}>
                Go Back
              </Text>
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
                haptics.impactAsync(ImpactFeedbackStyle.Medium);
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
          <View
            className={cn(
              "rounded-t-xl p-6 w-full items-center",
              themeStyles.cardBackground
            )}
          >
            <Text
              className={cn(
                "text-base text-center font-semibold mb-4",
                themeStyles.primaryText
              )}
            >
              {popupMessage}
            </Text>
            <Button
              title="Close"
              onPress={() => {
                haptics.impactAsync(ImpactFeedbackStyle.Medium);
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
};

export default function QRScreen() {
  const { userType } = useUserTypeStore();
  const [resolvedUserType, setResolvedUserType] =
    useState<ResolvedUserType>(userType);
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  useEffect(() => {
    let isMounted = true;

    const resolveUserType = async () => {
      if (userType) {
        setResolvedUserType(userType);
        return;
      }

      const storedType = await getUserType();
      if (isMounted) {
        setResolvedUserType(
          storedType as "admin" | "volunteer" | "judge" | "hacker" | null
        );
      }
    };

    resolveUserType();

    return () => {
      isMounted = false;
    };
  }, [userType]);

  if (!resolvedUserType) {
    return (
      <SafeAreaView
        className={cn(
          "flex-1 items-center justify-center",
          themeStyles.background
        )}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#75EDEF" : "#132B38"}
        />
      </SafeAreaView>
    );
  }

  if (resolvedUserType === "hacker") {
    return <HackerQRCodeScreen />;
  }

  return <QRScannerScreen />;
}
