import { useTheme } from "@/context/themeContext";
import { useJudgeSchedules } from "@/queries/judge";
import { useAllJudgingSchedules } from "@/queries/judging";
import { JudgingScheduleItem, SessionStatus } from "@/types/judging";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import { getJudgeId, getUserType } from "@/utils/tokens/secureStorage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Timer } from "lucide-react-native";
import { useEffect, useState } from "react";
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

  const [isJudge, setIsJudge] = useState(false);
  const [judgeId, setJudgeId] = useState<number | null>(null);

  const [userTypeChecked, setUserTypeChecked] = useState(false);

  // Check if user is a judge
  useEffect(() => {
    const checkUserType = async () => {
      const userType = await getUserType();
      console.log("[DEBUG] Judging page - User type:", userType);
      if (userType === "judge") {
        setIsJudge(true);
        const id = await getJudgeId();
        console.log("[DEBUG] Judging page - Judge ID:", id);
        setJudgeId(id);
      }
      setUserTypeChecked(true);
    };
    checkUserType();
  }, []);

  // Fetch schedules based on user type
  // Only enable the appropriate query based on user type
  const adminSchedules = useAllJudgingSchedules(!isJudge && userTypeChecked);
  const judgeSchedules = useJudgeSchedules(judgeId, isJudge && userTypeChecked);

  // Use appropriate data source
  const {
    data: judgingData,
    isLoading,
    isError,
  } = isJudge ? judgeSchedules : adminSchedules;

  useEffect(() => {
    console.log("[DEBUG] Judging page - userTypeChecked:", userTypeChecked);
    console.log("[DEBUG] Judging page - isJudge:", isJudge);
    console.log("[DEBUG] Judging page - judgeId:", judgeId);
    console.log(
      "[DEBUG] Judging page - admin query enabled:",
      !isJudge && userTypeChecked
    );
    console.log(
      "[DEBUG] Judging page - judge query enabled:",
      isJudge && userTypeChecked
    );
    console.log("[DEBUG] Judging page - judgingData:", judgingData);
    console.log("[DEBUG] Judging page - isLoading:", isLoading);
    console.log("[DEBUG] Judging page - isError:", isError);
  }, [isJudge, judgeId, judgingData, isLoading, isError, userTypeChecked]);

  // Calculate session status based on timestamps
  const getSessionStatus = (item: JudgingScheduleItem): SessionStatus => {
    const now = new Date().getTime();
    const scheduledTime = new Date(item.timestamp).getTime();
    const durationMs = item.duration * 60 * 1000;

    if (item.actual_timestamp) {
      const actualStartTime = new Date(item.actual_timestamp).getTime();
      const elapsedMs = now - actualStartTime;

      if (elapsedMs >= durationMs) {
        return "completed";
      }
      return "in-progress";
    }

    // Not started yet
    if (now < scheduledTime) {
      return "upcoming";
    }

    // Scheduled time has passed but not started
    return "overdue";
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case "upcoming":
        return "text-blue-500";
      case "in-progress":
        return "text-green-500";
      case "completed":
        return "text-gray-500";
      case "overdue":
        return "text-red-500";
      default:
        return themeStyles.secondaryText;
    }
  };

  const getStatusText = (status: SessionStatus) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "overdue":
        return "Overdue";
      default:
        return "";
    }
  };

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
    const status = getSessionStatus(item);
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);

    return (
      <Pressable
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
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({
            pathname: "/(admin)/judgingTimer",
            params: { scheduleId: item.judging_schedule_id.toString() },
          });
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
          <View className="flex-row items-center gap-2">
            <Text className={cn("text-xs font-pp font-bold", statusColor)}>
              {statusText}
            </Text>
            <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
              {item.duration} min
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            Team #{item.team_id} • Judge #{item.judge_id}
          </Text>
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </Pressable>
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
