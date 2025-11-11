import { useTheme } from "@/context/themeContext";
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

  const Content = () => (
    <View
      className="overflow-hidden rounded-2xl h-20 w-full"
      style={{
        backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center px-4 py-4 h-full">
        {/* Icon Container */}
        <View className="mr-3 w-12 h-12 items-center justify-center overflow-hidden">
          {icon}
        </View>

        {/* Content Container */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className={`text-sm font-semibold flex-1 ${isDark ? "text-white" : "text-black"}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            {/* Timestamp */}
            {timestamp && (
              <Text
                className={`text-xs ml-2 ${isDark ? "text-gray-400" : "text-gray-400"}`}
              >
                {timestamp}
              </Text>
            )}
          </View>
          <Text
            className={`text-xs ${isDark ? "text-gray-300" : "text-gray-500"}`}
            numberOfLines={1}
          >
            {body}
          </Text>
        </View>
      </View>
    </View>
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
