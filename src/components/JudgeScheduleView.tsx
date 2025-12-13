import { useTheme } from "@/context/themeContext";
import { useProject } from "@/queries/project";
import { JudgingScheduleItem } from "@/types/judging";
import { cn, getThemeStyles } from "@/utils/theme";
import { getSponsorPin } from "@/utils/tokens/secureStorage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface ProjectCardProps {
  schedule: JudgingScheduleItem;
}

const ProjectCard = ({ schedule }: ProjectCardProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [pin, setPin] = useState<number | null>(null);

  useEffect(() => {
    const loadPin = async () => {
      const storedPin = await getSponsorPin();
      setPin(storedPin);
    };
    loadPin();
  }, []);

  const { data: project } = useProject(pin, schedule.team_id);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(judge)/projectOverview",
      params: {
        teamId: schedule.team_id,
        scheduleId: schedule.judging_schedule_id,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "rounded-xl p-4 mb-3 flex-row justify-between items-center",
        isDark ? "bg-[#303030]" : "bg-white border border-gray-300"
      )}
    >
      <View className="flex-1">
        <Text
          className={cn(
            "text-base font-onest-bold mb-1",
            themeStyles.primaryText
          )}
        >
          {project?.project_name || `Project (Team #${schedule.team_id})`}
        </Text>
        <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
          {formatTime(schedule.timestamp)} -{" "}
          {formatTime(
            new Date(
              new Date(schedule.timestamp).getTime() + schedule.duration * 60000
            ).toISOString()
          )}
        </Text>
      </View>
    </Pressable>
  );
};

interface JudgeScheduleViewProps {
  schedules: JudgingScheduleItem[];
}

export const JudgeScheduleView = ({ schedules }: JudgeScheduleViewProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [pin, setPin] = useState<number | null>(null);

  useEffect(() => {
    const loadPin = async () => {
      const storedPin = await getSponsorPin();
      setPin(storedPin);
    };
    loadPin();
  }, []);

  // Get first schedule to get sponsor category
  const { data: firstProject } = useProject(
    pin,
    schedules.length > 0 ? schedules[0].team_id : null
  );

  // Sort schedules by timestamp
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get location from first schedule (assuming all in same location)
  const location = schedules.length > 0 ? schedules[0].location : "";
  const category = firstProject?.categories[0] || "General";

  return (
    <View>
      {/* Header Section */}
      <View className="mb-6 mt-8">
        <Text
          className={cn(
            "text-3xl font-onest-bold mb-1",
            themeStyles.primaryText
          )}
        >
          {category}
        </Text>
        {location && (
          <Text className={cn("text-base font-pp", themeStyles.secondaryText)}>
            Location: {location}
          </Text>
        )}
      </View>

      {/* Project Cards */}
      <View className="mb-6">
        {sortedSchedules.map((schedule) => (
          <ProjectCard key={schedule.judging_schedule_id} schedule={schedule} />
        ))}
      </View>

      {/* Start Button */}
      {schedules.length > 0 && (
        <Pressable
          className={cn(
            "py-4 rounded-xl items-center justify-center mt-4",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
          )}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // Navigate to first project
            if (sortedSchedules.length > 0) {
              router.push({
                pathname: "/(judge)/projectOverview",
                params: {
                  teamId: sortedSchedules[0].team_id,
                  scheduleId: sortedSchedules[0].judging_schedule_id,
                },
              });
            }
          }}
        >
          <Text
            className={cn(
              "text-lg font-onest-bold",
              isDark ? "text-black" : "text-white"
            )}
          >
            Start
          </Text>
        </Pressable>
      )}
    </View>
  );
};
