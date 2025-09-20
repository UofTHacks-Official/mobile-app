import React from "react";
import { View, Text } from "react-native";

interface CurrentTimeIndicatorProps {
  currentTime: Date;
  currentHour: number;
  currentMinute: number;
  hourHeight: number;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({
  currentTime,
  currentHour,
  currentMinute,
  hourHeight,
}) => {
  return (
    <View
      className="absolute"
      style={{
        top: (currentHour + currentMinute / 60) * hourHeight - 2,
        zIndex: 50,
        left: 0,
        right: 0,
        height: 0,
      }}
    >
      {/* Time label positioned independently */}
      <View
        className="absolute w-12 flex-row justify-center"
        style={{ top: -8 }}
      >
        <View className="bg-red-500 px-1 py-1 rounded">
          <Text className="text-white font-medium" style={{ fontSize: 8 }}>
            {currentTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>
      </View>

      {/* Red line indicator align */}
      <View
        className="absolute flex-row items-center"
        style={{ top: 0, left: 0, right: 0 }}
      >
        <View className="w-12" />
        <View className="flex-1 h-0.5 bg-red-500" />
      </View>
    </View>
  );
};

export default CurrentTimeIndicator;
