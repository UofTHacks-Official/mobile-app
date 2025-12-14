import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { useTheme } from "@/context/themeContext";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import { cn, getStatusStyles, getThemeStyles } from "@/utils/theme";
import { shortenString } from "@/utils/tokens/format/shorten";
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
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Success() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
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
    clearTransaction();
    router.dismissAll();
    router.replace("/(admin)");
  };

  if (!currentTransaction) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <CustomSplashScreen />
      </SafeAreaView>
    );
  }

  const { recipient, amount, orderType } = currentTransaction;
  const statusStyles = getStatusStyles("completed");

  const { apiResponse } = currentTransaction;

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
      icon: <DollarSign size={20} color={themeStyles.iconColor} />,
      label: "Amount Changed",
      value: `${amount} HB`,
    },
    ...(apiResponse?.previousBucks !== undefined
      ? [
          {
            icon: <DollarSign size={20} color={themeStyles.iconColor} />,
            label: "Previous Balance",
            value: `${apiResponse.previousBucks} HB`,
          },
        ]
      : []),
    ...(apiResponse?.newBucks !== undefined
      ? [
          {
            icon: <DollarSign size={20} color={themeStyles.iconColor} />,
            label: "New Balance",
            value: `${apiResponse.newBucks} HB`,
          },
        ]
      : []),
    {
      icon: <ArrowLeftRight size={20} color={themeStyles.iconColor} />,
      label: "Order Type",
      value: orderType === "deduct" ? "DEDUCT" : "ADD",
    },
    {
      icon: <CircleDashed size={20} color={themeStyles.iconColor} />,
      label: "Status",
      value: "Completed",
      isStatus: true,
    },
  ];

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-6 py-4">
        <View className="flex-1 justify-center items-center">
          <View
            className={cn(
              "w-20 h-20 rounded-full justify-center items-center mb-6 border border-[#22c55e]",
              isDark ? "bg-green-900" : "bg-green-100"
            )}
          >
            <MaterialCommunityIcons name="check" size={40} color="#22c55e" />
          </View>

          <Text
            className={cn(
              "text-2xl font-pp font-bold text-center mb-2",
              themeStyles.primaryText
            )}
          >
            Transaction Successful!
          </Text>

          <Text className="text-lg font-pp font-semibold text-green-600 mb-8">
            {orderType === "deduct"
              ? `${amount} HB Deducted`
              : `${amount} HB Sent`}
          </Text>

          <View
            className={cn(
              "w-full flex flex-col gap-4 p-4 rounded-lg",
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

      <View className="px-6 space-y-3">
        <TouchableOpacity
          className="bg-uoft_primary_blue py-4 rounded-lg items-center mb-20"
          onPress={handleDone}
        >
          <Text className="text-black text-lg">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
