import { View, Text } from "react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import { getDisplayName } from "@/utils/profile";

interface ProfileHeaderProps {
  hacker: HackerProfile;
}

export const ProfileHeader = ({ hacker }: ProfileHeaderProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const displayName = getDisplayName(hacker);
  const initials =
    `${hacker.hacker_fname[0] || ""}${hacker.hacker_lname[0] || ""}`.toUpperCase();

  return (
    <View className="mb-8">
      {/* Avatar and Name Section */}
      <View className="flex-row items-center mb-6">
        {/* Avatar Circle with Initials */}
        <View className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 items-center justify-center mr-4">
          <Text className="text-white font-bold text-2xl">{initials}</Text>
        </View>

        {/* Name and Email */}
        <View className="flex-1">
          <Text
            className={cn("text-2xl font-bold mb-1", themeStyles.primaryText)}
          >
            {displayName}
          </Text>
          <Text className={cn("text-sm", themeStyles.secondaryText)}>
            {hacker.hacker_email}
          </Text>
        </View>
      </View>

      {/* Pronouns */}
      {hacker.pronoun && (
        <View className="mb-4">
          <Text className={cn("text-xs uppercase", themeStyles.secondaryText)}>
            PRONOUNS
          </Text>
          <Text
            className={cn("text-base font-medium", themeStyles.primaryText)}
          >
            {hacker.pronoun}
          </Text>
        </View>
      )}

      {/* Bio */}
      {hacker.bio && (
        <View>
          <Text
            className={cn("text-xs uppercase mb-2", themeStyles.secondaryText)}
          >
            BIO
          </Text>
          <Text className={cn("text-base", themeStyles.primaryText)}>
            {hacker.bio}
          </Text>
        </View>
      )}
    </View>
  );
};
