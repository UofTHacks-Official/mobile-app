import { useTheme } from "@/context/themeContext";
import { JudgingScheduleItem } from "@/types/judging";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Timer } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JudgingLocationScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { handleScroll } = useScrollNavBar();
  // Note: Since there's no list endpoint, we'll show a message
  const judgingData: JudgingScheduleItem[] | null = null;
  const isLoading = false;
  const isError = false;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const renderScheduleCard = (item: JudgingScheduleItem, index: number) => {
    return (
      <View
        key={item.judging_schedule_id || index}
        className={cn(
          "rounded-2xl p-4 mb-3 border",
          isDark ? "bg-[#1a1a2e] border-gray-700" : "bg-white border-gray-200"
        )}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text
            className={cn(
              "text-lg font-onest-bold flex-1",
              themeStyles.primaryText
            )}
          >
            {item.location}
          </Text>
          <Text
            className={cn("text-sm font-pp ml-2", themeStyles.secondaryText)}
          >
            {item.duration} min
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            Team #{item.team_id} • Judge #{item.judge_id}
          </Text>
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  // Group schedules by location
  const groupedSchedules: Record<string, JudgingScheduleItem[]> | undefined = (
    judgingData as JudgingScheduleItem[] | null
  )?.reduce(
    (acc: Record<string, JudgingScheduleItem[]>, item: JudgingScheduleItem) => {
      if (!acc[item.location]) {
        acc[item.location] = [];
      }
      acc[item.location].push(item);
      return acc;
    },
    {} as Record<string, JudgingScheduleItem[]>
  );

  if (isLoading) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFFFFF" : "#002A5C"}
          />
          <Text
            className={cn("mt-4 text-base font-pp", themeStyles.secondaryText)}
          >
            Loading judging schedule...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !judgingData) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Unable to load schedule
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

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView
        className="flex-1 px-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="mt-6">
          <Text
            className={cn(
              "text-3xl font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Judging
          </Text>
          <Text
            className={cn("text-base font-pp mb-4", themeStyles.secondaryText)}
          >
            Manage judging sessions and timers
          </Text>
        </View>

        {/* Timer Button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(admin)/judgingTimer");
          }}
          className={cn(
            "rounded-2xl p-6 mb-4 flex-row items-center justify-between",
            isDark ? "bg-[#1a1a2e]" : "bg-white"
          )}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: isDark ? "#75EDEF" : "#132B38" }}
            >
              <Timer size={24} color={isDark ? "#000" : "#fff"} />
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-onest-bold mb-1",
                  themeStyles.primaryText
                )}
              >
                Judging Timer
              </Text>
              <Text
                className={cn("text-sm font-pp", themeStyles.secondaryText)}
              >
                Start and manage judging session timers
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Grouped by location */}
        {groupedSchedules &&
          Object.entries(groupedSchedules).map(
            ([location, schedules]: [string, JudgingScheduleItem[]]) => (
              <View key={location} className="mt-4">
                <Text
                  className={cn(
                    "text-xl font-onest-bold mb-3",
                    themeStyles.primaryText
                  )}
                >
                  {location}
                </Text>
                {schedules
                  .sort(
                    (a: JudgingScheduleItem, b: JudgingScheduleItem) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  )
                  .map((schedule: JudgingScheduleItem, index: number) =>
                    renderScheduleCard(schedule, index)
                  )}
              </View>
            )
          )}

        {/* Empty state */}
        {(!judgingData ||
          (judgingData as JudgingScheduleItem[]).length === 0) &&
          !isLoading && (
            <View className="mt-6">
              <Text
                className={cn(
                  "text-center text-base font-pp",
                  themeStyles.secondaryText
                )}
              >
                No judging schedules available at this time.
              </Text>
              <Text
                className={cn(
                  "text-center text-sm font-pp mt-2",
                  themeStyles.secondaryText
                )}
              >
                Schedules will appear here once they are generated.
              </Text>
            </View>
          )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JudgingLocationScreen;
