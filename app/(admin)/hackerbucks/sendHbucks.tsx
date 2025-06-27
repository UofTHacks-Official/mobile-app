import NumericKeypad from "@/app/components/hacker_bucks/keyboard";
import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import { formatAmount, isValidAmount } from "@/app/utils/hackerbucks/format";
import shortenString from "@/app/utils/tokens/format/shorten";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

// Validation functions

export default function SwapScreen() {
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const hackerBucksTransaction = useHackerBucksStore();

  const currentRecipient = hackerBucksTransaction.currentTransaction?.recipient;

  const isAmountValid = isValidAmount(amount);

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
      // Check if the new amount would exceed 1000
      if (parseFloat(newAmount) <= 1000) {
        setAmount(newAmount);
      }
    } else {
      const newAmount = amount + key;
      // Format the amount to ensure it's valid
      const formattedAmount = formatAmount(newAmount);
      // Check if the formatted amount would exceed 1000
      if (parseFloat(formattedAmount) <= 1000) {
        setAmount(formattedAmount);
      }
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
    const numValue = parseFloat(formattedText);

    if (!isNaN(numValue) && numValue <= 1000) {
      setAmount(formattedText);
    }
  };

  const handleSendPress = () => {
    if (!isAmountValid) {
      return;
    }

    console.log("[LOG] sending 1");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hackerBucksTransaction.updateTransactionAmount(amount);
    router.push("/hackerbucks/confirmHBucks");
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_dark_grey">
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
                      {shortenString(
                        hackerBucksTransaction.currentTransaction?.recipient.id!
                      )}
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
        <Pressable onPress={handleSendPress} disabled={!isAmountValid}>
          <View
            className={`rounded-md items-center py-4 mt-4 mb-20 ${
              isAmountValid ? "bg-uoft_primary_blue" : "bg-gray-300"
            }`}
          >
            <Text
              className={`text-center text-lg font-pp
              ${isAmountValid ? "text-white" : "text-whitetext-gray-100"}`}
            >
              Send
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
