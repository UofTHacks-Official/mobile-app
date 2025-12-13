import { useTheme } from "@/context/themeContext";
import { useTimer } from "@/context/timerContext";
import {
  useJudgingScheduleById,
  useStartJudgingTimer,
  useAllJudgingSchedules,
} from "@/queries/judging";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pause, Play } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Toast from "react-native-toast-message";

const JudgingTimerScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { handleScroll } = useScrollNavBar();
  const params = useLocalSearchParams();
  const timerContext = useTimer();

  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<
    "pitching" | "qa" | "buffer" | "complete"
  >("pitching");

  // Note: Pause tracking is now handled in timer context for persistence across screen exits

  // Timer stages configuration (in minutes)
  // TODO: These should eventually come from backend
  const stages = {
    pitching: 4,
    qa: 2,
    buffer: 1,
  };

  // Auto-load schedule from route params and reset state
  useEffect(() => {
    if (params.scheduleId && typeof params.scheduleId === "string") {
      const id = parseInt(params.scheduleId, 10);
      if (!isNaN(id) && id > 0) {
        // Reset all state when loading a new schedule
        setActiveScheduleId(id);
        setIsRunning(false);
        setCurrentStage("pitching");
        setElapsedTime(0);
        // Pause tracking is handled in timer context
      }
    }
  }, [params.scheduleId]);

  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useJudgingScheduleById(activeScheduleId || 0);
  const startTimerMutation = useStartJudgingTimer();

  // Fetch all schedules to calculate round count for this judge
  const { data: allSchedules } = useAllJudgingSchedules();

  // Restore timer state when returning to screen
  useEffect(() => {
    if (scheduleData && activeScheduleId && scheduleData.actual_timestamp) {
      // Check if this schedule has an active timer in context
      if (
        timerContext.isTimerRunning &&
        timerContext.activeTimerId === activeScheduleId
      ) {
        // Restore the running state
        setIsRunning(true);

        // Calculate current elapsed time to determine stage
        const timestampStr = scheduleData.actual_timestamp.endsWith("Z")
          ? scheduleData.actual_timestamp
          : scheduleData.actual_timestamp + "Z";
        const startTime = new Date(timestampStr).getTime();
        const now = Date.now();
        const realElapsed = Math.floor((now - startTime) / 1000);
        const totalElapsed = realElapsed - timerContext.totalPausedTime;

        // Determine current stage based on elapsed time
        const pitchingDuration = stages.pitching * 60;
        const qaDuration = stages.qa * 60;
        const bufferDuration = stages.buffer * 60;

        if (totalElapsed < pitchingDuration) {
          setCurrentStage("pitching");
        } else if (totalElapsed < pitchingDuration + qaDuration) {
          setCurrentStage("qa");
        } else if (
          totalElapsed <
          pitchingDuration + qaDuration + bufferDuration
        ) {
          setCurrentStage("buffer");
        } else {
          setCurrentStage("complete");
          setIsRunning(false);
        }

        console.log(
          "[DEBUG] Restored timer state - running:",
          !timerContext.isPaused,
          "paused:",
          timerContext.isPaused,
          "stage:",
          currentStage
        );
      }
    }
  }, [
    scheduleData,
    activeScheduleId,
    timerContext.isTimerRunning,
    timerContext.activeTimerId,
    timerContext.isPaused,
    timerContext.totalPausedTime,
    stages.pitching,
    stages.qa,
    stages.buffer,
    currentStage,
  ]);

  // Get current stage duration
  const getCurrentStageDuration = () => {
    if (currentStage === "complete") return 0;
    return stages[currentStage] * 60; // Convert to seconds
  };

  // Timer logic with stage transitions
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && scheduleData?.actual_timestamp) {
      // Add 'Z' suffix if not present to treat as UTC
      const timestampStr = scheduleData.actual_timestamp.endsWith("Z")
        ? scheduleData.actual_timestamp
        : scheduleData.actual_timestamp + "Z";
      const startTime = new Date(timestampStr).getTime();

      interval = setInterval(() => {
        // Only update elapsed time and check transitions if not paused
        if (!timerContext.isPaused) {
          const now = Date.now();
          const realElapsed = Math.floor((now - startTime) / 1000);
          // Subtract total paused time from context to get actual elapsed time
          const totalElapsed = realElapsed - timerContext.totalPausedTime;
          setElapsedTime(totalElapsed);

          // Calculate cumulative stage durations
          const pitchingDuration = stages.pitching * 60;
          const qaDuration = stages.qa * 60;
          const bufferDuration = stages.buffer * 60;

          // Auto-transition between stages
          if (currentStage === "pitching" && totalElapsed >= pitchingDuration) {
            setCurrentStage("qa");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
              type: "success",
              text1: "Q&A Time",
              text2: "Pitching complete, starting Q&A",
            });
          } else if (
            currentStage === "qa" &&
            totalElapsed >= pitchingDuration + qaDuration
          ) {
            setCurrentStage("buffer");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
              type: "success",
              text1: "Buffer Time",
              text2: "Q&A complete, starting buffer",
            });
          } else if (
            currentStage === "buffer" &&
            totalElapsed >= pitchingDuration + qaDuration + bufferDuration
          ) {
            setCurrentStage("complete");
            setIsRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
              type: "success",
              text1: "Session Complete!",
              text2: "All stages finished",
            });
          }
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isRunning,
    timerContext.isPaused,
    scheduleData?.actual_timestamp,
    currentStage,
    timerContext.totalPausedTime,
    stages.pitching,
    stages.qa,
    stages.buffer,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate elapsed time within current stage
  const getStageElapsedTime = () => {
    const pitchingDuration = stages.pitching * 60;
    const qaDuration = stages.qa * 60;

    if (currentStage === "pitching") {
      return elapsedTime;
    } else if (currentStage === "qa") {
      return elapsedTime - pitchingDuration;
    } else if (currentStage === "buffer") {
      return elapsedTime - pitchingDuration - qaDuration;
    }
    return 0;
  };

  // Calculate progress percentage for current stage (fills up as time progresses)
  const getProgress = () => {
    const stageElapsed = getStageElapsedTime();
    const stageDuration = getCurrentStageDuration();
    if (stageDuration === 0) return 100;
    // Return elapsed time as percentage (0% at start, 100% at end)
    return Math.min((stageElapsed / stageDuration) * 100, 100);
  };

  // Get time remaining in current stage
  const getTimeRemaining = () => {
    const stageElapsed = getStageElapsedTime();
    const stageDuration = getCurrentStageDuration();
    const remaining = stageDuration - stageElapsed;

    // Debug logging
    if (elapsedTime > 0 && elapsedTime % 60 === 0) {
      console.log("[DEBUG] Timer calculation:");
      console.log("  Current stage:", currentStage);
      console.log("  Total elapsed:", elapsedTime, "seconds");
      console.log("  Stage elapsed:", stageElapsed, "seconds");
      console.log("  Stage duration:", stageDuration, "seconds");
      console.log("  Remaining:", remaining, "seconds");
    }

    return Math.max(remaining, 0);
  };

  const handleStartTimer = async () => {
    if (!activeScheduleId) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await startTimerMutation.mutateAsync(activeScheduleId);
      setIsRunning(true);
      setCurrentStage("pitching"); // Reset to first stage
      setElapsedTime(0);

      // Update timer context (this also resets pause tracking and sets isPaused to false)
      timerContext.startTimer(activeScheduleId);

      Toast.show({
        type: "success",
        text1: "Timer Started",
        text2: "Starting Pitching stage",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Start",
        text2: error instanceof Error ? error.message : "Unable to start timer",
      });
    }
  };

  const handlePauseTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timerContext.isPaused) {
      // Resuming - calculate how long we were paused and add to total
      if (timerContext.pauseStartTime !== null) {
        const now = Date.now();
        const pauseDuration = Math.floor(
          (now - timerContext.pauseStartTime) / 1000
        );
        timerContext.addPausedTime(pauseDuration);
        timerContext.setPauseStartTime(null);

        console.log(
          "[DEBUG] Resume - Pause duration:",
          pauseDuration,
          "seconds"
        );
        console.log(
          "[DEBUG] Resume - Total paused time:",
          timerContext.totalPausedTime + pauseDuration,
          "seconds"
        );
      }
      timerContext.resumeTimer();
    } else {
      // Pausing - record when we paused
      timerContext.setPauseStartTime(Date.now());
      timerContext.pauseTimer();

      console.log("[DEBUG] Paused at:", Date.now());
    }
  };

  // Get stage display name
  const getStageDisplayName = () => {
    if (currentStage === "pitching") return "Pitching";
    if (currentStage === "qa") return "Q&A";
    if (currentStage === "buffer") return "Buffer";
    return "Complete";
  };

  // Calculate round information for this judge
  const getRoundInfo = () => {
    if (!scheduleData || !allSchedules) {
      return { currentRound: 1, totalRounds: 1 };
    }

    // Filter schedules for this judge
    const judgeSchedules = allSchedules.filter(
      (s) => s.judge_id === scheduleData.judge_id
    );

    // Sort by timestamp to get chronological order
    const sortedSchedules = [...judgeSchedules].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Find current schedule's position
    const currentRound =
      sortedSchedules.findIndex(
        (s) => s.judging_schedule_id === scheduleData.judging_schedule_id
      ) + 1;

    return {
      currentRound: currentRound > 0 ? currentRound : 1,
      totalRounds: judgeSchedules.length,
    };
  };

  const handleGoBack = () => {
    console.log(
      "[DEBUG] handleGoBack - isTimerRunning:",
      timerContext.isTimerRunning
    );
    console.log("[DEBUG] handleGoBack - isPaused:", timerContext.isPaused);
    console.log("[DEBUG] handleGoBack - isRunning (local):", isRunning);

    // Check if timer is running (whether paused or not)
    if (timerContext.isTimerRunning) {
      // Determine current timer state for message
      const timerState = timerContext.isPaused ? "paused" : "running";

      // Show warning alert explaining state will persist
      Alert.alert(
        "Exit Timer?",
        `Your timer will remain ${timerState}. You can return to this screen anytime to continue.`,
        [
          {
            text: "Cancel",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
            style: "cancel",
          },
          {
            text: "Exit",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Don't stop timer - let it persist
              // Just navigate back
              router.push("/(admin)/judging");
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      // No active timer, just navigate back
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push("/(admin)/judging");
    }
  };

  // Circular progress ring component
  const CircularProgress = ({
    size = 280,
    strokeWidth = 20,
  }: {
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgress();
    // Calculate offset: at 0% we want full circumference hidden, at 100% we want 0 hidden
    // So offset should decrease as progress increases
    const strokeDashoffset = circumference * (1 - progress / 100);

    console.log("[DEBUG] CircularProgress - progress:", progress);
    console.log("[DEBUG] CircularProgress - circumference:", circumference);
    console.log(
      "[DEBUG] CircularProgress - strokeDashoffset:",
      strokeDashoffset
    );

    return (
      <View style={{ width: size, height: size, position: "relative" }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            stroke={isDark ? "#1a1a2e" : "#f0f0f0"}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle - starts from 12 o'clock and goes clockwise */}
          <Circle
            stroke={isDark ? "#75EDEF" : "#132B38"}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Time display in center */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            className={cn("text-7xl font-onest-bold", themeStyles.primaryText)}
          >
            {formatTime(getTimeRemaining())}
          </Text>
        </View>
      </View>
    );
  };

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
        </View>

        {/* Loading State */}
        {isLoading && activeScheduleId && (
          <View className="mt-8 items-center">
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
              Loading schedule...
            </Text>
          </View>
        )}

        {/* Error State */}
        {isError && activeScheduleId && (
          <View className="mt-8">
            <Text
              className={cn(
                "text-center text-lg font-onest-bold mb-2",
                themeStyles.primaryText
              )}
            >
              Schedule Not Found
            </Text>
            <Text
              className={cn(
                "text-center text-base font-pp",
                themeStyles.secondaryText
              )}
            >
              Please check the ID and try again
            </Text>
          </View>
        )}

        {/* Timer UI */}
        {scheduleData && !isLoading && (
          <View className="flex-1 items-center justify-center">
            {/* Round indicator - dynamic based on judge's schedules */}
            <Text
              className={cn(
                "text-base font-onest-bold mb-8",
                themeStyles.secondaryText
              )}
            >
              Round {getRoundInfo().currentRound} ({getRoundInfo().currentRound}
              /{getRoundInfo().totalRounds})
            </Text>

            {/* Current Stage Title */}
            <Text
              className={cn(
                "text-2xl font-onest-bold mb-12",
                themeStyles.primaryText
              )}
            >
              {getStageDisplayName()}
            </Text>

            {/* Start Timer Button (shown before timer starts) */}
            {!scheduleData.actual_timestamp && (
              <View className="items-center mb-8">
                <Pressable
                  onPress={handleStartTimer}
                  className="bg-green-500 px-12 py-4 rounded-2xl flex-row items-center justify-center"
                  disabled={startTimerMutation.isPending}
                  style={{
                    opacity: startTimerMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Play size={24} color="white" />
                  <Text className="text-white text-xl font-onest-bold ml-2">
                    {startTimerMutation.isPending
                      ? "Starting..."
                      : "Start Timer"}
                  </Text>
                </Pressable>
                <Text
                  className={cn(
                    "mt-4 text-sm font-pp",
                    themeStyles.secondaryText
                  )}
                >
                  Team #{scheduleData.team_id} • {scheduleData.location}
                </Text>
              </View>
            )}

            {/* Circular Timer (shown after timer starts) */}
            {scheduleData.actual_timestamp && (
              <>
                <CircularProgress />

                {/* Stage Indicators - Only show upcoming stages */}
                {(currentStage === "pitching" ||
                  currentStage === "qa" ||
                  currentStage === "buffer") && (
                  <View className="flex-row gap-4 mt-12 mb-8">
                    {/* Q&A Stage - only show during pitching */}
                    {currentStage === "pitching" && (
                      <View
                        className={cn(
                          "px-8 py-3 rounded-xl",
                          isDark ? "bg-[#2a2a3e]" : "bg-gray-200"
                        )}
                      >
                        <Text
                          className={cn(
                            "text-base font-onest-bold",
                            themeStyles.primaryText
                          )}
                        >
                          Q&A ({stages.qa}:00)
                        </Text>
                      </View>
                    )}

                    {/* Buffer Stage - only show during pitching or qa */}
                    {(currentStage === "pitching" || currentStage === "qa") && (
                      <View
                        className={cn(
                          "px-8 py-3 rounded-xl",
                          isDark ? "bg-[#2a2a3e]" : "bg-gray-200"
                        )}
                      >
                        <Text
                          className={cn(
                            "text-base font-onest-bold",
                            themeStyles.primaryText
                          )}
                        >
                          Buffer ({stages.buffer}:00)
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Pause Button - Horizontal bar */}
                <Pressable
                  onPress={handlePauseTimer}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl flex-row items-center justify-center gap-2",
                    isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
                  )}
                >
                  {timerContext.isPaused ? (
                    <>
                      <Play size={24} color={isDark ? "#000" : "#fff"} />
                      <Text
                        className={cn(
                          "text-lg font-onest-bold",
                          isDark ? "text-black" : "text-white"
                        )}
                      >
                        Resume
                      </Text>
                    </>
                  ) : (
                    <>
                      <Pause size={24} color={isDark ? "#000" : "#fff"} />
                      <Text
                        className={cn(
                          "text-lg font-onest-bold",
                          isDark ? "text-black" : "text-white"
                        )}
                      >
                        Pause
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JudgingTimerScreen;
