import { View } from "react-native";

interface CurrentTimeIndicatorProps {
  currentHour: number;
  currentMinute: number;
  hourHeight: number;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
  firstHour?: number;
}

const CurrentTimeIndicator = ({
  currentHour,
  currentMinute,
  hourHeight,
  pointerEvents,
  firstHour = 0,
}: CurrentTimeIndicatorProps) => {
  // Calculate position based on hour and minute, relative to first visible hour
  const topPosition = (currentHour - firstHour + currentMinute / 60) * hourHeight;

  return (
    <View
      className="absolute left-0 right-0 flex-row items-center"
      style={{ top: topPosition, zIndex: 50 }}
      pointerEvents={pointerEvents}
    >
      <View className="w-2 h-2 rounded-full bg-red-500" />
      <View className="flex-1 h-0.5 bg-red-500" />
    </View>
  );
};

export default CurrentTimeIndicator;
