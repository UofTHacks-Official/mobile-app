import { useTheme } from "@/context/themeContext";
import { useScheduleById } from "@/queries/schedule/schedule";
import { getScheduleTypeLabel, ScheduleType } from "@/types/schedule";
import { devError } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import { formatTimeTo12Hour } from "@/utils/time";
import { useLocalSearchParams } from "expo-router";
import { Clock, Globe, Info, Tag, UserCog } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const eventIconColors: Record<number, string> = {
  [ScheduleType.CEREMONIES]: "#9333EA", // purple-600
  [ScheduleType.SPONSOR]: "#2563EB", // blue-600
  [ScheduleType.MINI]: "#EC4899", // pink-500
  [ScheduleType.FOOD]: "#EA580C", // orange-600
  [ScheduleType.SHIFTS]: "#4B5563", // gray-600
  [ScheduleType.WORKSHOP]: "#16A34A", // green-600
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

  console.log("[DEBUG] Schedule Detail - scheduleID:", scheduleID);
  console.log("[DEBUG] Schedule Detail - isLoading:", isLoading);
  console.log("[DEBUG] Schedule Detail - error:", error);
  console.log("[DEBUG] Schedule Detail - selectedSchedule:", selectedSchedule);

  // Handle error case
  if (error) {
    devError("Failed to fetch schedule data:", error);
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Unable to load event
          </Text>
          <Text
            className={cn(
              "text-base font-pp text-center",
              themeStyles.secondaryText
            )}
          >
            Please try again later or contact support if the problem persists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center">
          <Text className={cn("text-base font-pp", themeStyles.secondaryText)}>
            Loading event details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedSchedule) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Event not found
          </Text>
          <Text
            className={cn(
              "text-base font-pp text-center",
              themeStyles.secondaryText
            )}
          >
            The event you&apos;re looking for doesn&apos;t exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getEventIconColor = (eventType: ScheduleType) => {
    return eventIconColors[eventType] || "#666";
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
              {getScheduleTypeLabel(selectedSchedule?.type)}
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
