import { useTheme } from "@/context/themeContext";
import { useTimer } from "@/context/timerContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { getUserType } from "@/utils/tokens/secureStorage";
import {
  haptics,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "@/utils/haptics";
import { RoomGroup, getFullLocationName } from "@/utils/judging";
import { router } from "expo-router";
import { Play, Clock, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

interface JudgingEventCardProps {
  roomGroup: RoomGroup;
}

export const JudgingEventCard = ({ roomGroup }: JudgingEventCardProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { activeTimerId, isTimerRunning } = useTimer();

  // Determine room status based on all schedules in the room
  const getStatus = () => {
    // Check if any schedule in this room has started
    const anyStarted = roomGroup.schedules.some((s) => s.actual_timestamp);

    if (!anyStarted) {
      return { label: "Not Started", color: "text-gray-500", icon: "●" };
    }

    // If any started, check if all are completed
    const allCompleted = roomGroup.schedules.every((schedule) => {
      if (!schedule.actual_timestamp) return false;
      const startTime = new Date(schedule.actual_timestamp).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const durationSeconds = schedule.duration * 60;
      return elapsed >= durationSeconds;
    });

    if (allCompleted) {
      return {
        label: "Completed",
        color: "text-blue-500",
        icon: "✓",
      };
    }

    return {
      label: "In Progress",
      color: "text-green-500",
      icon: "●",
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
    // Use the first schedule in the room group to navigate to timer
    const firstSchedule = roomGroup.schedules[0];

    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(admin)/judgingTimer",
      params: { scheduleId: firstSchedule.judging_schedule_id },
    });
  };

  return (
    <Pressable
      onPress={handleStartTimer}
      disabled={status.label === "Completed"}
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
        opacity: status.label === "Completed" ? 0.6 : 1,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text
          className={cn("text-lg font-onest-bold", themeStyles.primaryText)}
        >
          {roomGroup.roomName}
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
        {/* Time */}
        <View className="flex-row items-center gap-2">
          <Clock size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {formatDateTime(roomGroup.timestamp)}
          </Text>
        </View>

        {/* Duration */}
        <View className="flex-row items-center gap-2">
          <Clock size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {roomGroup.schedules[0].duration} minutes
          </Text>
        </View>

        {/* Number of tables */}
        <View className="flex-row items-center gap-2">
          <Clock size={16} color={isDark ? "#A0A0A0" : "#666"} />
          <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
            {roomGroup.schedules.length}{" "}
            {roomGroup.schedules.length === 1 ? "table" : "tables"}
          </Text>
        </View>
      </View>

      {/* Action Button - Admin only */}
      <Pressable
        onPress={handleStartTimer}
        className={cn(
          "py-3 px-4 rounded-xl flex-row items-center justify-center gap-2",
          status.label === "Completed"
            ? "bg-gray-500"
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
        ) : (
          <>
            <Play size={20} color={isDark ? "#000" : "#fff"} />
            <Text
              className={cn(
                "text-base font-onest-bold",
                isDark ? "text-black" : "text-white"
              )}
            >
              {status.label === "In Progress" ? "View Timer" : "Start Timer"}
            </Text>
          </>
        )}
      </Pressable>
    </Pressable>
  );
};
