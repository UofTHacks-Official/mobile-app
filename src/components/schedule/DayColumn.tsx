import { useState } from "react";
import { View } from "react-native";
import { Schedule } from "../../_types/schedule";
import CurrentTimeIndicator from "./CurrentTimeIndicator";
import TimeSlot from "./TimeSlot";

interface DayColumnProps {
  date: Date;
  currentHour: number;
  schedules: Schedule[];
  onSchedulePress: (schedule: Schedule) => void;
  showCurrentTimeIndicator?: boolean;
  currentMinute?: number;
}

const DayColumn = ({
  date,
  currentHour,
  schedules,
  onSchedulePress,
  showCurrentTimeIndicator = false,
  currentMinute = 0,
}: DayColumnProps) => {
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  return (
    <View className="flex-1 border-r border-gray-200 relative">
      {Array.from({ length: 24 }, (_, i) => (
        <TimeSlot
          key={i}
          hour={i}
          isCurrentHour={i === currentHour}
          schedules={schedules}
          hourHeight={rowHeight ?? 42}
          onSchedulePress={onSchedulePress}
          showTime={false}
          onLayout={
            i === 0
              ? (e) => setRowHeight(e.nativeEvent.layout.height)
              : undefined
          }
        />
      ))}
      {showCurrentTimeIndicator && rowHeight && (
        <CurrentTimeIndicator
          currentHour={currentHour}
          currentMinute={currentMinute}
          firstHour={0}
          hourHeight={rowHeight}
        />
      )}
    </View>
  );
};

export default DayColumn;
