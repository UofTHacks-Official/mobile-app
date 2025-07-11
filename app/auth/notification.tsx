import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { router } from "expo-router";
import { BellPlus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEnableNotifications = async () => {
    console.log("[LOG LOG LOG]");
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
      console.log(`[Notifcations Error] ${error}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // Show loading state while checking initial permission status
  if (isRegistering) {
    return (
      <SafeAreaView className="flex-1 bg-uoft_white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="mt-4 text-gray-600">Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-8">
        <View className="flex-1 justify-center items-center">
          <View className="mb-4">
            <BellPlus color="black" size={32} />
          </View>
          <Text className="text-xl font-bold flex-col text-center mb-4">
            Allow notifications
          </Text>
          <Text className="text-gray-600 text-center px-2">
            We only send notifications for food alerts, event details, and
            important updates. No spam, promise!
          </Text>
        </View>

        <Pressable onPress={handleEnableNotifications} disabled={isRegistering}>
          <View className="py-4 px-2 bg-uoft_primary_blue rounded-md mb-4 items-center">
            {isRegistering ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white">
                Enable push notifications
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            router.replace("/auth/camera");
          }}
        >
          <View className="py-4 px-2 rounded-md mb-4 items-center">
            <Text className="text-center text-uoft_primary_blue">
              Maybe Later
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
