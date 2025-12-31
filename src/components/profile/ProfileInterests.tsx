import { View, Text } from "react-native";
import { Heart } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";

interface ProfileInterestsProps {
  hacker: HackerProfile;
}

export const ProfileInterests = ({ hacker }: ProfileInterestsProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  // Hide section if no interests
  if (!hacker.interest || hacker.interest.length === 0) {
    return null;
  }

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="mr-3">
          <Heart size={20} color={isDark ? "#75EDEF" : "#132B38"} />
        </View>
        <Text
          className={cn(
            "text-lg font-semibold uppercase",
            themeStyles.primaryText
          )}
        >
          Project Interests
        </Text>
      </View>

      {/* Interests Badges */}
      <View className="flex-row flex-wrap gap-2">
        {hacker.interest.map((interest, index) => (
          <View key={index} className="bg-teal-400/20 px-3 py-2 rounded-lg">
            <Text className="text-teal-400 text-sm font-medium">
              {interest}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
