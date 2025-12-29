import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import { getDisplayName } from "@/utils/profile";
import { Star } from "lucide-react-native";
import {
  useSaveHacker,
  useUnsaveHacker,
  useIsHackerSaved,
} from "@/queries/judge";

interface ProfileHeaderProps {
  hacker: HackerProfile;
}

export const ProfileHeader = ({ hacker }: ProfileHeaderProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const displayName = getDisplayName(hacker);
  const initials =
    `${hacker.hacker_fname[0] || ""}${hacker.hacker_lname[0] || ""}`.toUpperCase();

  // Check if this hacker is saved
  const { data: isSaved = false } = useIsHackerSaved(hacker.hacker_id);
  const saveHackerMutation = useSaveHacker();
  const unsaveHackerMutation = useUnsaveHacker();

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await unsaveHackerMutation.mutateAsync(hacker.hacker_id);
      } else {
        await saveHackerMutation.mutateAsync(hacker.hacker_id);
      }
    } catch (error) {
      console.error("Toggle save error:", error);
    }
  };

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
          <View className="flex-row items-center gap-2">
            <Text
              className={cn("text-2xl font-bold mb-1", themeStyles.primaryText)}
            >
              {displayName}
            </Text>
            <Pressable
              onPress={handleToggleSave}
              className={cn(
                "p-1.5 rounded-lg",
                isSaved ? (isDark ? "bg-[#75EDEF]/20" : "bg-[#132B38]/10") : ""
              )}
            >
              <Star
                size={20}
                color={
                  isSaved
                    ? isDark
                      ? "#75EDEF"
                      : "#132B38"
                    : isDark
                      ? "#666"
                      : "#999"
                }
                fill={
                  isSaved ? (isDark ? "#75EDEF" : "#132B38") : "transparent"
                }
              />
            </Pressable>
          </View>
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
