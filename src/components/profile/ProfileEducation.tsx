import { View, Text } from "react-native";
import { GraduationCap } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import { formatDateRange } from "@/utils/profile";

interface ProfileEducationProps {
  hacker: HackerProfile;
}

export const ProfileEducation = ({ hacker }: ProfileEducationProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  // Check if we have education data from either source
  const hasEducationArray =
    hacker.hacker_educations && hacker.hacker_educations.length > 0;
  const hasFlatEducation =
    hacker.school || hacker.major || hacker.level_of_study;

  if (!hasEducationArray && !hasFlatEducation) {
    return null;
  }

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <GraduationCap
          size={20}
          color={isDark ? "#75EDEF" : "#132B38"}
          className="mr-2"
        />
        <Text
          className={cn(
            "text-lg font-semibold uppercase",
            themeStyles.primaryText
          )}
        >
          Education
        </Text>
      </View>

      <View
        className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-neutral-800" : "bg-neutral-100"
        )}
      >
        {/* Use hacker_educations array if available */}
        {hasEducationArray ? (
          hacker.hacker_educations!.map((education, index) => (
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
              {/* Institution */}
              <Text
                className={cn(
                  "text-lg font-semibold mb-1",
                  themeStyles.primaryText
                )}
              >
                {education.institution}
              </Text>

              {/* Program */}
              {education.program && (
                <Text className={cn("text-base mb-2", themeStyles.primaryText)}>
                  {education.program}
                </Text>
              )}

              {/* Date Range */}
              {education.start_date && (
                <Text className={cn("text-xs", themeStyles.secondaryText)}>
                  {formatDateRange(education.start_date, education.end_date)}
                </Text>
              )}
            </View>
          ))
        ) : (
          /* Fallback to flat fields */
          <>
            {hacker.school && (
              <View className="mb-3">
                <Text
                  className={cn(
                    "text-xs uppercase mb-1",
                    themeStyles.secondaryText
                  )}
                >
                  SCHOOL
                </Text>
                <Text
                  className={cn(
                    "text-base font-medium",
                    themeStyles.primaryText
                  )}
                >
                  {hacker.school}
                </Text>
              </View>
            )}

            {hacker.major && (
              <View className="mb-3">
                <Text
                  className={cn(
                    "text-xs uppercase mb-1",
                    themeStyles.secondaryText
                  )}
                >
                  MAJOR
                </Text>
                <Text
                  className={cn(
                    "text-base font-medium",
                    themeStyles.primaryText
                  )}
                >
                  {hacker.major}
                </Text>
              </View>
            )}

            {hacker.level_of_study && (
              <View>
                <Text
                  className={cn(
                    "text-xs uppercase mb-1",
                    themeStyles.secondaryText
                  )}
                >
                  LEVEL OF STUDY
                </Text>
                <Text
                  className={cn(
                    "text-base font-medium",
                    themeStyles.primaryText
                  )}
                >
                  {hacker.level_of_study}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};
