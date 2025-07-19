import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onPresetAmount: (amount: string) => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onDelete,
  onPresetAmount,
}) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onKeyPress(key);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete();
  };

  const renderKey = (key: string) => (
    <Pressable
      onPress={() => handleKeyPress(key)}
      className={cn(
        "flex-1 items-center justify-center rounded-lg m-1",
        themeStyles.hackerBucksKeyboard
      )}
      style={{ minHeight: 60 }}
    >
      <Text className={cn("text-2xl font-pp", themeStyles.primaryText)}>
        {key}
      </Text>
    </Pressable>
  );

  const renderPresetKey = (amount: string) => (
    <Pressable
      onPress={() => onPresetAmount(amount)}
      className={cn(
        "flex-1 items-center justify-center rounded-lg m-1",
        themeStyles.lightCardBackground
      )}
      style={{ minHeight: 40 }}
    >
      <Text
        className={cn(
          "text-xl font-pp",
          isDark ? "text-white" : "text-orange-600"
        )}
      >
        {amount}
      </Text>
    </Pressable>
  );

  return (
    <View>
      <View className="flex-row">
        {renderPresetKey("10")}
        {renderPresetKey("25")}
        {renderPresetKey("50")}
        {renderPresetKey("100")}
      </View>
      <View
        className="h-[1px] my-1"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        }}
      />
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
            "flex-1 items-center justify-center rounded-lg m-1",
            themeStyles.lightCardBackground
          )}
          style={{ minHeight: 60 }}
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
