import { shortenString } from "@/utils/tokens/format/shorten";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ArrowLeftRight,
  CircleDashed,
  Fingerprint,
  User,
} from "lucide-react-native";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmHBucks() {
  const router = useRouter();
  const { currentTransaction } = useHackerBucksStore();

  if (!currentTransaction || !currentTransaction.recipient) {
    if (router.canGoBack()) router.back();
    return null;
  }

  const { recipient, orderType, amount, status } = currentTransaction;

  const transactionDetails = [
    {
      icon: <User size={20} color="black" />,
      label: "Recipient",
      value: `${recipient.firstName} ${recipient.lastName}`,
    },
    {
      icon: <Fingerprint size={20} color="black" />,
      label: "Hacker ID",
      value: shortenString(recipient.id),
    },
    {
      icon: <ArrowLeftRight size={20} color="black" />,
      label: "Order Type",
      value: orderType?.toUpperCase(),
    },
    {
      icon: <CircleDashed size={20} />,
      label: "Status",
      value: status,
      valueClassName: "text-green-600",
    },
  ];

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      router.replace("/hackerbucks/success");
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 flex flex-col">
        <View className="flex-1 px-6 py-4">
          <View>
            <MaterialCommunityIcons
              name="chevron-left"
              size={36}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back();
              }}
            />
          </View>
          <View className="px py-4">
            <Text className="text-3xl font-pp font-semibold">
              {orderType === "deduct" ? "-" : "+"}
              {amount} HB
            </Text>
          </View>

          <View className="flex flex-col gap-4 bg-uoft_grey_lighter p-4 rounded-lg">
            {transactionDetails.map((item, index) => (
              <React.Fragment key={item.label}>
                <View className="flex flex-row justify-between items-center">
                  <View className="flex flex-row gap-2 items-center">
                    {item.icon}
                    <Text className="text-gray-600">{item.label}</Text>
                  </View>
                  <Text className="font-medium">{item.value}</Text>
                </View>
                {index < transactionDetails.length - 1 && (
                  <View className="h-0.5 bg-gray-200 rounded-full" />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      <View className="px-6 mb-20">
        <TouchableOpacity
          className="bg-uoft_primary_blue py-4 rounded-lg items-center"
          onPress={handleConfirm}
        >
          <Text className="text-white text-lg">Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
