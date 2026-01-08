import { useTheme } from "@/context/themeContext";
import { useTimer } from "@/context/timerContext";
import {
  useJudgingScheduleById,
  useStartJudgingTimer,
  useStartJudgingTimerByRoom,
  useAllJudgingSchedules,
} from "@/queries/judging";
import { JudgingScheduleItem } from "@/types/judging";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import {
  haptics,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "@/utils/haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pause, Play } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
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

  const initialScheduleId =
    typeof params.scheduleId === "string"
      ? parseInt(params.scheduleId, 10) || null
      : null;

  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(
    initialScheduleId
  );
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<
    "pitching" | "qa" | "buffer" | "complete"
  >("pitching");

  // Note: Pause tracking is now handled in timer context for persistence across screen exits

  const formatLocation = (location: JudgingScheduleItem["location"]) =>
    typeof location === "string" ? location : location.location_name;

  // Auto-load schedule from route params and reset state
  useEffect(() => {
    if (params.scheduleId && typeof params.scheduleId === "string") {
      const id = parseInt(params.scheduleId, 10);
      if (!isNaN(id) && id > 0) {
        if (activeScheduleId !== id) {
          setActiveScheduleId(id);
          setIsRunning(false);
          setCurrentStage("pitching");
          setRemainingTime(0);
        }
      }
    }
  }, [params.scheduleId]);

  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useJudgingScheduleById(activeScheduleId || 0, {
    refetchInterval: activeScheduleId ? 3000 : undefined,
  });
  const startTimerMutation = useStartJudgingTimer();
  const startTimerByRoomMutation = useStartJudgingTimerByRoom();

  // Log duration from backend
  useEffect(() => {
    if (scheduleData) {
      console.log("[DEBUG] Schedule data from backend:", {
        judging_schedule_id: scheduleData.judging_schedule_id,
        duration: scheduleData.duration,
        durationInMinutes: scheduleData.duration,
        timestamp: scheduleData.timestamp,
        actual_timestamp: scheduleData.actual_timestamp,
      });

      const calculatedStages = calculateStages(scheduleData.duration);
      console.log("[DEBUG] Calculated stages:", {
        pitching: calculatedStages.pitching,
        qa: calculatedStages.qa,
        buffer: calculatedStages.buffer,
        total:
          calculatedStages.pitching +
          calculatedStages.qa +
          calculatedStages.buffer,
        pitchingSeconds: calculatedStages.pitching * 60,
        qaSeconds: calculatedStages.qa * 60,
        bufferSeconds: calculatedStages.buffer * 60,
        totalSeconds:
          (calculatedStages.pitching +
            calculatedStages.qa +
            calculatedStages.buffer) *
          60,
      });
    }
  }, [scheduleData]);

  // Calculate timer stages dynamically based on total duration
  // All judging rounds: 1 min buffer + 1 min Q&A + remaining time for pitching
  const calculateStages = (
    totalDuration: number
  ): { pitching: number; qa: number; buffer: number } => {
    const bufferMinutes = 1;
    const qaMinutes = 1;
    const pitchingMinutes = Math.max(
      totalDuration - bufferMinutes - qaMinutes,
      0
    );

    return {
      pitching: pitchingMinutes,
      qa: qaMinutes,
      buffer: bufferMinutes,
    };
  };

  // Get stages based on schedule data or use defaults
  const stages = scheduleData
    ? calculateStages(scheduleData.duration)
    : { pitching: 4, qa: 1, buffer: 1 }; // Fallback defaults

  // Fetch all schedules to calculate round count (use cached data only; don't refetch here)
  const { data: allSchedules } = useAllJudgingSchedules(false);

  const judgeSchedules = allSchedules?.filter(
    (schedule) => schedule.judge_id === scheduleData?.judge_id
  );

  const sortedJudgeSchedules = useMemo(() => {
    if (!judgeSchedules) return [];
    return [...judgeSchedules].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [judgeSchedules]);

  const nextSchedule = useMemo(() => {
    if (!scheduleData || !sortedJudgeSchedules.length) return null;
    const idx = sortedJudgeSchedules.findIndex(
      (s) => s.judging_schedule_id === scheduleData.judging_schedule_id
    );
    if (idx === -1 || idx + 1 >= sortedJudgeSchedules.length) return null;
    return sortedJudgeSchedules[idx + 1];
  }, [scheduleData, sortedJudgeSchedules]);

  // Initialize timer when schedule has started
  useEffect(() => {
    if (!scheduleData || !activeScheduleId) return;

    if (!scheduleData.actual_timestamp) {
      setIsRunning(false);
      setRemainingTime(0);
      return;
    }

    // Timer has been started - sync context if needed
    const contextSynced =
      timerContext.isTimerRunning &&
      timerContext.activeTimerId === activeScheduleId;

    if (!contextSynced) {
      timerContext.startTimer(activeScheduleId);
      setIsRunning(true);
      setCurrentStage("pitching");
      // Initialize remaining time to pitching duration
      const pitchingDurationSeconds = stages.pitching * 60;
      setRemainingTime(pitchingDurationSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleData?.actual_timestamp, activeScheduleId]);

  // Get current stage duration
  const getCurrentStageDuration = () => {
    if (currentStage === "complete") return 0;
    return stages[currentStage] * 60; // Convert to seconds
  };

  // Timer countdown logic - counts down from duration
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && scheduleData?.actual_timestamp) {
      interval = setInterval(() => {
        // Only update remaining time if not paused
        if (!timerContext.isPaused) {
          setRemainingTime((prev) => {
            const newRemaining = Math.max(prev - 1, 0); // Decrement by 1 second

            // Check if current stage has ended (remaining time hit 0)
            if (newRemaining === 0) {
              // Transition to next stage
              if (currentStage === "pitching") {
                setCurrentStage("qa");
                const qaDuration = stages.qa * 60;
                setRemainingTime(qaDuration);
                haptics.notificationAsync(NotificationFeedbackType.Success);
                Toast.show({
                  type: "success",
                  text1: "Q&A Time",
                  text2: "Pitching complete, starting Q&A",
                });
                return qaDuration;
              } else if (currentStage === "qa") {
                setCurrentStage("buffer");
                const bufferDuration = stages.buffer * 60;
                setRemainingTime(bufferDuration);
                haptics.notificationAsync(NotificationFeedbackType.Success);
                Toast.show({
                  type: "success",
                  text1: "Buffer Time",
                  text2: "Q&A complete, starting buffer",
                });
                return bufferDuration;
              } else if (currentStage === "buffer") {
                setCurrentStage("complete");
                setIsRunning(false);
                haptics.notificationAsync(NotificationFeedbackType.Error);
                timerContext.stopTimer();
                Toast.show({
                  type: "success",
                  text1: "Session Complete!",
                  text2: "All stages finished",
                });
                return 0;
              }
            }

            return newRemaining;
          });
        }
      }, 1000); // Update every 1 second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isRunning,
    timerContext.isPaused,
    currentStage,
    stages,
    scheduleData?.actual_timestamp,
    timerContext,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage for current stage (fills up as time progresses)
  const getProgress = () => {
    const stageDuration = getCurrentStageDuration();
    if (stageDuration === 0) return 100;
    // Calculate how much time has elapsed (full duration minus remaining)
    const elapsed = stageDuration - remainingTime;
    // Return elapsed time as percentage (0% at start, 100% at end)
    return Math.min((elapsed / stageDuration) * 100, 100);
  };

  // Get time remaining in current stage (just return the state variable)
  const getTimeRemaining = () => {
    // Debug logging
    if (remainingTime > 0 && remainingTime % 60 === 0) {
      console.log("[DEBUG] Timer calculation:");
      console.log("  Current stage:", currentStage);
      console.log("  Remaining:", remainingTime, "seconds");
      console.log("  Stage duration:", getCurrentStageDuration(), "seconds");
    }

    return remainingTime;
  };

  const handleStartTimer = async () => {
    if (!activeScheduleId || !scheduleData) return;

    haptics.impactAsync(ImpactFeedbackStyle.Heavy);

    // Optimistically start locally for instant UI response
    setIsRunning(true);
    setCurrentStage("pitching");
    const pitchingDurationSeconds = stages.pitching * 60;
    setRemainingTime(pitchingDurationSeconds);
    timerContext.startTimer(activeScheduleId);

    // Use room-based endpoint to trigger WebSocket broadcast
    const room = formatLocation(scheduleData.location);
    const timestamp = scheduleData.timestamp;

    console.log("[DEBUG] Starting timer by room:", room, "at time:", timestamp);

    startTimerByRoomMutation.mutate(
      { room, timestamp },
      {
        onError: (error) => {
          setIsRunning(false);
          timerContext.stopTimer();
          Toast.show({
            type: "error",
            text1: "Failed to Start",
            text2:
              error instanceof Error ? error.message : "Unable to start timer",
          });
        },
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Timer Started",
            text2: "Starting Pitching stage",
          });
        },
      }
    );
  };

  const handlePauseTimer = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
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
    if (!scheduleData || !judgeSchedules) {
      return { currentRound: 1, totalRounds: 1 };
    }

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
              haptics.impactAsync(ImpactFeedbackStyle.Light);
            },
            style: "cancel",
          },
          {
            text: "Exit",
            onPress: () => {
              haptics.impactAsync(ImpactFeedbackStyle.Medium);
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
      haptics.impactAsync(ImpactFeedbackStyle.Light);
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

    return (
      <View style={{ width: size, height: size, position: "relative" }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            stroke={isDark ? "#303030" : "#f0f0f0"}
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
            paddingTop: 8,
          }}
        >
          <Text
            className={cn("text-7xl font-onest-bold", themeStyles.primaryText)}
            style={{
              includeFontPadding: false,
              lineHeight: 84,
            }}
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

        {/* No Schedule Selected State */}
        {!activeScheduleId && (
          <View className="mt-8 items-center px-6">
            <Text
              className={cn(
                "text-center text-2xl font-onest-bold mb-4",
                themeStyles.primaryText
              )}
            >
              No Timer Selected
            </Text>
            <Text
              className={cn(
                "text-center text-base font-pp",
                themeStyles.secondaryText
              )}
            >
              Navigate to the Judging page to select a judging session and start
              a timer.
            </Text>
          </View>
        )}

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
                  className={cn(
                    "px-12 py-4 rounded-2xl flex-row items-center justify-center",
                    isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
                  )}
                  disabled={startTimerByRoomMutation.isPending}
                  style={{
                    opacity: startTimerByRoomMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Play size={24} color={isDark ? "#000" : "#fff"} />
                  <Text
                    className={cn(
                      "text-xl font-onest-bold ml-2",
                      isDark ? "text-black" : "text-white"
                    )}
                  >
                    {startTimerByRoomMutation.isPending
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
                  Team #{scheduleData.team_id} •{" "}
                  {formatLocation(scheduleData.location)}
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
                          isDark ? "bg-[#303030]" : "bg-gray-200"
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
                          isDark ? "bg-[#303030]" : "bg-gray-200"
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

                {/* Pause Button - Horizontal bar (disabled when complete) */}
                {currentStage !== "complete" && (
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
                )}

                {/* Next round navigation */}
                {currentStage === "complete" && (
                  <Pressable
                    onPress={() => {
                      if (!nextSchedule) return;
                      haptics.impactAsync(ImpactFeedbackStyle.Medium);
                      timerContext.stopTimer();
                      setIsRunning(false);
                      setCurrentStage("pitching");
                      setRemainingTime(0);
                      setActiveScheduleId(nextSchedule.judging_schedule_id);
                      router.replace({
                        pathname: "/(admin)/judgingTimer",
                        params: {
                          scheduleId: nextSchedule.judging_schedule_id,
                        },
                      });
                    }}
                    disabled={!nextSchedule}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl flex-row items-center justify-center gap-2 mt-4",
                      nextSchedule
                        ? isDark
                          ? "bg-[#75EDEF]"
                          : "bg-[#132B38]"
                        : "bg-gray-400"
                    )}
                    style={{ opacity: nextSchedule ? 1 : 0.6 }}
                  >
                    <Text
                      className={cn(
                        "text-lg font-onest-bold",
                        nextSchedule
                          ? isDark
                            ? "text-black"
                            : "text-white"
                          : "text-white"
                      )}
                    >
                      {nextSchedule ? "Move to Next Round" : "No More Rounds"}
                    </Text>
                  </Pressable>
                )}
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
