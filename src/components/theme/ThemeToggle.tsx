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
    <View
      className={cn(
        themeStyles.cardStyle,
        themeStyles.cardBackground,
        className
      )}
    >
      <View className="flex-row gap-2">
        <PaintBucket color={cn(themeStyles.iconColor)} />
        <Text
          className={cn(
            themeStyles.textPrimaryBold,
            "mb-4",
            themeStyles.cardText
          )}
        >
          Theme
        </Text>
      </View>

      <View className="flex-row gap-2">
        {themes.map(({ id, icon: Icon, label }) => {
          const isSelected = theme === id;
          return (
            <Pressable
              key={id}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-md",
                isSelected
                  ? themeStyles.toggleButtonSelected
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
                color={isSelected ? "#000" : themeStyles.iconColor}
              />
              <Text
                className={cn(
                  "font-opensans-medium text-sm",
                  isSelected
                    ? themeStyles.toggleButtonSelectedText
                    : themeStyles.toggleButtonText
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
