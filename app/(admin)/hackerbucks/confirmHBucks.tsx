import { useTheme } from "@/context/themeContext";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import { cn, getStatusStyles, getThemeStyles } from "@/utils/theme";
import { shortenString } from "@/utils/tokens/format/shorten";
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
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  if (!currentTransaction) return null;
  const { recipient, orderType, amount, status } = currentTransaction;
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
      value: orderType?.toUpperCase(),
    },
    {
      icon: <CircleDashed size={20} color={themeStyles.iconColor} />,
      label: "Status",
      value: status,
      isStatus: true,
    },
  ];

  const handleConfirm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const hackerBucksObject = {
      hacker_id: Number(recipient.id),
      amount: Number(amount),
    };

    try {
      router.replace("/hackerbucks/success");
      // orderType === "send"
      //   ? await sendHackerBucks(hackerBucksObject)
      //   : await deductHackerBucks(hackerBucksObject);
      // router.replace("/hackerbucks/success");
    } catch (error) {
      console.error("Transaction error:", error);
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          className="bg-uoft_primary_blue py-4 rounded-lg items-center"
          onPress={handleConfirm}
        >
          <Text className="text-black text-lg font-medium">Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
