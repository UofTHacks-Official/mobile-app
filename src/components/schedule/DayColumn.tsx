import { Schedule } from "@/types/schedule";
import { useState } from "react";
import { View } from "react-native";
import TimeSlot from "./TimeSlot";

interface DayColumnProps {
  date: Date;
  currentHour: number;
  schedules: Schedule[];
  onSchedulePress: (schedule: Schedule) => void;
  showCurrentTimeIndicator?: boolean;
  currentMinute?: number;
  hourHeight?: number;
}

const DayColumn = ({
  currentHour,
  schedules,
  onSchedulePress,
  hourHeight = 48,
}: DayColumnProps) => {

  return (
    <View className="flex-1 border-r border-gray-200 relative">
      {Array.from({ length: 24 }, (_, i) => (
        <TimeSlot
          key={i}
          hour={i}
          isCurrentHour={i === currentHour}
          schedules={schedules}
          hourHeight={hourHeight}
          onSchedulePress={onSchedulePress}
          showTime={false}
        />
      ))}
    </View>
  );
};

export default DayColumn;