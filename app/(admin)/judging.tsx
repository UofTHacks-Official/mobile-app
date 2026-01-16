import { JudgingEventCard } from "@/components/JudgingEventCard";
import { JudgeScheduleView } from "@/components/JudgeScheduleView";
import { useTheme } from "@/context/themeContext";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { useJudgeSchedules } from "@/queries/judge";
import { useAllJudgingSchedules } from "@/queries/judging";
import { JudgingScheduleItem } from "@/types/judging";
import { USE_MOCK_JUDGING_DATA } from "@/utils/mockJudgingData";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import { groupSchedulesByRoom } from "@/utils/judging";
import { getJudgeId, getUserType } from "@/utils/tokens/secureStorage";
import { useEffect, useState, useMemo } from "react";
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
  const [filter, setFilter] = useState<
    "all" | "not-started" | "in-progress" | "completed"
  >("all");

  // Check if user is a judge
  useEffect(() => {
    const checkUserType = async () => {
      const userType = await getUserType();
      if (userType === "judge") {
        setIsJudge(true);
        const id = await getJudgeId();
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
    // No-op: retain dependency array to avoid lint warnings
  }, [isJudge, judgeId, judgingData, isLoading, isError, userTypeChecked]);

  // Sort schedules by timestamp (chronological order)
  const sortedSchedules = (judgingData as JudgingScheduleItem[] | null)
    ?.slice()
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // Group schedules by room
  const roomGroups = useMemo(() => {
    if (!sortedSchedules) return [];
    return groupSchedulesByRoom(sortedSchedules);
  }, [sortedSchedules]);

  // Get room status helper (check if ANY schedule in the room has started)
  const getRoomStatus = (roomSchedules: JudgingScheduleItem[]) => {
    // Check if any schedule in this room has started
    const anyStarted = roomSchedules.some((s) => s.actual_timestamp);

    if (!anyStarted) {
      return "not-started";
    }

    // If any started, check if all are completed
    const allCompleted = roomSchedules.every((schedule) => {
      if (!schedule.actual_timestamp) return false;
      const startTime = new Date(schedule.actual_timestamp).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const durationSeconds = schedule.duration * 60;
      return elapsed >= durationSeconds;
    });

    if (allCompleted) {
      return "completed";
    }

    return "in-progress";
  };

  // Find currently running room
  const runningRoom = roomGroups?.find(
    (room) => getRoomStatus(room.schedules) === "in-progress"
  );

  // Filter room groups based on selected filter
  const filteredRoomGroups = roomGroups?.filter((room) => {
    if (filter === "all") return true;
    return getRoomStatus(room.schedules) === filter;
  });

  if (!FEATURE_FLAGS.ENABLE_JUDGE_TIMERS) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Judging timers disabled
          </Text>
          <Text
            className={cn(
              "text-base font-pp text-center",
              themeStyles.secondaryText
            )}
          >
            Timer sync is off. Enable the judging timer feature flag to manage
            sessions here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Currently Running Timer - Show at top for better UX */}
        {!isJudge && runningRoom && (
          <View className="mb-4">
            <Text
              className={cn(
                "text-lg font-onest-bold mb-2",
                themeStyles.primaryText
              )}
            >
              Currently Running
            </Text>
            <JudgingEventCard roomGroup={runningRoom} />
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
            {filteredRoomGroups && filteredRoomGroups.length > 0 && (
              <Text
                className={cn(
                  "text-xl font-onest-bold mb-3",
                  themeStyles.primaryText
                )}
              >
                Judging Rooms
              </Text>
            )}
            {filteredRoomGroups?.map((roomGroup, index) => (
              <JudgingEventCard
                key={`${roomGroup.roomName}-${index}`}
                roomGroup={roomGroup}
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
