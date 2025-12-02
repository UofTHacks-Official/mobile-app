import { useTheme } from "@/context/themeContext";
import {
  useJudgingScheduleById,
  useStartJudgingTimer,
} from "@/queries/judging";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronLeft, Play, Timer } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const JudgingTimerScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { handleScroll } = useScrollNavBar();

  const [scheduleId, setScheduleId] = useState("");
  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useJudgingScheduleById(activeScheduleId || 0);
  const startTimerMutation = useStartJudgingTimer();

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && scheduleData?.actual_timestamp) {
      const startTime = new Date(scheduleData.actual_timestamp).getTime();

      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, scheduleData?.actual_timestamp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleLoadSchedule = () => {
    const id = parseInt(scheduleId, 10);
    if (isNaN(id) || id <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid ID",
        text2: "Please enter a valid schedule ID",
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveScheduleId(id);
    setIsRunning(false);
    setElapsedTime(0);
  };

  const handleStartTimer = async () => {
    if (!activeScheduleId) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await startTimerMutation.mutateAsync(activeScheduleId);
      setIsRunning(true);
      Toast.show({
        type: "success",
        text1: "Timer Started",
        text2: "Judging session timer has begun",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Start",
        text2: error instanceof Error ? error.message : "Unable to start timer",
      });
    }
  };

  const handleStopTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(false);
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
          <Text
            className={cn(
              "text-3xl font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Judging Timer
          </Text>
          <Text className={cn("text-base font-pp", themeStyles.secondaryText)}>
            Enter a schedule ID to start timing a judging session
          </Text>
        </View>

        {/* Schedule ID Input */}
        <View className="mt-6">
          <Text
            className={cn("text-sm font-pp mb-2", themeStyles.secondaryText)}
          >
            Schedule ID
          </Text>
          <View className="flex-row gap-3">
            <TextInput
              className={cn(
                "flex-1 px-4 rounded-xl text-lg font-pp",
                themeStyles.lightCardBackground
              )}
              placeholder="Enter schedule ID"
              placeholderTextColor={isDark ? "#888" : "#666"}
              keyboardType="number-pad"
              value={scheduleId}
              onChangeText={setScheduleId}
              style={{
                minHeight: 50,
                textAlignVertical: "center",
                color: isDark ? "#fff" : "#000",
              }}
            />
            <Pressable
              onPress={handleLoadSchedule}
              className={cn(
                "px-6 rounded-xl justify-center items-center",
                isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
              )}
              disabled={!scheduleId.trim()}
              style={{ opacity: scheduleId.trim() ? 1 : 0.5 }}
            >
              <Text
                className={cn(
                  "text-base font-onest-bold",
                  isDark ? "text-black" : "text-white"
                )}
              >
                Load
              </Text>
            </Pressable>
          </View>
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

        {/* Schedule Details & Timer */}
        {scheduleData && !isLoading && (
          <View className="mt-8">
            {/* Schedule Info Card */}
            <View
              className={cn(
                "rounded-2xl p-4 mb-6 border",
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
              <Text
                className={cn(
                  "text-xl font-onest-bold mb-3",
                  themeStyles.primaryText
                )}
              >
                Session Details
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text
                    className={cn("text-sm font-pp", themeStyles.secondaryText)}
                  >
                    Location:
                  </Text>
                  <Text
                    className={cn("text-sm font-pp", themeStyles.primaryText)}
                  >
                    {scheduleData.location}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text
                    className={cn("text-sm font-pp", themeStyles.secondaryText)}
                  >
                    Team ID:
                  </Text>
                  <Text
                    className={cn("text-sm font-pp", themeStyles.primaryText)}
                  >
                    #{scheduleData.team_id}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text
                    className={cn("text-sm font-pp", themeStyles.secondaryText)}
                  >
                    Judge ID:
                  </Text>
                  <Text
                    className={cn("text-sm font-pp", themeStyles.primaryText)}
                  >
                    #{scheduleData.judge_id}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text
                    className={cn("text-sm font-pp", themeStyles.secondaryText)}
                  >
                    Scheduled Time:
                  </Text>
                  <Text
                    className={cn("text-sm font-pp", themeStyles.primaryText)}
                  >
                    {formatDateTime(scheduleData.timestamp)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text
                    className={cn("text-sm font-pp", themeStyles.secondaryText)}
                  >
                    Duration:
                  </Text>
                  <Text
                    className={cn("text-sm font-pp", themeStyles.primaryText)}
                  >
                    {scheduleData.duration} minutes
                  </Text>
                </View>
                {scheduleData.actual_timestamp && (
                  <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-600">
                    <Text
                      className={cn(
                        "text-sm font-pp",
                        themeStyles.secondaryText
                      )}
                    >
                      Started At:
                    </Text>
                    <Text
                      className={cn("text-sm font-pp text-green-500 font-bold")}
                    >
                      {formatDateTime(scheduleData.actual_timestamp)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Timer Display */}
            <View
              className={cn(
                "rounded-2xl p-8 mb-6 items-center",
                isDark
                  ? "bg-[#1a1a2e] border-2 border-gray-700"
                  : "bg-white border-2 border-gray-200"
              )}
            >
              <Timer size={48} color={isDark ? "#75EDEF" : "#132B38"} />
              <Text
                className={cn(
                  "text-6xl font-onest-bold mt-4",
                  isRunning ? "text-green-500" : themeStyles.primaryText
                )}
              >
                {formatTime(elapsedTime)}
              </Text>
              <Text
                className={cn(
                  "text-sm font-pp mt-2",
                  themeStyles.secondaryText
                )}
              >
                {isRunning ? "Timer Running" : "Timer Stopped"}
              </Text>
            </View>

            {/* Control Buttons */}
            <View className="flex-row gap-3">
              {!scheduleData.actual_timestamp && (
                <Pressable
                  onPress={handleStartTimer}
                  className="flex-1 bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
                  disabled={startTimerMutation.isPending}
                  style={{
                    opacity: startTimerMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Play size={20} color="white" />
                  <Text className="text-white text-lg font-onest-bold ml-2">
                    {startTimerMutation.isPending
                      ? "Starting..."
                      : "Start Timer"}
                  </Text>
                </Pressable>
              )}

              {isRunning && (
                <Pressable
                  onPress={handleStopTimer}
                  className="flex-1 bg-red-500 py-4 rounded-xl items-center justify-center"
                >
                  <Text className="text-white text-lg font-onest-bold">
                    Stop Timer
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JudgingTimerScreen;
