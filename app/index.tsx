import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const App = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-4xl font-bold text-center mb-8">UofTHacks</Text>
        <Pressable
          className="bg-black py-4 px-8 rounded-sm absolute bottom-8 w-full items-center"
          onPress={() => {
            router.push("/auth/selectRole");
          }}
        >
          <Text className="text-white text-lg font-semibold">Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default App;
