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
  // Each hour slot is 48px high
  const topPosition = currentHour * 48 + (currentMinute / 60) * 48 - 48 * 1.3;
  // had to manually adjust the top position (- 48 * 1.3) to account for the header (not sure why) can look into this later

  return (
    <View
      className="absolute left-0 right-0 flex-row items-center"
      style={{ top: topPosition }}
    >
      <View className="w-2 h-2 rounded-full bg-red-500" />
      <View className="flex-1 h-0.5 bg-red-500" />
    </View>
  );
};

export default CurrentTimeIndicator;
