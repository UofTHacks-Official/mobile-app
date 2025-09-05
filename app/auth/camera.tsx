import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { devError, devLog } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import { Camera } from "expo-camera";
import { router } from "expo-router";
import { CameraIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function CameraPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [, setPermission] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { updateFirstSignInStatus } = useAuth();

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      devLog("Camera permission status:", status);
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
    setShowOnboarding(true);
    router.replace("/auth/onboarding");
  };

  const handleMaybeLater = async () => {
    router.replace("/auth/onboarding");
  };

  // const handleOnboardingComplete = () => {
  //   setShowOnboarding(false);
  //   router.replace("/auth/onboarding");
  //   updateFirstSignInStatus(false);
  // };

  return (
    <>
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 px-8">
          <Pressable
            className="flex flex-row justify-end"
            onPress={handleMaybeLater}
          >
            <Text className="underline text-gray-500">Skip</Text>
          </Pressable>

          <View className="flex-1 justify-center items-center">
            <View className="mb-4">
              <CameraIcon color={themeStyles.iconColor} size={32} />
            </View>

            <Text className={cn("text-xl flex-col", themeStyles.primaryText)}>
              Allow camera access
            </Text>
            <Text
              className={cn("text-center mt-2 px-4", themeStyles.secondaryText)}
            >
              We need camera to sign in users and send hacker bucks via QR code
              scan
            </Text>
          </View>

          <Pressable onPress={askForCamera}>
            <View className="py-4 px-2 bg-uoft_primary_blue rounded-full mb-4 items-center">
              <Text className="text-center">Allow camera access</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* <OnboardingModal
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      /> */}
    </>
  );
}
