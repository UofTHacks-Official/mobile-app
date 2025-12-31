import { View, Text } from "react-native";
import { Briefcase } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import { formatDateRange } from "@/utils/profile";

interface ProfileExperienceProps {
  hacker: HackerProfile;
}

export const ProfileExperience = ({ hacker }: ProfileExperienceProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  // Hide section if no jobs
  if (!hacker.hacker_jobs || hacker.hacker_jobs.length === 0) {
    return null;
  }

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="mr-3">
          <Briefcase size={20} color={isDark ? "#75EDEF" : "#132B38"} />
        </View>
        <Text
          className={cn(
            "text-lg font-semibold uppercase",
            themeStyles.primaryText
          )}
        >
          Experience
        </Text>
      </View>

      {/* Job List */}
      <View
        className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-neutral-800" : "bg-neutral-100"
        )}
      >
        {hacker.hacker_jobs.map((job, index) => (
          <View
            key={index}
            className={cn(
              index > 0 && "pt-4 mt-4",
              index > 0 &&
                (isDark
                  ? "border-t border-neutral-700"
                  : "border-t border-neutral-300")
            )}
          >
            {/* Role and Company */}
            <Text
              className={cn(
                "text-lg font-semibold mb-1",
                themeStyles.primaryText
              )}
            >
              {job.role} @ {job.company}
            </Text>

            {/* Date Range */}
            {job.start_date && (
              <Text className={cn("text-xs mb-2", themeStyles.secondaryText)}>
                {formatDateRange(job.start_date, job.end_date)}
              </Text>
            )}

            {/* Description */}
            {job.description && (
              <Text className={cn("text-sm", themeStyles.primaryText)}>
                {job.description}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
