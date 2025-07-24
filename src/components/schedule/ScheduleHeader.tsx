import { useTheme } from "@/context/themeContext";
import { getScheduleThemeStyles, cn } from "@/utils/theme";
import { ListFilter } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ScheduleHeaderProps {
  dates: Date[];
  currentDate: Date;
  onFilterPress: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  dates,
  currentDate,
  onFilterPress,
}) => {
  const { isDark } = useTheme();
  const scheduleTheme = getScheduleThemeStyles(isDark);
  
  return (
    <>
      {/* Main Header */}
      <View className={cn("px-4 py-3 flex-row items-center justify-between", scheduleTheme.headerBackground)}>
        <View className="flex-row items-center">
          <Pressable onPress={onFilterPress} className="ml-2 mr-4">
            <ListFilter size={24} color={scheduleTheme.iconColor} />
          </Pressable>
          <Text className={cn("text-3xl font-bold", scheduleTheme.headerText)}>
            {dates[0].toLocaleDateString("en-US", { month: "long" })}
          </Text>
        </View>
      </View>

      {/* Date Tabs */}
      <View 
        className={cn("flex-row h-16", scheduleTheme.headerBackground)}
        style={{ borderBottomWidth: 1, borderBottomColor: scheduleTheme.lineColor }}
      >
        <View 
          className={cn("w-12 h-16", scheduleTheme.headerBackground)}
          style={{ borderBottomWidth: 1, borderBottomColor: scheduleTheme.lineColor }}
        />
        {dates.map((date, index) => {
          const isCurrentDate =
            date.getFullYear() === currentDate.getFullYear() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getDate() === currentDate.getDate();

          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dayNumber = date.getDate();

          return (
            <View
              key={index}
              className="flex-1 items-center justify-center px-6"
            >
              <Text className={cn("text-sm mb-1", scheduleTheme.secondaryText)}>{dayName}</Text>
              <View
                className={cn(
                  "w-8 h-8 rounded items-center justify-center",
                  isCurrentDate ? "bg-uoft_accent_red" : ""
                )}
              >
                <Text
                  className={cn(
                    "text-lg font-semibold",
                    isCurrentDate ? "text-white" : scheduleTheme.primaryText
                  )}
                >
                  {dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
};

export default ScheduleHeader;
