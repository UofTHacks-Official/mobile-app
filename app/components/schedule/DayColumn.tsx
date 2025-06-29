import { View } from "react-native";
import { Schedule } from "../../types/schedule";
import CurrentTimeIndicator from "./CurrentTimeIndicator";
import TimeSlot from "./TimeSlot";

interface DayColumnProps {
  date: Date;
  currentHour: number;
  schedules: Schedule[];
  onDeleteSchedule: (scheduleId: string) => void;
  onSchedulePress: (schedule: Schedule) => void;
  showCurrentTimeIndicator?: boolean;
  currentMinute?: number;
}

const DayColumn = ({
  date,
  currentHour,
  schedules,
  onDeleteSchedule,
  onSchedulePress,
  showCurrentTimeIndicator = false,
  currentMinute = 0,
}: DayColumnProps) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const hourHeight = 48;

  return (
    <View className="flex-1 border-r border-gray-200 relative">
      {Array.from({ length: 24 }, (_, i) => (
        <TimeSlot
          key={i}
          hour={i}
          isCurrentHour={i === currentHour}
          schedules={schedules}
          hourHeight={hourHeight}
          onDeleteSchedule={onDeleteSchedule}
          onSchedulePress={onSchedulePress}
          showTime={false}
        />
      ))}
      {showCurrentTimeIndicator && (
        <CurrentTimeIndicator currentHour={currentHour} currentMinute={currentMinute} />
      )}
    </View>
  );
};

export default DayColumn;
