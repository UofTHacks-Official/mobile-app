import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { BlurView } from "expo-blur";
import { View, Text, Pressable } from "react-native";

interface NotificationCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  timestamp?: string;
  onPress?: () => void;
}

export const NotificationCard = ({
  icon,
  title,
  body,
  timestamp,
  onPress,
}: NotificationCardProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const Content = () => (
    <BlurView
      intensity={80}
      tint={isDark ? "dark" : "light"}
      className="overflow-hidden rounded-2xl h-20 w-full"
    >
      <View className="flex-row items-center px-4 py-4 bg-black/30 h-full">
        {/* Icon Container */}
        <View className="mr-3 w-12 h-12 items-center justify-center overflow-hidden">
          {icon}
        </View>

        {/* Content Container */}
        <View className="flex-1">
          <Text
            className="text-lg font-onest-bold mb-1 text-white"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            className="text-sm font-opensans text-gray-300"
            numberOfLines={1}
          >
            {body}
          </Text>
        </View>

        {/* Timestamp */}
        {timestamp && (
          <View className="ml-3">
            <Text className="text-xs font-opensans text-gray-400">
              {timestamp}
            </Text>
          </View>
        )}
      </View>
    </BlurView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Content />
      </Pressable>
    );
  }

  return <Content />;
};
