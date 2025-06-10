import { View } from "react-native";

interface CurrentTimeIndicatorProps {
  currentHour: number;
  currentMinute: number;
}

const CurrentTimeIndicator = ({
  currentHour,
  currentMinute,
}: CurrentTimeIndicatorProps) => {
  // Calculate position based on hour and minute
  // Each hour slot is 64px high
  // Subtract 1 from currentHour to align with the displayed time
  const topPosition = (currentHour - 1) * 64 + (currentMinute / 60) * 64;

  return (
    <View
      className="absolute left-0 right-0 flex-row items-center"
      style={{ top: topPosition + 12 }}
    >
      <View className="w-2 h-2 rounded-full bg-red-500" />
      <View className="flex-1 h-0.5 bg-red-500" />
    </View>
  );
};

export default CurrentTimeIndicator;
