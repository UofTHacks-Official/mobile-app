import { useTheme } from "@/context/themeContext";
import { useScheduleById } from "@/queries/schedule/schedule";
import { devError } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import { formatTimeTo12Hour } from "@/utils/time";
import { router, useLocalSearchParams } from "expo-router";
import { Clock, Globe, Info, Tag, UserCog } from "lucide-react-native";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

const eventIconColors = {
  networking: "#1D4ED8", // blue-700
  food: "#EA580C", // orange-600
  activity: "#EC4899", // pink-500
};

export default function ScheduleDetail() {
  const { scheduleID } = useLocalSearchParams<{
    scheduleID: string;
  }>();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const {
    data: selectedSchedule,
    isLoading,
    error,
  } = useScheduleById(Number(scheduleID));

  // Handle error case
  if (error) {
    devError("Failed to fetch schedule data:", error);
    router.back();
    return null;
  }

  // Handle loading state
  if (isLoading || !selectedSchedule) {
    return null;
  }

  const getEventIconColor = (eventType: string) => {
    return eventIconColors[eventType as keyof typeof eventIconColors] || "#666";
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Event Title */}
        <View className="mt-8 mb-8">
          <Text
            className={cn(
              "text-3xl font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            {selectedSchedule?.title}
          </Text>
          <View
            className={cn(
              "h-px w-full",
              isDark ? "bg-gray-600" : "bg-gray-200"
            )}
          />
        </View>

        {/* Time Section */}
        <View className="mb-8">
          <View className="flex-row">
            <View className="w-8 mr-4 mt-1">
              <Clock size={24} color={themeStyles.iconColor} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text
                  className={cn(
                    "text-xl font-onest-semibold mr-4",
                    themeStyles.primaryText
                  )}
                >
                  {formatTimeTo12Hour(selectedSchedule.startTime)}
                </Text>
                <Text className={cn("text-xl mr-4", themeStyles.secondaryText)}>
                  →
                </Text>
                <Text
                  className={cn(
                    "text-xl font-onest-semibold",
                    themeStyles.primaryText
                  )}
                >
                  {formatTimeTo12Hour(selectedSchedule.endTime)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Globe size={16} color={themeStyles.iconColor} />
                <Text className={cn("text-sm ml-2", themeStyles.secondaryText)}>
                  EST Toronto
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Type Section */}
        <View className="mb-8">
          <View className="flex-row">
            <View className="w-8 mr-4 mt-1">
              <Tag
                size={24}
                color={getEventIconColor(selectedSchedule?.type)}
              />
            </View>
            <Text
              className={cn(
                "text-xl font-onest-medium capitalize",
                themeStyles.primaryText
              )}
            >
              {selectedSchedule?.type}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        {selectedSchedule?.description && (
          <View className="mb-8">
            <View className="flex-row">
              <View className="w-8 mr-4 mt-1">
                <Info size={24} color={themeStyles.iconColor} />
              </View>
              <Text
                className={cn(
                  "text-base flex-1 leading-6 font-onest-regular",
                  themeStyles.primaryText
                )}
              >
                {selectedSchedule.description}
              </Text>
            </View>
          </View>
        )}

        {/* Sponsor Section */}
        {selectedSchedule?.sponsorId && (
          <View className="mb-8">
            <View className="flex-row">
              <View className="w-8 mr-4 mt-1">
                <UserCog size={24} color={themeStyles.iconColor} />
              </View>
              <Text
                className={cn(
                  "text-base font-onest-regular",
                  themeStyles.primaryText
                )}
              >
                Sponsored by {selectedSchedule.sponsorId}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
