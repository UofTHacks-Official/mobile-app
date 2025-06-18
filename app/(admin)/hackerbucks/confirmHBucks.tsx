import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmHBucks() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  const hackerBucksTransaction = useHackerBucksStore();

  const currentRecipient = hackerBucksTransaction.currentTransaction?.recipient;

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

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/(admin)/hackerbucks/success");
    } catch (error) {
      console.error("Transaction error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 py-4">
        <View>
          <MaterialCommunityIcons
            name="arrow-left"
            size={36}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(admin)/hackerbucks/sendHbucks");
            }}
          />
        </View>
        <View className="px py-4">
          <Text className="text-3xl font-pp font-semibold">
            +{hackerBucksTransaction.currentTransaction?.amount} HB
          </Text>
        </View>

        <View className="flex flex-col gap-4 bg-uoft_grey_lighter p-4 rounded-lg">
          <View className="flex flex-row justify-between items-center">
            <Text className="text-gray-600">Recipient</Text>
            <Text className="font-medium">
              {currentRecipient?.firstName} {currentRecipient?.lastName}
            </Text>
          </View>
          <View className="h-0.5 bg-gray-200 rounded-full" />
          <View className="flex flex-row justify-between items-center">
            <Text className="text-gray-600">Hacker ID</Text>
            <Text className="font-medium">{currentRecipient?.id}</Text>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
        <TouchableOpacity
          className="bg-uoft_primary_blue py-4 rounded-lg items-center"
          onPress={handleConfirm}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading ? "Processing..." : "Confirm"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
