import { useTheme } from "@/context/themeContext";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import {
  addHackerBucksByQR,
  deductHackerBucksByQR,
} from "@/requests/hackerBucks";
import { devError } from "@/utils/logger";
import { cn, getStatusStyles, getThemeStyles } from "@/utils/theme";
import { shortenString } from "@/utils/tokens/format/shorten";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { useRouter } from "expo-router";
import {
  ArrowLeftRight,
  CircleDashed,
  Fingerprint,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmHBucks() {
  const router = useRouter();
  const {
    currentTransaction,
    updateTransactionWithAPIResponse,
    updateTransactionStatus,
    setError,
  } = useHackerBucksStore();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentTransaction) return null;
  const { recipient, orderType, amount, status, qrCode } = currentTransaction;
  const statusStyles = getStatusStyles(status);

  const transactionDetails = [
    {
      icon: <User size={20} color={themeStyles.iconColor} />,
      label: "Recipient",
      value: `${recipient.firstName} ${recipient.lastName}`,
    },
    {
      icon: <Fingerprint size={20} color={themeStyles.iconColor} />,
      label: "Hacker ID",
      value: shortenString(recipient.id),
    },
    {
      icon: <ArrowLeftRight size={20} color={themeStyles.iconColor} />,
      label: "Order Type",
      value: orderType === "deduct" ? "DEDUCT" : "ADD",
    },
    {
      icon: <CircleDashed size={20} color={themeStyles.iconColor} />,
      label: "Status",
      value: status,
      isStatus: true,
    },
  ];

  const handleConfirm = async () => {
    if (!qrCode || !amount) {
      Alert.alert("Error", "Missing QR code or amount");
      return;
    }

    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const request = {
        qr_code: qrCode,
        amount: parseFloat(amount),
      };

      const response =
        orderType === "deduct"
          ? await deductHackerBucksByQR(request)
          : await addHackerBucksByQR(request);

      // Update transaction with API response
      updateTransactionWithAPIResponse({
        message: response.message,
        previousBucks: response.previous_bucks,
        newBucks: response.new_bucks,
        amountChanged: response.amount_changed,
      });

      updateTransactionStatus("completed");
      router.replace("/hackerbucks/success");
    } catch (error: any) {
      devError("Transaction error:", error);
      updateTransactionStatus("failed");

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to process transaction";

      setError(errorMessage);
      Alert.alert("Transaction Failed", errorMessage, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 flex flex-col">
        <View className="flex-1 px-6 py-4">
          <View>
            <MaterialCommunityIcons
              name="chevron-left"
              size={36}
              onPress={() => {
                haptics.impactAsync(ImpactFeedbackStyle.Medium);
                router.back();
              }}
              color={themeStyles.iconColor}
            />
          </View>
          <View className="px py-4">
            <Text
              className={cn(
                "text-3xl font-pp font-semibold",
                themeStyles.primaryText
              )}
            >
              {orderType === "deduct" ? "-" : "+"}
              {amount} HB
            </Text>
          </View>

          <View
            className={cn(
              "flex flex-col gap-4 p-4 rounded-lg",
              themeStyles.cardBackground
            )}
          >
            {transactionDetails.map((item, index) => (
              <React.Fragment key={item.label}>
                <View className="flex flex-row justify-between items-center">
                  <View className="flex flex-row gap-2 items-center">
                    {item.icon}
                    <Text className={cn(themeStyles.secondaryText)}>
                      {item.label}
                    </Text>
                  </View>
                  {item.isStatus ? (
                    <View
                      className="px-3 py-1 rounded-full border"
                      style={{
                        backgroundColor: statusStyles.backgroundColor,
                        borderColor: statusStyles.borderColor,
                      }}
                    >
                      <Text
                        className="font-medium text-sm"
                        style={{ color: statusStyles.textColor }}
                      >
                        {item.value}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className={cn("font-medium", themeStyles.primaryText)}
                    >
                      {item.value}
                    </Text>
                  )}
                </View>
                {index < transactionDetails.length - 1 && (
                  <View
                    className="h-0.5 rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      <View className="px-6 mb-20">
        <TouchableOpacity
          className={cn(
            "py-4 rounded-lg items-center",
            isLoading ? "bg-gray-400" : "bg-uoft_primary_blue"
          )}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black text-lg font-medium">Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
