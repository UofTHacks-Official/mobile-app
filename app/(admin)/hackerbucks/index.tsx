import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ArrowDownCircle, ArrowUpCircle, UserCheck } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HackerBucksLanding() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks/scan?mode=add");
  };

  const handleDeductPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks/scan?mode=deduct");
  };

  const handleCheckInPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks/scan?mode=checkin");
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-6 justify-center">
        <View className="mb-12">
          <Text
            className={cn(
              "text-3xl font-bold text-center mb-2",
              themeStyles.primaryText
            )}
          >
            Admin Tools
          </Text>
          <Text
            className={cn("text-base text-center", themeStyles.secondaryText)}
          >
            Check in hackers and manage Hacker Bucks
          </Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={handleCheckInPress}
            className={cn(
              "rounded-2xl p-6 flex-row items-center justify-between border-2",
              isDark
                ? "bg-green-900/20 border-green-800"
                : "bg-green-50 border-green-200"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-green-400" : "text-green-600"
                )}
              >
                Check In Hacker
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-green-400/70" : "text-green-600/70"
                )}
              >
                Scan QR code to check in
              </Text>
            </View>
            <UserCheck size={32} color={isDark ? "#4ade80" : "#16a34a"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddPress}
            className="bg-uoft_primary_blue rounded-2xl p-6 flex-row items-center justify-between"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-1">
              <Text className="text-black text-xl font-bold mb-1">
                Add Hacker Bucks
              </Text>
              <Text className="text-black/70 text-sm">
                Scan QR code to add points
              </Text>
            </View>
            <ArrowUpCircle size={32} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeductPress}
            className={cn(
              "rounded-2xl p-6 flex-row items-center justify-between border-2",
              isDark
                ? "bg-red-900/20 border-red-800"
                : "bg-red-50 border-red-200"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-red-400" : "text-red-600"
                )}
              >
                Deduct Hacker Bucks
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-red-400/70" : "text-red-600/70"
                )}
              >
                Scan QR code to deduct points
              </Text>
            </View>
            <ArrowDownCircle size={32} color={isDark ? "#f87171" : "#dc2626"} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
