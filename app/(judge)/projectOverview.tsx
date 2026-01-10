import { useTheme } from "@/context/themeContext";
import {
  useTimer,
  computeRemainingSecondsFromStart,
  computeRemainingSecondsFromTimer,
} from "@/context/timerContext";
import { useAllJudgingSchedules, useJudgeSchedules } from "@/queries/judging";
import { cn, getThemeStyles } from "@/utils/theme";
import { formatLocationForDisplay } from "@/utils/judging";
import { getJudgeId } from "@/utils/tokens/secureStorage";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const ProjectOverview = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const params = useLocalSearchParams();
  const timerContext = useTimer();

  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());

  // Load judge ID and schedule ID from params/storage
  useEffect(() => {
    const loadData = async () => {
      const storedJudgeId = await getJudgeId();
      setJudgeId(storedJudgeId);

      if (params.scheduleId && typeof params.scheduleId === "string") {
        setScheduleId(parseInt(params.scheduleId));
      }
    };
    loadData();
  }, [params]);

  const { data: allSchedules } = useAllJudgingSchedules();
  const {
    data: judgeSchedules,
    refetch: refetchJudgeSchedules,
    isFetching: isFetchingJudgeSchedules,
    isLoading: isLoadingJudgeSchedules,
    isError: isJudgeSchedulesError,
  } = useJudgeSchedules(judgeId, !!judgeId);

  // Keep now ticking locally for countdown display
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Refetch schedules when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (refetchJudgeSchedules) {
        refetchJudgeSchedules();
      }
    }, [refetchJudgeSchedules])
  );

  const currentSchedule = useMemo(() => {
    if (!judgeSchedules || !scheduleId) return null;
    return judgeSchedules.find((s) => s.judging_schedule_id === scheduleId);
  }, [judgeSchedules, scheduleId]);

  const project = currentSchedule?.team?.project;

  const handleOpenLink = (url: string) => {
    if (url) {
      haptics.impactAsync(ImpactFeedbackStyle.Light);
      Linking.openURL(url);
    }
  };

  const handleReady = () => {
    if (!project || !scheduleId || !currentSchedule) return;

    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(judge)/scorecard",
      params: {
        projectId: project.project_id,
        teamId: project.team_id,
        scheduleId: scheduleId,
      },
    });
  };

  const locationName = currentSchedule
    ? formatLocationForDisplay(currentSchedule.location)
    : "";

  // Note: Room timer is now managed by WebSocket listener (useJudgeTimerWebSocket)
  // No need to hydrate here - the WebSocket will update roomTimers in real-time

  const roomTimer = locationName
    ? timerContext.roomTimers[locationName]
    : undefined;

  // Debug logging
  useEffect(() => {
    console.log("[DEBUG projectOverview] locationName:", locationName);
    console.log("[DEBUG projectOverview] roomTimer:", roomTimer);
    console.log(
      "[DEBUG projectOverview] all roomTimers:",
      timerContext.roomTimers
    );
  }, [locationName, roomTimer, timerContext.roomTimers]);

  const remainingSeconds = computeRemainingSecondsFromTimer(roomTimer, nowTs);
  const timerStatusLabel =
    roomTimer?.status === "paused"
      ? "Timer paused by admin"
      : roomTimer?.status === "stopped"
        ? "Timer ended by admin"
        : null;
  const countdownDisplay =
    remainingSeconds !== null
      ? `${Math.floor((remainingSeconds || 0) / 60)
          .toString()
          .padStart(2, "0")}:${((remainingSeconds || 0) % 60)
          .toString()
          .padStart(2, "0")}`
      : null;

  if (isLoadingJudgeSchedules) {
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
            Loading project details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isJudgeSchedulesError || !currentSchedule || !project) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Project Not Found
          </Text>
          <Text
            className={cn(
              "text-base font-pp text-center",
              themeStyles.secondaryText
            )}
          >
            Unable to load project details. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView className="flex-1 px-6">
        {/* Project Name */}
        <View className="mt-12 mb-4">
          <Text
            className={cn("text-2xl font-onest-bold", themeStyles.primaryText)}
          >
            {project.project_name}
          </Text>
        </View>

        {/* Categories/Tags */}
        {project.categories && project.categories.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {project.categories.slice(0, 3).map((category, index) => (
              <View
                key={index}
                className={cn(
                  "px-3 py-1.5 rounded-full",
                  isDark ? "bg-[#303030]" : "bg-gray-200"
                )}
              >
                <Text
                  className={cn("text-sm font-pp", themeStyles.primaryText)}
                >
                  {category}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <View className="mb-6">
          <Text
            className={cn(
              "text-base font-pp leading-6",
              themeStyles.primaryText
            )}
          >
            {project.project_description}
          </Text>
        </View>

        {/* Links */}
        <View className="mb-6 gap-3">
          {project.devpost_link && (
            <Pressable
              onPress={() => handleOpenLink(project.devpost_link)}
              className={cn(
                "flex-row items-center gap-2 py-3 px-4 rounded-xl",
                isDark ? "bg-[#303030]" : "bg-white border border-gray-300"
              )}
            >
              <ExternalLink size={18} color={isDark ? "#75EDEF" : "#132B38"} />
              <Text
                className={cn(
                  "text-base font-pp",
                  isDark ? "text-[#75EDEF]" : "text-[#132B38]"
                )}
              >
                View Devpost
              </Text>
            </Pressable>
          )}
          {project.github_link && (
            <Pressable
              onPress={() => handleOpenLink(project.github_link)}
              className={cn(
                "flex-row items-center gap-2 py-3 px-4 rounded-xl",
                isDark ? "bg-[#303030]" : "bg-white border border-gray-300"
              )}
            >
              <ExternalLink size={18} color={isDark ? "#75EDEF" : "#132B38"} />
              <Text
                className={cn(
                  "text-base font-pp",
                  isDark ? "text-[#75EDEF]" : "text-[#132B38]"
                )}
              >
                View GitHub
              </Text>
            </Pressable>
          )}
          {project.demo_link && (
            <Pressable
              onPress={() => handleOpenLink(project.demo_link)}
              className={cn(
                "flex-row items-center gap-2 py-3 px-4 rounded-xl",
                isDark ? "bg-[#303030]" : "bg-white border border-gray-300"
              )}
            >
              <ExternalLink size={18} color={isDark ? "#75EDEF" : "#132B38"} />
              <Text
                className={cn(
                  "text-base font-pp",
                  isDark ? "text-[#75EDEF]" : "text-[#132B38]"
                )}
              >
                View Demo
              </Text>
            </Pressable>
          )}
        </View>

        {/* Members */}
        <View className="mb-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-3",
              themeStyles.primaryText
            )}
          >
            Members
          </Text>
          <View className="flex-row flex-wrap gap-x-4 gap-y-2">
            {project.team_members.map((member, index) => (
              <Text
                key={index}
                className={cn("text-base font-pp", themeStyles.primaryText)}
                style={{ width: "48%" }}
              >
                {member}
              </Text>
            ))}
          </View>
        </View>

        {/* Ready Button */}
        <Pressable
          onPress={handleReady}
          className={cn(
            "py-4 rounded-xl mb-8",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
          )}
        >
          <Text
            className={cn(
              "text-center text-lg font-onest-bold",
              isDark ? "text-black" : "text-white"
            )}
          >
            Ready
          </Text>
        </Pressable>
        {!roomTimer ? (
          <Text
            className={cn(
              "text-center text-sm font-pp mb-4",
              themeStyles.secondaryText
            )}
          >
            Waiting for admin to start the timer for this room.
          </Text>
        ) : (
          <View className="items-center mb-4">
            <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
              Time remaining for this project
            </Text>
            <Text
              className={cn(
                "text-2xl font-onest-bold mt-1",
                themeStyles.primaryText
              )}
            >
              {countdownDisplay}
            </Text>
            {timerStatusLabel && (
              <Text
                className={cn(
                  "text-xs font-pp mt-1",
                  themeStyles.secondaryText
                )}
              >
                {timerStatusLabel}
              </Text>
            )}
            {isFetchingJudgeSchedules && (
              <Text
                className={cn(
                  "text-xs font-pp mt-1",
                  themeStyles.secondaryText
                )}
              >
                Syncing latest timer...
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectOverview;
