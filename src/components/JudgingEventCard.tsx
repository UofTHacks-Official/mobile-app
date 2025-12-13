import { useTheme } from "@/context/themeContext";
import { useTimer } from "@/context/timerContext";
import { JudgingScheduleItem } from "@/types/judging";
import { cn, getThemeStyles } from "@/utils/theme";
import { getUserType } from "@/utils/tokens/secureStorage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Play, Clock, MapPin, Users, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

interface JudgingEventCardProps {
  event: JudgingScheduleItem;
}

export const JudgingEventCard = ({ event }: JudgingEventCardProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { activeTimerId, isTimerRunning } = useTimer();
  const [isJudge, setIsJudge] = useState(false);

  // Check if user is a judge
  useEffect(() => {
    const checkUserType = async () => {
      const userType = await getUserType();
      setIsJudge(userType === "judge");
    };
    checkUserType();
  }, []);

  // Determine event status
  const getStatus = () => {
    if (!event.actual_timestamp) {
      return { label: "Not Started", color: "text-gray-500", icon: "●" };
    }

    const startTime = new Date(event.actual_timestamp).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const durationSeconds = event.duration * 60;

    if (elapsed < durationSeconds) {
      return {
        label: "In Progress",
        color: "text-green-500",
        icon: "●",
      };
    }

    return {
      label: "Completed",
      color: "text-blue-500",
      icon: "✓",
    };
  };

  const status = getStatus();

  // Format timestamp
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleStartTimer = () => {
    // Check if another timer is running
    if (isTimerRunning && activeTimerId !== event.judging_schedule_id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Timer Already Running",
        text2: "Stop the current timer before starting a new one",
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(admin)/judgingTimer",
      params: { scheduleId: event.judging_schedule_id },
    });
  };

  const handleStartJudging = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(judge)/projectOverview",
      params: {
        teamId: event.team_id,
        scheduleId: event.judging_schedule_id,
      },
    });
  };

  return (
    <Pressable
      onPress={handleStartTimer}
      className={cn(
        "rounded-2xl p-4 mb-4 border",
        isDark ? "bg-[#303030] border-gray-700" : "bg-white border-gray-200"
      )}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text
          className={cn("text-lg font-onest-bold", themeStyles.primaryText)}
        >
          Event #{event.judging_schedule_id}
        </Text>
        {status.label !== "Completed" && (
          <View className="flex-row items-center gap-1">
            <Text className={cn("text-sm font-pp", status.color)}>
              {status.icon}
            </Text>
            <Text className={cn("text-sm font-pp", status.color)}>
              {status.label}
            </Text>
          </View>
        )}
      </View>

      {/* Event Details */}
      <View className="space-y-2 mb-4">
        {/* Judge */}
        <View className="flex-row items-center gap-2">
          <Users size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            Judge #{event.judge_id}
          </Text>
        </View>

        {/* Team */}
        <View className="flex-row items-center gap-2">
          <Users size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.primaryText)}>
            Team #{event.team_id}
          </Text>
        </View>

        {/* Time */}
        <View className="flex-row items-center gap-2">
          <Clock size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {formatDateTime(event.timestamp)}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center gap-2">
          <MapPin size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {event.location}
          </Text>
        </View>

        {/* Duration */}
        <View className="flex-row items-center gap-2">
          <Clock size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {event.duration} minutes
          </Text>
        </View>
      </View>

      {/* Action Button - Different for Admin vs Judge */}
      <Pressable
        onPress={isJudge ? handleStartJudging : handleStartTimer}
        className={cn(
          "py-3 px-4 rounded-xl flex-row items-center justify-center gap-2",
          status.label === "Completed"
            ? "bg-gray-500"
            : activeTimerId === event.judging_schedule_id &&
                isTimerRunning &&
                !isJudge
              ? isDark
                ? "bg-[#75EDEF]"
                : "bg-[#132B38]"
              : isDark
                ? "bg-[#75EDEF]"
                : "bg-[#132B38]"
        )}
        disabled={status.label === "Completed"}
      >
        {status.label === "Completed" ? (
          <>
            <CheckCircle size={20} color="white" />
            <Text className="text-white text-base font-onest-bold">
              Completed
            </Text>
          </>
        ) : isJudge ? (
          <>
            <Play size={20} color={isDark ? "#000" : "#fff"} />
            <Text
              className={cn(
                "text-base font-onest-bold",
                isDark ? "text-black" : "text-white"
              )}
            >
              Start Judging
            </Text>
          </>
        ) : activeTimerId === event.judging_schedule_id && isTimerRunning ? (
          <>
            <CheckCircle size={20} color={isDark ? "#000" : "#fff"} />
            <Text
              className={cn(
                "text-base font-onest-bold",
                isDark ? "text-black" : "text-white"
              )}
            >
              Timer Running
            </Text>
          </>
        ) : (
          <>
            <Play size={20} color={isDark ? "#000" : "#fff"} />
            <Text
              className={cn(
                "text-base font-onest-bold",
                isDark ? "text-black" : "text-white"
              )}
            >
              {status.label === "In Progress" ? "Resume Timer" : "Start Timer"}
            </Text>
          </>
        )}
      </Pressable>
    </Pressable>
  );
};
