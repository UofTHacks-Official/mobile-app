import { router } from "expo-router";
import { BellPlus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerForPushNotificationsAsync } from "@/utils/notifications";

export default function NotificationPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        Alert.alert("Success", "Notifications enabled!");
        // You might want to send this token to your backend here
        router.push("/auth/camera");
      } else {
        Alert.alert("Failed", "Could not enable notifications. Please check permissions.");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      Alert.alert("Error", "An unexpected error occurred while enabling notifications.");
    } finally {
      setIsLoading(false);
    }
  };

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

        <Pressable onPress={handleEnableNotifications} disabled={isLoading}>
          <View className="py-4 px-2 bg-uoft_primary_blue rounded-md mb-4 items-center">
            {isLoading ? (
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
            router.push("/auth/camera");
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
