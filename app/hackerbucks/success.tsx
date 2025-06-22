import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function Success() {
  const router = useRouter();
  const navigation = useNavigation();

  const { currentTransaction, updateTransactionStatus, clearTransaction } =
    useHackerBucksStore();

  // Mark transaction as completed when component mounts
  useEffect(() => {
    if (currentTransaction && currentTransaction.status !== "completed") {
      updateTransactionStatus("completed");
    }
  }, []);

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(admin)");
    setTimeout(() => clearTransaction(), 100);
  };

  const handleSendMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/hackerbucks");
    setTimeout(() => clearTransaction(), 100);
  };

  // Show loading if no transaction data
  if (!currentTransaction) {
    return (
      <SafeAreaView className="flex-1 bg-uoft_white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg">Loading transaction details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { recipient, amount } = currentTransaction;

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 py-4">
        {/* Success Icon and Message */}
        <View className="flex-1 justify-center items-center">
          <View className="bg-green-100 w-20 h-20 rounded-full justify-center items-center mb-6">
            <MaterialCommunityIcons name="check" size={40} color="#22c55e" />
          </View>

          <Text className="text-2xl font-pp font-bold text-center mb-2">
            Transaction Successful!
          </Text>

          <Text className="text-lg font-pp font-semibold text-green-600 mb-8">
            +{amount} HB Sent
          </Text>

          {/* Transaction Details */}
          <View className="w-full flex flex-col gap-4 bg-uoft_grey_lighter p-4 rounded-lg">
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Recipient</Text>
              <Text className="font-medium">
                {recipient.firstName} {recipient.lastName}
              </Text>
            </View>
            <View className="h-0.5 bg-gray-200 rounded-full" />
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Hacker ID</Text>
              <Text className="font-medium">{recipient.id}</Text>
            </View>
            <View className="h-0.5 bg-gray-200 rounded-full" />
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Amount</Text>
              <Text className="font-medium">{amount} HB</Text>
            </View>
            <View className="h-0.5 bg-gray-200 rounded-full" />
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Status</Text>
              <Text className="font-medium text-green-600">Completed</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-6 space-y-3">
        <TouchableOpacity
          className="bg-uoft_primary_blue py-4 rounded-lg items-center mb-2"
          onPress={handleSendMore}
        >
          <Text className="text-white text-lg font-bold">Send More HB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-uoft_primary_blue border py-4 rounded-lg items-center"
          onPress={handleDone}
        >
          <Text className="text-uoft_primary_blue text-lg font-bold">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
