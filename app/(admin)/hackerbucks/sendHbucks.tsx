import NumericKeypad from "@/components/hacker_bucks/keyboard";
import { useTheme } from "@/context/themeContext";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import { formatAmount, isValidAmount } from "@/utils/hackerbucks/format";
import { cn, getThemeStyles } from "@/utils/theme";
import { shortenString } from "@/utils/tokens/format/shorten";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

// Validation functions

export default function SwapScreen() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [amount, setAmount] = useState("0");
  const [isDeducting, setIsDeducting] = useState(false);

  const hackerBucksTransaction = useHackerBucksStore();

  const currentRecipient = hackerBucksTransaction.currentTransaction?.recipient;

  const isAmountValid = isValidAmount(amount);

  const handleDirectionToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDeducting(!isDeducting);
  };

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hackerBucksTransaction.updateTransactionAmount(
      amount,
      isDeducting ? "deduct" : "send"
    );
    router.push("/hackerbucks/confirmHBucks");
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-4">
        <View className="flex flex-row items-center px-4 pt-4 pb-12">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevron-left" size={28} color={themeStyles.iconColor} />
          </Pressable>
          <Text
            className={cn(
              "text-lg font-bold flex-1 text-center",
              themeStyles.primaryText
            )}
          >
            {isDeducting ? "Deduct Order" : "Send Order"}
          </Text>
        </View>

        <View
          className={cn(
            "flex-row items-center px-6 py-4 min-h-[100px] rounded-lg",
            themeStyles.cardBackground
          )}
        >
          <View className="flex-1">
            <Text
              className={cn("text-xl pt-2 font-pp", themeStyles.primaryText)}
            >
              {isDeducting ? "Deducting" : "Sending"}
            </Text>
            <TextInput
              className={cn(
                "flex-1 font-pp text-4xl border-0 p-0",
                themeStyles.primaryText
              )}
              placeholderTextColor={isDark ? "#888" : "#ffff"}
              keyboardType="numeric"
              autoCorrect={false}
              autoFocus={true}
              onChangeText={handleTextInputChange}
              value={amount}
              showSoftInputOnFocus={false}
            />
          </View>
        </View>

        <Pressable
          className="absolute left-0 right-0 top-[165px] items-center z-10"
          onPress={handleDirectionToggle}
        >
          <View className={cn("p-1 rounded-lg", themeStyles.background)}>
            {isDeducting ? (
              <ArrowUp size={36} color={themeStyles.iconColor} />
            ) : (
              <ArrowDown size={36} color={themeStyles.iconColor} />
            )}
          </View>
        </Pressable>

        <View
          className={cn(
            "flex-row items-center rounded-lg px-6 py-4 min-h-[100px] mt-2",
            themeStyles.cardBackground
          )}
        >
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 ml-2">
                <Text
                  className={cn("text-xl font-pp", themeStyles.primaryText)}
                >
                  {isDeducting ? "Taking" : "Receiving"}
                </Text>
                {currentRecipient?.firstName ? (
                  <>
                    <Text className={cn("text-2xl", themeStyles.primaryText)}>
                      {currentRecipient?.firstName} {currentRecipient?.lastName}
                    </Text>
                    <Text className={cn("text-sm", themeStyles.secondaryText)}>
                      {shortenString(
                        hackerBucksTransaction.currentTransaction?.recipient.id!
                      )}
                    </Text>
                  </>
                ) : null}
              </View>
              <Pressable
                className={cn(
                  "text-sm text-center px-4 py-3 rounded-lg",
                  themeStyles.lightCardBackground
                )}
                onPress={() => {
                  router.back();
                }}
              >
                <Text className={cn("text-sm", themeStyles.iconColor)}>
                  Change
                </Text>
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
            className={cn(
              "rounded-md items-center py-4 mt-4 mb-20",
              isAmountValid
                ? "bg-uoft_primary_blue"
                : isDark
                ? "bg-gray-600"
                : "bg-gray-300"
            )}
          >
            <Text
              className={cn(
                "text-center text-lg font-pp",
                isAmountValid
                  ? "text-black"
                  : isDark
                  ? "text-white"
                  : "text-gray-500"
              )}
            >
              Send
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
