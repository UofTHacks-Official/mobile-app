import { useTheme } from "@/context/themeContext";
import {
  computeRemainingSecondsFromTimer,
  useTimer,
} from "@/context/timerContext";
import {
  useJudgingScheduleById,
  useStartJudgingTimer,
  useStartJudgingTimerByRoom,
  useTogglePauseJudgingTimerByRoom,
  useStopJudgingTimerByRoom,
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
import { formatLocationForDisplay, getFullLocationName } from "@/utils/judging";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pause, Play } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [currentStage, setCurrentStage] = useState<
    "pitching" | "qa" | "buffer" | "complete"
  >("pitching");
  const previousStageRef = useRef<"pitching" | "qa" | "buffer" | "complete">(
    "pitching"
  );
  const [now, setNow] = useState(Date.now());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Note: Pause tracking is now handled in timer context for persistence across screen exits

  // Get full location name for API calls (includes table)
  const getLocationName = (location: JudgingScheduleItem["location"]) =>
    typeof location === "string" ? location : location.location_name;

  // Initialize from active timer if one exists, otherwise use route params
  useEffect(() => {
    if (hasInitialized) return;

    // Check if there's an active running or paused timer
    const activeTimerEntry = Object.entries(timerContext.roomTimers).find(
      ([room, timer]) => timer.status === "running" || timer.status === "paused"
    );

    if (activeTimerEntry) {
      const [room, timer] = activeTimerEntry;
      // Restore from active timer
      if (
        timer.judgingScheduleId &&
        timer.judgingScheduleId !== activeScheduleId
      ) {
        console.log("[DEBUG] Restoring active timer:", {
          scheduleId: timer.judgingScheduleId,
          room,
          status: timer.status,
          remainingSeconds: timer.remainingSeconds,
        });
        setActiveScheduleId(timer.judgingScheduleId);
        // Stage will be calculated from remaining time in the next effect
      }
    } else if (params.scheduleId && typeof params.scheduleId === "string") {
      // No active timer - use route params
      const id = parseInt(params.scheduleId, 10);
      if (!isNaN(id) && id > 0 && activeScheduleId !== id) {
        console.log("[DEBUG] Using route param scheduleId:", id);
        setActiveScheduleId(id);
        setCurrentStage("pitching");
        previousStageRef.current = "pitching";
      }
    }

    setHasInitialized(true);
  }, [
    hasInitialized,
    timerContext.roomTimers,
    params.scheduleId,
    activeScheduleId,
  ]);

  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useJudgingScheduleById(activeScheduleId || 0, {
    refetchInterval: activeScheduleId ? 3000 : undefined,
  });
  const startTimerMutation = useStartJudgingTimer();
  const startTimerByRoomMutation = useStartJudgingTimerByRoom();
  const togglePauseTimerByRoomMutation = useTogglePauseJudgingTimerByRoom();
  const stopTimerByRoomMutation = useStopJudgingTimerByRoom();

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

  // Get the room name (without table) to look up the timer in context
  // All tables in the same room share the same timer
  const roomName = scheduleData
    ? formatLocationForDisplay(scheduleData.location)
    : null;
  const roomTimer = roomName ? timerContext.roomTimers[roomName] : undefined;
  const isRoomPaused = roomTimer?.status === "paused";
  const isRoomRunning = roomTimer?.status === "running";

  // Total duration in seconds (shared across helpers)
  const totalDurationSeconds =
    (stages.pitching + stages.qa + stages.buffer) * 60;

  // Get total remaining seconds - SAME AS JUDGE SIDE
  const getTotalRemaining = (): number => {
    // Always clamp to total duration to avoid runaway values if the start time is in the future
    const clampRemaining = (remaining: number) =>
      Math.max(Math.min(remaining, totalDurationSeconds), 0);

    // If we have a roomTimer, use it (same as judge side)
    if (roomTimer) {
      if (roomTimer.status === "stopped") return 0;
      if (roomTimer.status === "paused") return roomTimer.remainingSeconds;

      // Status is "running" - calculate elapsed since last sync
      const elapsedSinceSync = Math.floor(
        (now - roomTimer.lastSyncedAt) / 1000
      );
      return clampRemaining(roomTimer.remainingSeconds - elapsedSinceSync);
    }

    // Fallback: calculate from actual_timestamp if no roomTimer
    if (!scheduleData?.actual_timestamp) return totalDurationSeconds;
    const startMs = new Date(scheduleData.actual_timestamp).getTime();
    if (Number.isNaN(startMs)) return totalDurationSeconds;

    // If the backend timestamp is in the future, treat elapsed as 0 so we don't add
    // the "time until start" to the countdown (which was causing 13k+ minute timers)
    const elapsed = Math.max(Math.floor((now - startMs) / 1000), 0);
    return clampRemaining(totalDurationSeconds - elapsed);
  };

  const totalRemaining = getTotalRemaining();

  // UI ONLY: Determine which stage label to show based on remaining time
  // Buffer (1 min) = last 60 seconds
  // QA (1 min) = 60-120 seconds remaining
  // Pitching = everything else
  const getCurrentStageFromRemaining = (
    remaining: number
  ): "pitching" | "qa" | "buffer" | "complete" => {
    if (remaining === 0) return "complete";

    const bufferDuration = stages.buffer * 60; // 60 seconds
    const qaDuration = stages.qa * 60; // 60 seconds

    // Last 60 seconds = buffer
    if (remaining <= bufferDuration) return "buffer";

    // 60-120 seconds remaining = qa
    if (remaining <= bufferDuration + qaDuration) return "qa";

    // Everything else = pitching
    return "pitching";
  };

  // UI ONLY: Get the display time for current stage
  const getStageDisplayTime = (
    remaining: number,
    stage: "pitching" | "qa" | "buffer" | "complete"
  ): number => {
    if (stage === "complete") return 0;

    const bufferDuration = stages.buffer * 60;
    const qaDuration = stages.qa * 60;

    if (stage === "buffer") {
      // Show countdown from 60 to 0
      return remaining;
    } else if (stage === "qa") {
      // Show countdown from 60 to 0 (subtract buffer duration)
      return remaining - bufferDuration;
    } else {
      // Pitching: show countdown from total - 120 to 0 (subtract qa + buffer)
      return remaining - (bufferDuration + qaDuration);
    }
  };

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

  // Tick to update the display while a timer source exists
  useEffect(() => {
    const hasTimerSource = !!roomTimer || !!scheduleData?.actual_timestamp;
    if (!hasTimerSource) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [roomTimer, scheduleData?.actual_timestamp]);

  // Update current stage based on total remaining
  useEffect(() => {
    const newStage = getCurrentStageFromRemaining(totalRemaining);
    if (newStage !== currentStage) {
      setCurrentStage(newStage);
    }
  }, [totalRemaining]);

  // Handle side effects when stage changes
  useEffect(() => {
    if (previousStageRef.current !== currentStage) {
      // Stage has changed - trigger appropriate notifications
      if (currentStage === "qa") {
        haptics.notificationAsync(NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Q&A Time",
          text2: "Pitching complete, starting Q&A",
        });
      } else if (currentStage === "buffer") {
        haptics.notificationAsync(NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Buffer Time",
          text2: "Q&A complete, starting buffer",
        });
      } else if (currentStage === "complete") {
        haptics.notificationAsync(NotificationFeedbackType.Error);
        Toast.show({
          type: "success",
          text1: "Session Complete!",
          text2: "All stages finished",
        });
      }

      previousStageRef.current = currentStage;
    }
  }, [currentStage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get display time for current stage (UI only - splits up the total remaining)
  const stageDisplayTime = getStageDisplayTime(totalRemaining, currentStage);

  // Get current stage duration
  const getCurrentStageDuration = () => {
    if (currentStage === "complete") return 0;
    return stages[currentStage] * 60;
  };

  // Calculate progress percentage for current stage (fills up as time progresses)
  const getProgress = () => {
    const stageDuration = getCurrentStageDuration();
    if (stageDuration === 0) return 100;
    const elapsed = stageDuration - stageDisplayTime;
    return Math.min((elapsed / stageDuration) * 100, 100);
  };

  const handleStartTimer = async () => {
    if (!activeScheduleId || !scheduleData) return;

    haptics.impactAsync(ImpactFeedbackStyle.Heavy);

    // Use room name only (without table) to start ALL timers in the room
    const room = formatLocationForDisplay(scheduleData.location);
    const timestamp = scheduleData.timestamp;

    console.log("[DEBUG] Starting timer by room:", room, "at time:", timestamp);

    startTimerByRoomMutation.mutate(
      { room, timestamp },
      {
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Failed to Start",
            text2:
              error instanceof Error ? error.message : "Unable to start timer",
          });
        },
        onSuccess: () => {
          // Immediately seed a local timer so the countdown updates without waiting for refetch
          timerContext.upsertRoomTimer(room, {
            actualStart: new Date().toISOString(),
            durationSeconds: totalDurationSeconds,
            remainingSeconds: totalDurationSeconds,
            lastSyncedAt: Date.now(),
            status: "running",
            judgingScheduleId: scheduleData.judging_schedule_id,
            teamId: scheduleData.team_id,
          });

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
    if (!scheduleData) return;

    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    // Use room name only (without table) to pause ALL timers in the room
    const room = formatLocationForDisplay(scheduleData.location);
    const timestamp = scheduleData.timestamp;
    const nowMs = Date.now();

    // Use the toggle endpoint - backend handles pause/resume logic
    togglePauseTimerByRoomMutation.mutate(
      { room, timestamp },
      {
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Failed",
            text2:
              error instanceof Error ? error.message : "Unable to toggle timer",
          });
        },
        onSuccess: (data) => {
          const computedRemaining =
            computeRemainingSecondsFromTimer(roomTimer, nowMs) ??
            (() => {
              if (!scheduleData.actual_timestamp) return totalDurationSeconds;
              const startMs = new Date(scheduleData.actual_timestamp).getTime();
              if (Number.isNaN(startMs)) return totalDurationSeconds;
              const elapsed = Math.max(Math.floor((nowMs - startMs) / 1000), 0);
              return Math.max(totalDurationSeconds - elapsed, 0);
            })();

          if (data.action === "pause_timer") {
            timerContext.upsertRoomTimer(room, {
              actualStart:
                roomTimer?.actualStart ?? scheduleData.actual_timestamp ?? null,
              durationSeconds:
                roomTimer?.durationSeconds ?? totalDurationSeconds,
              remainingSeconds: computedRemaining,
              lastSyncedAt: nowMs,
              status: "paused",
              judgingScheduleId:
                roomTimer?.judgingScheduleId ??
                scheduleData.judging_schedule_id,
              teamId: roomTimer?.teamId ?? scheduleData.team_id,
            });
          } else if (data.action === "resume_timer") {
            timerContext.upsertRoomTimer(room, {
              actualStart:
                roomTimer?.actualStart ?? scheduleData.actual_timestamp ?? null,
              durationSeconds:
                roomTimer?.durationSeconds ?? totalDurationSeconds,
              remainingSeconds: computedRemaining,
              lastSyncedAt: nowMs,
              status: "running",
              judgingScheduleId:
                roomTimer?.judgingScheduleId ??
                scheduleData.judging_schedule_id,
              teamId: roomTimer?.teamId ?? scheduleData.team_id,
            });
          }

          console.log("[DEBUG] Toggle response:", data);
          Toast.show({
            type: "success",
            text1:
              data.action === "resume_timer" ? "Timer Resumed" : "Timer Paused",
            text2: `${data.judges_notified} judge(s) notified`,
          });
        },
      }
    );
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
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    router.push("/(admin)/judging");
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
            {formatTime(stageDisplayTime)}
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
                  {formatLocationForDisplay(scheduleData.location)}
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
                    disabled={togglePauseTimerByRoomMutation.isPending}
                    style={{
                      opacity: togglePauseTimerByRoomMutation.isPending
                        ? 0.65
                        : 1,
                    }}
                  >
                    {isRoomPaused ? (
                      <Play size={24} color={isDark ? "#000" : "#fff"} />
                    ) : (
                      <Pause size={24} color={isDark ? "#000" : "#fff"} />
                    )}
                    <Text
                      className={cn(
                        "text-lg font-onest-bold",
                        isDark ? "text-black" : "text-white"
                      )}
                    >
                      {togglePauseTimerByRoomMutation.isPending
                        ? isRoomPaused
                          ? "Resuming..."
                          : "Pausing..."
                        : isRoomPaused
                          ? "Resume"
                          : "Pause"}
                    </Text>
                  </Pressable>
                )}

                {/* Status helper */}
                {roomTimer && currentStage !== "complete" && (
                  <Text
                    className={cn(
                      "mt-3 text-sm font-pp text-center",
                      themeStyles.secondaryText
                    )}
                  >
                    {isRoomPaused
                      ? "Timer is paused"
                      : isRoomRunning
                        ? "Timer is running"
                        : "Waiting to start"}
                  </Text>
                )}

                {/* Next round navigation */}
                {currentStage === "complete" && (
                  <Pressable
                    onPress={() => {
                      if (!nextSchedule) return;
                      haptics.impactAsync(ImpactFeedbackStyle.Medium);
                      setCurrentStage("pitching");
                      previousStageRef.current = "pitching";
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
