import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { useTheme } from "@/context/themeContext";
import { devLog } from "@/utils/logger";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { cn, getThemeStyles } from "@/utils/theme";
import { router } from "expo-router";
import { BellPlus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRegistering(true);
    try {
      // Request permissions if not already granted
      const granted = await registerForPushNotificationsAsync();

      if (granted) {
        // Register for push notifications
        const token = await registerForPushNotificationsAsync();
        if (token) {
          Toast.show({
            type: "success",
            text1: "Notifications Enabled",
            text2: "You'll now receive important updates and alerts",
          });
          // send this token to your backend here
          router.replace("/auth/camera");
        } else {
          Toast.show({
            type: "error",
            text1: "Failed to Enable Notifications",
            text2: "Please check your device settings and try again",
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Notification permissions are required for important updates",
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
          onPress={() => router.replace("/auth/camera")}
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
          <View className="mb-4">
            <BellPlus color={themeStyles.iconColor} size={32} />
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
            We only send notifications for food alerts, event details, and
            important updates. No spam, promise!
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
