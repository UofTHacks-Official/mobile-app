import { View, Text, Pressable, Linking } from "react-native";
import { FolderGit2 } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";

interface ProfileProjectProps {
  hacker: HackerProfile;
}

export const ProfileProject = ({ hacker }: ProfileProjectProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  // Get project from hacker profile
  const project = hacker.project;

  // Hide section if no project
  if (!project?.project_name) {
    return null;
  }

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="mr-3">
          <FolderGit2 size={20} color={isDark ? "#75EDEF" : "#132B38"} />
        </View>
        <Text
          className={cn(
            "text-lg font-semibold uppercase",
            themeStyles.primaryText
          )}
        >
          Project
        </Text>
      </View>

      {/* Project Content */}
      <View
        className={cn(
          "rounded-xl p-4 border",
          isDark
            ? "bg-neutral-800 border-neutral-700"
            : "bg-white border-neutral-200"
        )}
      >
        {/* Project Name */}
        <Text
          className={cn("text-lg font-semibold mb-2", themeStyles.primaryText)}
        >
          {project.project_name}
        </Text>

        {/* Project Description */}
        {project.project_description && (
          <Text className={cn("text-sm mb-3", themeStyles.secondaryText)}>
            {project.project_description}
          </Text>
        )}

        {/* Links Section */}
        <View className="flex-row flex-wrap gap-3">
          {/* Devpost Link */}
          {project.devpost_link && (
            <Pressable
              onPress={() => {
                if (project.devpost_link) {
                  Linking.openURL(project.devpost_link);
                }
              }}
              className={cn(
                "px-4 py-2 rounded-lg",
                isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
              )}
              android_ripple={null}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isDark ? "text-black" : "text-white"
                )}
              >
                View on Devpost →
              </Text>
            </Pressable>
          )}

          {/* GitHub Link */}
          {project.github_link && (
            <Pressable
              onPress={() => {
                if (project.github_link) {
                  Linking.openURL(project.github_link);
                }
              }}
              className={cn(
                "px-4 py-2 rounded-lg border",
                isDark
                  ? "bg-neutral-700 border-neutral-600"
                  : "bg-gray-100 border-gray-300"
              )}
              android_ripple={null}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                className={cn("text-sm font-semibold", themeStyles.primaryText)}
              >
                GitHub →
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};
