import { View, Text, Pressable, Linking } from "react-native";
import { Users, Github, Linkedin, Twitter, Globe } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import {
  formatGitHubUrl,
  formatLinkedInUrl,
  formatXUrl,
  normalizeUrl,
} from "@/utils/profile";

interface ProfileSocialsProps {
  hacker: HackerProfile;
}

interface SocialLinkProps {
  icon: React.ReactNode;
  label: string;
  url: string;
  isDark: boolean;
  themeStyles: any;
}

const SocialLink = ({
  icon,
  label,
  url,
  isDark,
  themeStyles,
}: SocialLinkProps) => {
  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <Pressable onPress={handlePress} className="flex-row items-center mb-3">
      <View className="mr-3">{icon}</View>
      <Text
        className={cn("text-base hover:underline", themeStyles.primaryText)}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const ProfileSocials = ({ hacker }: ProfileSocialsProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const iconColor = isDark ? "#75EDEF" : "#132B38";
  const iconSize = 20;

  // Check if any social links exist
  const hasSocials =
    hacker.github_url ||
    hacker.linkedin_url ||
    hacker.x_url ||
    hacker.portfolio_url;

  if (!hasSocials) {
    return null;
  }

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="mr-3">
          <Users size={20} color={iconColor} />
        </View>
        <Text
          className={cn(
            "text-lg font-semibold uppercase",
            themeStyles.primaryText
          )}
        >
          Socials
        </Text>
      </View>

      {/* Social Links Container */}
      <View
        className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-neutral-800" : "bg-neutral-100"
        )}
      >
        {hacker.github_url && (
          <SocialLink
            icon={<Github size={iconSize} color={iconColor} />}
            label={formatGitHubUrl(hacker.github_url).username}
            url={formatGitHubUrl(hacker.github_url).url}
            isDark={isDark}
            themeStyles={themeStyles}
          />
        )}

        {hacker.linkedin_url && (
          <SocialLink
            icon={<Linkedin size={iconSize} color={iconColor} />}
            label={formatLinkedInUrl(hacker.linkedin_url).username}
            url={formatLinkedInUrl(hacker.linkedin_url).url}
            isDark={isDark}
            themeStyles={themeStyles}
          />
        )}

        {hacker.x_url && (
          <SocialLink
            icon={<Twitter size={iconSize} color={iconColor} />}
            label={formatXUrl(hacker.x_url).username}
            url={formatXUrl(hacker.x_url).url}
            isDark={isDark}
            themeStyles={themeStyles}
          />
        )}

        {hacker.portfolio_url && (
          <SocialLink
            icon={<Globe size={iconSize} color={iconColor} />}
            label={hacker.portfolio_url}
            url={normalizeUrl(hacker.portfolio_url)}
            isDark={isDark}
            themeStyles={themeStyles}
          />
        )}
      </View>
    </View>
  );
};
