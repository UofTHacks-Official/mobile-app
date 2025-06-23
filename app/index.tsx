import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function App() {
  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-8">
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl font-bold flex-col">UoftHacks</Text>
        </View>

        <Pressable
          onPress={() => {
            impactAsync(ImpactFeedbackStyle.Medium);
            router.push("/auth/selectRole");
          }}
        >
          <View className="bg-uoft_primary_blue rounded-md py-4 mt-8">
            <Text className="text-white text-center text-lg">Sign In</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default App;
