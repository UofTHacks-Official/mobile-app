import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { devError, devLog } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import { Camera } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CameraOwlSvg from "../../assets/images/animals/camera_owl.svg";

export default function CameraPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [_permission, setPermission] = useState<boolean | null>(null);
  const { updateFirstSignInStatus } = useAuth();

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      devLog("Camera permission status:", status);
      setPermission(status === "granted");
      Toast.show({
        type: "success",
        text1: "Camera Permission Granted",
        text2: "You can now scan QR codes",
      });
      Toast.show({
        type: "success",
        text1: "Camera Permission Granted",
        text2: "You can now scan QR codes",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error Requesting Camera Permission",
        text2: "Please try again",
      });
      devError("Error requesting camera permission:", error);
    } finally {
      updateFirstSignInStatus(false);
      router.replace("/(admin)");
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      setPermission(status === "granted");
    })();
  }, []);

  const askForCamera = async () => {
    await requestCameraPermission();
  };

  const _handleMaybeLater = async () => {
    router.replace("/(admin)");
  };

  const _handleOnboardingComplete = async () => {
    router.replace("/(admin)");
  };

  return (
    <>
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 px-8">
          <View className="flex-1 justify-center items-center">
            <View className="mb-8">
              <CameraOwlSvg width={200} height={200} />
            </View>

            <Text
              className={cn(
                "text-xl font-semibold flex-col",
                themeStyles.primaryText
              )}
            >
              Scan & Capture
            </Text>
            <Text
              className={cn("text-center mt-2 px-4", themeStyles.secondaryText)}
            >
              We need camera access for Photobooth.
            </Text>
          </View>

          <Pressable onPress={askForCamera}>
            <View
              className={cn(
                "py-4 px-2 rounded-md mb-4 items-center",
                themeStyles.primaryButtonColorBg
              )}
            >
              <Text
                className={cn(
                  "text-center font-semibold",
                  themeStyles.primaryText1
                )}
              >
                Continue
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}
