import { Camera } from "expo-camera";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CameraPage() {
  const [permission, setPermission] = useState<boolean | null>(null);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === "granted");
      console.log(status);

      if (status === "granted") {
        console.log(status);
        //Alert.alert("Success", "Camera access granted!");
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      //Alert.alert("Error", "Failed to request camera permission");
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

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-8">
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl font-bold flex-col">
            Allow camera access
          </Text>
          <Text className="text-center text-gray-600 mt-2 px-4">
            We need camera to sign in users and send hacker bucks via QR code
            scan
          </Text>
        </View>

        <Pressable onPress={askForCamera}>
          <View className="py-4 px-2 bg-uoft_primary_blue rounded-md mb-4 items-center">
            <Text className="text-center text-white">Allow camera access</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            router.push("/(admin)");
          }}
        >
          <View className="mb-4 py-4 px-2">
            <Text className="text-center text-uoft_primary_blue">
              Maybe Later
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
