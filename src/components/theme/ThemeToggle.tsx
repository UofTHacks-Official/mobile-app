import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Monitor, Moon, PaintBucket, Sun } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { theme, setTheme, isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const themes = [
    { id: "light" as const, icon: Sun, label: "Light" },
    { id: "dark" as const, icon: Moon, label: "Dark" },
    { id: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <View className={cn(className)}>
      <View className="flex-row items-center gap-2 mb-3">
        <PaintBucket size={20} color={themeStyles.iconColor} />
        <Text
          className={cn(
            "font-bold text-base",
            themeStyles.textPrimaryBold,
            themeStyles.primaryText
          )}
        >
          Theme
        </Text>
      </View>

      <View
        className={cn(
          "flex-row gap-2 p-2 rounded-md",
          themeStyles.lightCardBackground
        )}
      >
        {themes.map(({ id, icon: Icon, label }) => {
          const isSelected = theme === id;
          return (
            <Pressable
              key={id}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-md",
                isSelected
                  ? isDark
                    ? "bg-[#75EDEF]"
                    : themeStyles.toggleButtonSelected
                  : themeStyles.toggleButtonBackground
              )}
              onPress={() => setTheme(id)}
              android_ripple={null}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon
                size={16}
                color={isSelected ? "black" : isDark ? "white" : "black"}
              />
              <Text
                className={cn(
                  "font-opensans-medium text-sm",
                  isSelected
                    ? "text-black"
                    : isDark
                      ? "text-white"
                      : "text-black"
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
