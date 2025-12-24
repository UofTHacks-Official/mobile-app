import { useTheme } from "@/context/themeContext";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import { formatAmount, isValidAmount } from "@/utils/hackerbucks/format";
import { cn, getThemeStyles } from "@/utils/theme";
import NumericKeypad from "@/components/hacker_bucks/keyboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SendHBucksScreen() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { mode } = useLocalSearchParams<{ mode?: "add" | "deduct" }>();

  const [amount, setAmount] = useState("");
  const [isDeducting, setIsDeducting] = useState(mode === "deduct");

  const hackerBucksTransaction = useHackerBucksStore();

  const currentRecipient = hackerBucksTransaction.currentTransaction?.recipient;

  const isAmountValid = isValidAmount(amount) && parseFloat(amount) > 0;

  // Update deducting state when mode changes
  useEffect(() => {
    if (mode) {
      setIsDeducting(mode === "deduct");
    }
  }, [mode]);

  const handleKeypadPress = (key: string) => {
    const next = `${amount}${key}`;
    const formatted = formatAmount(next);
    const normalized = formatted.startsWith(".") ? `0${formatted}` : formatted;

    if (normalized === "") {
      setAmount("");
      return;
    }

    const trimmed =
      normalized.length > 1 ? normalized.replace(/^0+(?=\d)/, "") : normalized;
    setAmount(trimmed);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
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

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView
      className={cn("flex-1", themeStyles.background)}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-6 pt-4 pb-10">
          <View className="flex-row items-start justify-between mb-10">
            <View className="flex-1">
              <Text
                className={cn(
                  "text-2xl font-onest-bold",
                  themeStyles.primaryText
                )}
              >
                Hacker Bucks
              </Text>
              <Text
                className={cn(
                  "text-lg font-onest-bold mt-1",
                  themeStyles.secondaryText
                )}
              >
                {isDeducting ? "Deducting" : "Adding"}
              </Text>
            </View>
            <Pressable onPress={handleClose} className="p-2 -mr-2">
              <X size={28} color={themeStyles.iconColor} />
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center gap-7">
            <Text className={cn("text-sm", themeStyles.secondaryText)}>
              Enter amount
            </Text>
            <View className="flex-row items-end justify-center pt-2">
              <Text
                className={cn(
                  "text-4xl font-onest-bold mr-2",
                  themeStyles.secondaryText
                )}
              >
                $
              </Text>
              <Text
                className={cn(
                  "text-7xl font-onest-bold text-center min-w-[160px] leading-none",
                  themeStyles.primaryText
                )}
                style={{ lineHeight: 80 }}
              >
                {amount || "0"}
              </Text>
              <Text
                className={cn(
                  "text-xl font-onest-bold ml-2",
                  themeStyles.secondaryText
                )}
              >
                HB
              </Text>
            </View>

            <Pressable
              onPress={handleSendPress}
              disabled={!isAmountValid}
              className={cn(
                "w-full py-4 rounded-2xl",
                isAmountValid
                  ? isDark
                    ? "bg-[#75EDEF]"
                    : "bg-[#132B38]"
                  : isDark
                    ? "bg-gray-700"
                    : "bg-gray-300"
              )}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Text
                className={cn(
                  "text-center text-lg font-onest-bold",
                  isAmountValid
                    ? isDark
                      ? "text-black"
                      : "text-white"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-500"
                )}
              >
                {isDeducting ? "Deduct" : "Send"}
              </Text>
            </Pressable>
          </View>

          <View className="pb-20">
            <NumericKeypad
              onKeyPress={handleKeypadPress}
              onDelete={handleDelete}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
