import { JudgingEventCard } from "@/components/JudgingEventCard";
import { JudgeScheduleView } from "@/components/JudgeScheduleView";
import { useTheme } from "@/context/themeContext";
import { useJudgeSchedules } from "@/queries/judge";
import {
  useAllJudgingSchedules,
  useGenerateJudgingSchedules,
} from "@/queries/judging";
import { JudgingScheduleItem } from "@/types/judging";
import { USE_MOCK_JUDGING_DATA } from "@/utils/mockJudgingData";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import { getJudgeId, getUserType } from "@/utils/tokens/secureStorage";
import { useQueryClient } from "@tanstack/react-query";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { RefreshCw } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const JudgingLocationScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { handleScroll } = useScrollNavBar();
  const queryClient = useQueryClient();

  const [isJudge, setIsJudge] = useState(false);
  const [judgeId, setJudgeId] = useState<number | null>(null);

  const [userTypeChecked, setUserTypeChecked] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "not-started" | "in-progress" | "completed"
  >("all");

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
  const generateSchedulesMutation = useGenerateJudgingSchedules();

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

  const handleGenerateSchedules = async () => {
    try {
      haptics.impactAsync(ImpactFeedbackStyle.Medium);

      // Clear the current schedules from UI immediately
      queryClient.setQueryData(["judging-schedules"], []);

      const result = await generateSchedulesMutation.mutateAsync();

      console.log("[DEBUG] Generate result:", result);

      // Try different possible response structures
      const scheduleCount =
        result?.schedules_created ||
        result?.total_schedules_created ||
        result?.count ||
        result?.total ||
        (Array.isArray(result) ? result.length : undefined);

      const message =
        scheduleCount !== undefined
          ? `Created ${scheduleCount} judging schedules`
          : result?.message || "Judging schedules created successfully";

      Toast.show({
        type: "success",
        text1: "Schedules Generated",
        text2: message,
      });
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to generate schedules";

      // If it's a 500 error with generic message, provide helpful context
      if (
        error?.response?.status === 500 &&
        errorMessage === "Internal Server Error"
      ) {
        errorMessage =
          "Backend error. Check if teams, judges, and sponsors exist in database.";
      }

      console.error("[Generate Schedules Error]", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        fullError: error,
      });

      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: errorMessage,
      });
    }
  };

  // Sort schedules by timestamp (chronological order)
  const sortedSchedules = (judgingData as JudgingScheduleItem[] | null)
    ?.slice()
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // Get event status helper
  const getEventStatus = (event: JudgingScheduleItem) => {
    if (!event.actual_timestamp) {
      return "not-started";
    }

    const startTime = new Date(event.actual_timestamp).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const durationSeconds = event.duration * 60;

    if (elapsed < durationSeconds) {
      return "in-progress";
    }

    return "completed";
  };

  // Filter schedules based on selected filter
  const filteredSchedules = sortedSchedules?.filter((event) => {
    if (filter === "all") return true;
    return getEventStatus(event) === filter;
  });

  // For judges only: show loading/error states
  if (isJudge) {
    if (isLoading) {
      return (
        <SafeAreaView className={cn("flex-1", themeStyles.background)}>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#FFFFFF" : "#002A5C"}
            />
            <Text
              className={cn(
                "mt-4 text-base font-pp",
                themeStyles.secondaryText
              )}
            >
              Loading your judging schedule...
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    if (isError) {
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
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView
        className="flex-1 px-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Show different header for judges */}
        {!isJudge && (
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
              className={cn(
                "text-base font-pp mb-4",
                themeStyles.secondaryText
              )}
            >
              Manage judging sessions and timers
            </Text>
          </View>
        )}

        {/* Generate Schedules Button (Admin Only, hidden when using mock data) */}
        {!isJudge && !USE_MOCK_JUDGING_DATA && (
          <Pressable
            onPress={handleGenerateSchedules}
            disabled={generateSchedulesMutation.isPending}
            className={cn(
              "rounded-2xl p-6 mb-4 flex-row items-center justify-between",
              isDark ? "bg-[#303030]" : "bg-white"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3,
              opacity: generateSchedulesMutation.isPending ? 0.6 : 1,
            }}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: isDark ? "#75EDEF" : "#132B38" }}
              >
                {generateSchedulesMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={isDark ? "#000" : "#fff"}
                  />
                ) : (
                  <RefreshCw size={24} color={isDark ? "#000" : "#fff"} />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className={cn(
                    "text-xl font-onest-bold mb-1",
                    themeStyles.primaryText
                  )}
                >
                  {generateSchedulesMutation.isPending
                    ? "Generating..."
                    : "Generate Schedules"}
                </Text>
                <Text
                  className={cn("text-sm font-pp", themeStyles.secondaryText)}
                >
                  Create judging schedules from database
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Mock Data Indicator */}
        {USE_MOCK_JUDGING_DATA && (
          <View
            className={cn(
              "rounded-xl p-4 mb-4 border-2",
              isDark
                ? "bg-yellow-900/20 border-yellow-500"
                : "bg-yellow-100 border-yellow-500"
            )}
          >
            <Text
              className={cn(
                "text-sm font-onest-bold text-yellow-600 dark:text-yellow-400"
              )}
            >
              Using Mock Data
            </Text>
            <Text
              className={cn(
                "text-xs font-pp mt-1 text-yellow-700 dark:text-yellow-300"
              )}
            >
              Temporary test data is enabled. Set USE_MOCK_JUDGING_DATA to false
              in mockJudgingData.ts to use real backend data.
            </Text>
          </View>
        )}

        {/* Filter Buttons */}
        {!isJudge && sortedSchedules && sortedSchedules.length > 0 && (
          <View className="flex-row gap-2 mb-4 flex-wrap">
            <Pressable
              onPress={() => setFilter("all")}
              className={cn(
                "px-4 py-2 rounded-xl",
                filter === "all"
                  ? isDark
                    ? "bg-[#75EDEF]"
                    : "bg-[#132B38]"
                  : isDark
                    ? "bg-[#303030]"
                    : "bg-gray-200"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-onest-bold",
                  filter === "all"
                    ? isDark
                      ? "text-black"
                      : "text-white"
                    : themeStyles.primaryText
                )}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter("not-started")}
              className={cn(
                "px-4 py-2 rounded-xl",
                filter === "not-started"
                  ? isDark
                    ? "bg-[#75EDEF]"
                    : "bg-[#132B38]"
                  : isDark
                    ? "bg-[#303030]"
                    : "bg-gray-200"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-onest-bold",
                  filter === "not-started"
                    ? isDark
                      ? "text-black"
                      : "text-white"
                    : themeStyles.primaryText
                )}
              >
                Not Started
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter("in-progress")}
              className={cn(
                "px-4 py-2 rounded-xl",
                filter === "in-progress"
                  ? isDark
                    ? "bg-[#75EDEF]"
                    : "bg-[#132B38]"
                  : isDark
                    ? "bg-[#303030]"
                    : "bg-gray-200"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-onest-bold",
                  filter === "in-progress"
                    ? isDark
                      ? "text-black"
                      : "text-white"
                    : themeStyles.primaryText
                )}
              >
                In Progress
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter("completed")}
              className={cn(
                "px-4 py-2 rounded-xl",
                filter === "completed"
                  ? isDark
                    ? "bg-[#75EDEF]"
                    : "bg-[#132B38]"
                  : isDark
                    ? "bg-[#303030]"
                    : "bg-gray-200"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-onest-bold",
                  filter === "completed"
                    ? isDark
                      ? "text-black"
                      : "text-white"
                    : themeStyles.primaryText
                )}
              >
                Completed
              </Text>
            </Pressable>
          </View>
        )}

        {/* Judging Events List - Different view for judges */}
        {isJudge ? (
          <View className="mt-6">
            {sortedSchedules && sortedSchedules.length > 0 && (
              <JudgeScheduleView schedules={sortedSchedules} />
            )}
          </View>
        ) : (
          <View className="mt-4">
            {filteredSchedules && filteredSchedules.length > 0 && (
              <Text
                className={cn(
                  "text-xl font-onest-bold mb-3",
                  themeStyles.primaryText
                )}
              >
                Judging Events
              </Text>
            )}
            {filteredSchedules?.map((event, index) => (
              <JudgingEventCard
                key={`${event.judging_schedule_id}-${event.team_id}-${index}`}
                event={event}
              />
            ))}
          </View>
        )}

        {/* Loading state for admins */}
        {!isJudge && isLoading && (
          <View className="mt-6 items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#FFFFFF" : "#002A5C"}
            />
            <Text
              className={cn(
                "mt-4 text-base font-pp",
                themeStyles.secondaryText
              )}
            >
              Loading schedules...
            </Text>
          </View>
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
                {isJudge
                  ? "No judging sessions assigned to you yet."
                  : "No judging schedules have been created yet."}
              </Text>
              <Text
                className={cn(
                  "text-center text-sm font-pp mt-2",
                  themeStyles.secondaryText
                )}
              >
                {isJudge
                  ? "Check back later for your judging assignments."
                  : "Use the 'Generate Schedules' button above to create them."}
              </Text>
            </View>
          )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JudgingLocationScreen;
