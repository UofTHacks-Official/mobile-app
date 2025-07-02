import { LayoutChangeEvent, Text, View } from "react-native";
import { Schedule } from "../../_types/schedule";
import EventComponent from "./Event";

interface TimeSlotProps {
  hour: number;
  isCurrentHour: boolean;
  schedules: Schedule[];
  hourHeight: number;
  onSchedulePress: (schedule: Schedule) => void;
  showTime?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const TimeSlot = ({
  hour,
  isCurrentHour,
  schedules,
  hourHeight,
  onSchedulePress,
  showTime = true,
  onLayout,
}: TimeSlotProps) => {
  // Format hour to 12-hour format with AM/PM
  const formattedHour =
    hour === 0
      ? "12 AM"
      : hour === 12
      ? "12 PM"
      : hour > 12
      ? `${hour - 12} PM`
      : `${hour} AM`;

  // Only show schedules that start in this hour
  const hourSchedules = schedules.filter((schedule) => {
    const startHour = new Date(schedule.startTime).getHours();
    return startHour === hour;
  });

  // If there are multiple schedules starting in this hour, they should be displayed side by side
  const shouldShareSpace = hourSchedules.length > 1;
  const eventWidth = shouldShareSpace ? 100 / hourSchedules.length : 100;

  return (
    <View 
      className="h-12 border-b border-gray-200"
      onLayout={onLayout}
    >
      <View className="flex-row h-full">
        {showTime && (
          <View className="w-12">
            <Text className="text-xs text-gray-500 ml-1 mt-1">
              {formattedHour}
            </Text>
          </View>
        )}
        <View className="flex-1 relative">
          {hourSchedules.map((schedule, index) => (
            <EventComponent
              key={schedule.id}
              id={schedule.id}
              title={schedule.title}
              startTime={schedule.startTime}
              endTime={schedule.endTime}
              hourHeight={hourHeight}
              type={schedule.type}
              onPress={() => onSchedulePress(schedule)}
              style={{
                width: `${eventWidth}%`,
                left: shouldShareSpace ? `${eventWidth * index}%` : "0%",
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default TimeSlot;
