import { shortenString } from "@/app/_utils/tokens/format/shorten";
import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ArrowLeftRight,
  DollarSign,
  Fingerprint,
  User,
} from "lucide-react-native";
import { CircleDashed } from "phosphor-react-native";
import React, { useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function Success() {
  const router = useRouter();

  const { currentTransaction, updateTransactionStatus, clearTransaction } =
    useHackerBucksStore();

  useEffect(() => {
    if (currentTransaction && currentTransaction.status !== "completed") {
      updateTransactionStatus("completed");
    }
  }, [currentTransaction, updateTransactionStatus]);

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(admin)");
    setTimeout(() => clearTransaction(), 100);
  };

  if (!currentTransaction) {
    return (
      <SafeAreaView className="flex-1 bg-uoft_white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg">Loading transaction details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { recipient, amount, orderType } = currentTransaction;

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
      icon: <DollarSign size={20} color="black" />,
      label: "Amount",
      value: `${amount} HB`,
    },
    {
      icon: <ArrowLeftRight size={20} color="black" />,
      label: "Order Type",
      value: orderType?.toUpperCase(),
    },
    {
      icon: <CircleDashed size={20} />,
      label: "Status",
      value: "Completed",
      valueClassName: "text-green-600",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 py-4">
        <View className="flex-1 justify-center items-center">
          <View className="bg-green-100 w-20 h-20 rounded-full justify-center items-center mb-6">
            <MaterialCommunityIcons name="check" size={40} color="#22c55e" />
          </View>

          <Text className="text-2xl font-pp font-bold text-center mb-2">
            Transaction Successful!
          </Text>

          <Text className="text-lg font-pp font-semibold text-green-600 mb-8">
            {orderType === "deduct"
              ? `${amount} HB Deducted`
              : `${amount} HB Sent`}
          </Text>

          <View className="w-full flex flex-col gap-4 bg-uoft_grey_lighter p-4 rounded-lg">
            {transactionDetails.map((item, index) => (
              <React.Fragment key={item.label}>
                <View className="flex flex-row justify-between items-center">
                  <View className="flex flex-row gap-2 items-center">
                    {item.icon}
                    <Text className="text-gray-600">{item.label}</Text>
                  </View>
                  <Text className={`font-medium ${item.valueClassName || ""}`}>
                    {item.value}
                  </Text>
                </View>
                {index < transactionDetails.length - 1 && (
                  <View className="h-0.5 bg-gray-200 rounded-full" />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      <View className="px-6 space-y-3">
        <TouchableOpacity
          className="bg-uoft_primary_blue border py-4 rounded-lg items-center mb-20"
          onPress={handleDone}
        >
          <Text className="text-white text-lg">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
