import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onDelete,
}) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    onKeyPress(key);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    onDelete();
  };

  const renderKey = (key: string) => (
    <Pressable
      onPress={() => handleKeyPress(key)}
      className={cn(
        "flex-1 items-center justify-center rounded-2xl m-1",
        isDark ? "bg-[#2E2E2E]" : "bg-[#F1F1F1]"
      )}
      style={{ minHeight: 58 }}
    >
      <Text className={cn("text-2xl font-onest-bold", themeStyles.primaryText)}>
        {key}
      </Text>
    </Pressable>
  );

  return (
    <View className="mt-2">
      <View className="flex-row">
        {renderKey("1")}
        {renderKey("2")}
        {renderKey("3")}
      </View>
      <View className="flex-row">
        {renderKey("4")}
        {renderKey("5")}
        {renderKey("6")}
      </View>
      <View className="flex-row">
        {renderKey("7")}
        {renderKey("8")}
        {renderKey("9")}
      </View>
      <View className="flex-row">
        {renderKey(".")}
        {renderKey("0")}
        <Pressable
          onPress={handleDelete}
          className={cn(
            "flex-1 items-center justify-center rounded-2xl m-1",
            isDark ? "bg-[#2E2E2E]" : "bg-[#F1F1F1]"
          )}
          style={{ minHeight: 58 }}
        >
          <Feather
            name="chevron-left"
            size={24}
            color={themeStyles.iconColor}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default NumericKeypad;
