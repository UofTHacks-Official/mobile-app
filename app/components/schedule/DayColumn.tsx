import { View } from "react-native";
import { Schedule } from "../../types/schedule";
import TimeSlot from "./TimeSlot";

interface DayColumnProps {
  date: Date;
  currentHour: number;
  schedules: Schedule[];
  onDeleteSchedule: (scheduleId: string) => void;
  onSchedulePress: (schedule: Schedule) => void;
}

const DayColumn = ({
  date,
  currentHour,
  schedules,
  onDeleteSchedule,
  onSchedulePress,
}: DayColumnProps) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const hourHeight = 48;

  return (
    <View className="flex-1 border-r border-gray-200">
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
    </View>
  );
};

export default DayColumn;
