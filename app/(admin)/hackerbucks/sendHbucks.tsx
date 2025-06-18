import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import NumericKeypad from "../../components/hacker_bucks/keyboard";

// Validation functions
const isValidAmount = (value: string): boolean => {
  // Check if it's a valid number
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return false;

  // Check if it's positive
  if (numValue <= 0) return false;

  // Check if it has more than 2 decimal places
  const decimalPlaces = value.includes(".")
    ? value.split(".")[1]?.length || 0
    : 0;
  if (decimalPlaces > 2) return false;

  // Check if the total value is reasonable (e.g., less than 1 million)
  if (numValue > 1000000) return false;

  return true;
};

const formatAmount = (value: string): string => {
  // Remove any non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + "." + parts[1].substring(0, 2);
  }

  return cleaned;
};

export default function SwapScreen() {
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const params = useLocalSearchParams();

  const hackerBucksTransaction = useHackerBucksStore();

  const currentRecipient = hackerBucksTransaction.currentTransaction?.recipient;

  // Validate amount whenever it changes
  useEffect(() => {
    if (amount === "0" || amount === "") {
      setAmountError(null);
      return;
    }

    if (!isValidAmount(amount)) {
      setAmountError(
        "Please enter a valid amount (positive number, max 2 decimal places)"
      );
    } else {
      setAmountError(null);
    }
  }, [amount]);

  const handleKeyPress = (key: string) => {
    // Prevent multiple decimal points
    if (key === "." && amount.includes(".")) return;

    // If current value is "0", replace it with the new key
    if (amount === "0" && key !== ".") {
      const newAmount = key;
      setAmount(newAmount);
    } else {
      const newAmount = amount + key;
      // Format the amount to ensure it's valid
      const formattedAmount = formatAmount(newAmount);
      setAmount(formattedAmount);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount("0");
    }
  };

  const handlePresetAmount = (presetAmount: string) => {
    if (isValidAmount(presetAmount)) {
      setAmount(presetAmount);
    } else {
      setAmountError("Invalid preset amount");
    }
  };

  const handleTextInputChange = (text: string) => {
    const formattedText = formatAmount(text);
    setAmount(formattedText);
  };

  const handleSendPress = () => {
    console.log("[LOG] sending 1");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hackerBucksTransaction.updateTransactionAmount(amount);
    router.push("/(admin)/hackerbucks/confirmHBucks");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-uoft_dark_grey"
      edges={["top", "left", "right"]}
    >
      <View className="flex-1 px-4">
        <View className="flex flex-row items-center px-4 pt-4 pb-12">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevron-left" size={28} />
          </Pressable>
          <Text className="text-lg font-bold text-black flex-1 text-center">
            Send Order
          </Text>
        </View>

        <View className="flex-row items-center bg-uoft_light_grey px-6 py-4 min-h-[100px] rounded-lg">
          <View className="flex-1">
            <Text className="text-xl pt-2 font-pp">Sending</Text>
            <TextInput
              className="flex-1 font-pp text-4xl text-clementine border-0 p-0"
              placeholderTextColor="rock"
              keyboardType="numeric"
              autoCorrect={false}
              autoFocus={true}
              onChangeText={handleTextInputChange}
              value={amount}
              showSoftInputOnFocus={false}
            />
            {amountError && (
              <Text className="text-red-500 text-sm mt-1">{amountError}</Text>
            )}
          </View>
        </View>

        <View className="absolute left-0 right-0 top-[165px] items-center z-10">
          <View className="bg-uoft_dark_grey p-1 rounded-lg">
            <MaterialCommunityIcons
              name="arrow-down"
              size={36}
              color="#666666"
            />
          </View>
        </View>

        <View className="flex-row items-center bg-uoft_light_grey rounded-lg px-6 py-4 min-h-[100px] mt-2 rounded-lg">
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 ml-2">
                <Text className="text-xl font-pp">Receiving</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : error ? (
                  <Text className="text-red-500">{error}</Text>
                ) : currentRecipient?.firstName ? (
                  <>
                    <Text className="text-2xl text-gravel">
                      {currentRecipient?.firstName} {currentRecipient?.lastName}
                    </Text>
                    <Text className="text-sm text-uoft_grey_medium">
                      {hackerBucksTransaction.currentTransaction?.recipient.id}
                    </Text>
                  </>
                ) : null}
              </View>
              <Pressable
                className="text-sm text-center px-4 py-3 bg-uoft_dark_grey rounded-lg"
                onPress={() => {
                  router.back();
                }}
              >
                <Text className="text-sm text-balck">Change</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View className="mt-auto">
          <NumericKeypad
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
            onPresetAmount={handlePresetAmount}
          />
        </View>
        <Pressable onPress={handleSendPress}>
          <View className={`rounded-md items-center py-4 my-2 shadow-md `}>
            <Text className="text-white text-center text-lg font-pp">Send</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
