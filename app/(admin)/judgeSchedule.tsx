import { useTheme } from "@/context/themeContext";
import { useJudgeSchedules } from "@/queries/judge";
import { JudgingScheduleItem, SessionStatus } from "@/types/judging";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import { getJudgeId } from "@/utils/tokens/secureStorage";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import { ChevronLeft, Clock, MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JudgeScheduleOverview = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { handleScroll } = useScrollNavBar();

  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [isLoadingJudgeId, setIsLoadingJudgeId] = useState(true);

  useEffect(() => {
    const loadJudgeId = async () => {
      const id = await getJudgeId();
      console.log("[DEBUG] Judge Schedule - Loaded judge ID:", id);
      setJudgeId(id);
      setIsLoadingJudgeId(false);
    };
    loadJudgeId();
  }, []);

  const { data: schedules, isLoading, isError } = useJudgeSchedules(judgeId);

  const isLoadingData = isLoadingJudgeId || isLoading;

  useEffect(() => {
    console.log("[DEBUG] Judge Schedule - schedules data:", schedules);
    console.log("[DEBUG] Judge Schedule - isLoading:", isLoading);
    console.log("[DEBUG] Judge Schedule - isError:", isError);
  }, [schedules, isLoading, isError]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatLocation = (location: JudgingScheduleItem["location"]) =>
    typeof location === "string" ? location : location.location_name;

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

    if (now < scheduledTime) {
      return "upcoming";
    }

    return "overdue";
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500";
      case "in-progress":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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

  const handleGoBack = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSessionPress = (scheduleId: number) => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(admin)/judgingTimer",
      params: { scheduleId: scheduleId.toString() },
    });
  };

  if (isLoadingData) {
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
            Loading your schedule...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !schedules) {
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

  const upcomingSessions = schedules.filter(
    (s) => getSessionStatus(s) === "upcoming"
  );
  const inProgressSessions = schedules.filter(
    (s) => getSessionStatus(s) === "in-progress"
  );
  const completedSessions = schedules.filter(
    (s) => getSessionStatus(s) === "completed"
  );

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView
        className="flex-1 px-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="mt-6 mb-4">
          <Pressable onPress={handleGoBack} className="mb-4">
            <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
          </Pressable>
          <Text
            className={cn(
              "text-3xl font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Your Judging Schedule
          </Text>
          <Text className={cn("text-base font-pp", themeStyles.secondaryText)}>
            {schedules.length} session{schedules.length !== 1 ? "s" : ""}{" "}
            assigned
          </Text>
        </View>

        {/* Summary Stats */}
        <View className="flex-row gap-3 mb-6">
          <View
            className={cn(
              "flex-1 p-4 rounded-xl",
              isDark ? "bg-[#1a1a2e]" : "bg-white"
            )}
          >
            <Text className={cn("text-2xl font-onest-bold text-blue-500")}>
              {upcomingSessions.length}
            </Text>
            <Text className={cn("text-xs font-pp", themeStyles.secondaryText)}>
              Upcoming
            </Text>
          </View>
          <View
            className={cn(
              "flex-1 p-4 rounded-xl",
              isDark ? "bg-[#1a1a2e]" : "bg-white"
            )}
          >
            <Text className={cn("text-2xl font-onest-bold text-green-500")}>
              {inProgressSessions.length}
            </Text>
            <Text className={cn("text-xs font-pp", themeStyles.secondaryText)}>
              Active
            </Text>
          </View>
          <View
            className={cn(
              "flex-1 p-4 rounded-xl",
              isDark ? "bg-[#1a1a2e]" : "bg-white"
            )}
          >
            <Text className={cn("text-2xl font-onest-bold text-gray-500")}>
              {completedSessions.length}
            </Text>
            <Text className={cn("text-xs font-pp", themeStyles.secondaryText)}>
              Done
            </Text>
          </View>
        </View>

        {/* Sessions List */}
        <Text
          className={cn(
            "text-xl font-onest-bold mb-3",
            themeStyles.primaryText
          )}
        >
          All Sessions
        </Text>

        {schedules.length === 0 ? (
          <View className="mt-6">
            <Text
              className={cn(
                "text-center text-base font-pp",
                themeStyles.secondaryText
              )}
            >
              No judging sessions assigned yet.
            </Text>
          </View>
        ) : (
          schedules
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
            .map((session, index) => {
              const status = getSessionStatus(session);
              const statusColor = getStatusColor(status);
              const statusText = getStatusText(status);

              return (
                <Pressable
                  key={session.judging_schedule_id || index}
                  onPress={() =>
                    handleSessionPress(session.judging_schedule_id)
                  }
                  className={cn(
                    "rounded-2xl p-4 mb-3 border",
                    isDark
                      ? "bg-[#1a1a2e] border-gray-700"
                      : "bg-white border-gray-200"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {/* Status Badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View
                        className={cn("px-2 py-1 rounded-full", statusColor)}
                      >
                        <Text className="text-white text-xs font-pp font-bold">
                          {statusText}
                        </Text>
                      </View>
                      <Text
                        className={cn(
                          "text-xs font-pp",
                          themeStyles.secondaryText
                        )}
                      >
                        #{session.judging_schedule_id}
                      </Text>
                    </View>
                    <Text
                      className={cn(
                        "text-sm font-pp",
                        themeStyles.secondaryText
                      )}
                    >
                      {session.duration} min
                    </Text>
                  </View>

                  {/* Team Info */}
                  <Text
                    className={cn(
                      "text-xl font-onest-bold mb-2",
                      themeStyles.primaryText
                    )}
                  >
                    Team #{session.team_id}
                  </Text>

                  {/* Time & Location */}
                  <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <Clock size={16} color={isDark ? "#888" : "#666"} />
                      <Text
                        className={cn(
                          "text-sm font-pp",
                          themeStyles.secondaryText
                        )}
                      >
                        {formatDate(session.timestamp)} at{" "}
                        {formatTime(session.timestamp)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <MapPin size={16} color={isDark ? "#888" : "#666"} />
                      <Text
                        className={cn(
                          "text-sm font-pp",
                          themeStyles.secondaryText
                        )}
                      >
                        {formatLocation(session.location)}
                      </Text>
                    </View>
                  </View>

                  {/* Started indicator */}
                  {session.actual_timestamp && (
                    <View className="mt-3 pt-3 border-t border-gray-600">
                      <Text className="text-xs font-pp text-green-500">
                        Started: {formatTime(session.actual_timestamp)}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JudgeScheduleOverview;
