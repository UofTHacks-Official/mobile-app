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
      className="flex-1 items-center justify-center bg-uoft_light_grey rounded-lg m-1"
      style={{ minHeight: 60 }}
    >
      <Text className="text-2xl font-pp text-gravel">{key}</Text>
    </Pressable>
  );

  const renderPresetKey = (amount: string) => (
    <Pressable
      onPress={() => onPresetAmount(amount)}
      className="flex-1 items-center justify-center bg-uoft_light_grey rounded-lg m-1"
      style={{ minHeight: 40 }}
    >
      <Text className="text-xl font-pp text-clementine">{amount}</Text>
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
      <View className="h-[1px] bg-black/10 my-1" />
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
          className="flex-1 items-center justify-center bg-uoft_light_grey rounded-lg m-1"
          style={{ minHeight: 60 }}
        >
          <Feather name="chevron-left" size={24} />
        </Pressable>
      </View>
    </View>
  );
};

export default NumericKeypad;
