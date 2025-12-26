import { View, Text } from "react-native";
import { Code } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";

interface ProfileSkillsProps {
  hacker: HackerProfile;
}

export const ProfileSkills = ({ hacker }: ProfileSkillsProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  // Hide section if no skills
  if (!hacker.skills || hacker.skills.length === 0) {
    return null;
  }

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <Code
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
          Skills
        </Text>
      </View>

      {/* Skills Badges */}
      <View className="flex-row flex-wrap gap-2">
        {hacker.skills.map((skill, index) => (
          <View key={index} className="bg-cyan-400/20 px-3 py-2 rounded-lg">
            <Text className="text-cyan-400 text-sm font-medium">{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
