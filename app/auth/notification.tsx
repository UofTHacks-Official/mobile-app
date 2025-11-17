import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useUserTypeStore } from "@/reducers/userType";
import { registerPushToken } from "@/requests/push_token";
import { devLog } from "@/utils/logger";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { cn, getThemeStyles } from "@/utils/theme";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CameraOwlSvg from "../../assets/images/animals/camera_owl.svg";

export default function NotificationPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { userType } = useUserTypeStore();
  const { updateFirstSignInStatus } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token && userType) {
        await registerPushToken(token, userType);
        Toast.show({
          type: "success",
          text1: "Notifications Enabled",
          text2: "You'll now receive important updates and alerts",
        });
        router.replace("/auth/camera");
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Enable Notifications",
          text2: "Please check your device settings and try again",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Unexpected Error",
        text2: "Something went wrong while enabling notifications",
      });
      devLog(`[Notifcations Error] ${error}`);
    } finally {
      setIsRegistering(false);
    }
  };

  if (isRegistering) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <CustomSplashScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-8">
        <Pressable
          className="flex flex-row justify-end"
          onPress={() => {
            updateFirstSignInStatus(false);
            router.replace("/(admin)");
          }}
        >
          <Text
            className={cn(
              "underline text-gray-500",
              themeStyles.skipButtonColor
            )}
          >
            Skip
          </Text>
        </Pressable>

        <View className="flex-1 justify-center items-center">
          <View className="mb-8">
            <CameraOwlSvg width={200} height={200} />
          </View>
          <Text
            className={cn(
              "text-xl font-semibold flex-col text-center mb-4",
              themeStyles.primaryText
            )}
          >
            Allow notifications
          </Text>
          <Text className={cn("text-center px-2", themeStyles.secondaryText)}>
            We only send notifications for important event updates, and
            Photobooth alerts!
          </Text>
        </View>

        <Pressable onPress={handleEnableNotifications} disabled={isRegistering}>
          <View
            className={cn(
              themeStyles.primaryButtonColorBg,
              "py-4 px-2 rounded-md mb-4 items-center"
            )}
          >
            {isRegistering ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={cn(
                  "text-center font-semibold",
                  themeStyles.primaryText1
                )}
              >
                Enable push notifications
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
