import { useTheme } from "@/context/themeContext";
import { getScheduleThemeStyles, cn } from "@/utils/theme";
import { Schedule } from "@/types/schedule";
import { LayoutChangeEvent, Text, View } from "react-native";
import EventComponent from "./Event";

interface TimeSlotProps {
  hour: number;
  isCurrentHour: boolean;
  schedules: Schedule[];
  hourHeight: number;
  onSchedulePress: (schedule: Schedule) => void;
  showTime?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
  // Add these props to handle global event positioning
  allSchedules?: Schedule[];
  startHour?: number;
  endHour?: number;
}

interface DayColumnProps {
  date: Date;
  currentHour: number;
  schedules: Schedule[];
  onSchedulePress: (schedule: Schedule) => void;
  showCurrentTimeIndicator?: boolean;
  currentMinute?: number;
  hourHeight?: number;
  showTimeLabels?: boolean;
}

const TimeSlot = ({
  hour,
  isCurrentHour,
  schedules,
  hourHeight,
  onSchedulePress,
  showTime = true,
  onLayout,
  allSchedules = schedules,
  startHour = 0,
  endHour = 24,
}: TimeSlotProps) => {
  const { isDark } = useTheme();
  const scheduleTheme = getScheduleThemeStyles(isDark);
  // Format hour to 12-hour format with AM/PM
  const formattedHour =
    hour === 0
      ? "12 AM"
      : hour === 12
      ? "12 PM"
      : hour > 12
      ? `${hour - 12} PM`
      : `${hour} AM`;

  function getEventRange(schedule: Schedule) {
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);
    let startMinutes = start.getHours() * 60 + start.getMinutes();
    let endMinutes = end.getHours() * 60 + end.getMinutes();
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;
    return { start: startMinutes, end: endMinutes };
  }

  // Only render events that START in this hour to avoid duplication
  const hourStart = hour * 60;
  const hourEnd = (hour + 1) * 60;
  const eventsStartingInThisHour = schedules.filter((schedule) => {
    const { start } = getEventRange(schedule);
    return start >= hourStart && start < hourEnd;
  });

  // For each event starting in this hour, find all events that overlap with it
  // across the entire day (not just this hour)
  function findOverlappingEvents(targetEvent: Schedule) {
    const targetRange = getEventRange(targetEvent);
    return allSchedules.filter((schedule) => {
      const range = getEventRange(schedule);
      return range.start < targetRange.end && targetRange.start < range.end;
    });
  }

  // Group overlapping events
  function groupOverlappingEvents(events: Schedule[]) {
    if (events.length === 0) return [];

    const groups: Schedule[][] = [];
    const processed: Set<string> = new Set();

    for (const event of events) {
      if (processed.has(event.id)) continue;

      const overlappingEvents = findOverlappingEvents(event);
      const group = overlappingEvents.sort((a, b) => {
        const aStart = getEventRange(a).start;
        const bStart = getEventRange(b).start;
        return aStart - bStart;
      });

      // Mark all events in this group as processed
      group.forEach((e) => processed.add(e.id));
      groups.push(group);
    }

    return groups;
  }

  const overlapGroups = groupOverlappingEvents(eventsStartingInThisHour);

  return (
    <View 
      className={cn(scheduleTheme.timeBlockBackground)}
      style={{ 
        height: hourHeight,
        borderBottomWidth: 1,
        borderBottomColor: scheduleTheme.lineColor
      }} 
      onLayout={onLayout}
    >
      <View className="flex-row h-full">
        {showTime && (
          <View className="w-12">
            <Text className={cn("text-xs ml-1 mt-1", scheduleTheme.timeText)}>
              {formattedHour}
            </Text>
          </View>
        )}
        <View className="flex-1 relative h-full">
          {overlapGroups.map((group, groupIdx) => {
            const eventWidth = 100 / group.length;

            return group.map((schedule, index) => {
              const { start, end } = getEventRange(schedule);

              const spacing = 4;

              // Calculate the full height of the event
              const eventDurationMinutes = end - start;
              const eventHeightPixels =
                (eventDurationMinutes / 60) * hourHeight - spacing;

              // Calculate the top position relative to the start of the day
              const eventStartHour = Math.floor(start / 60);
              const eventStartMinutes = start % 60;
              const topPositionFromDayStart =
                (eventStartHour - startHour) * hourHeight +
                (eventStartMinutes / 60) * hourHeight;

              // Calculate the top position relative to this hour
              const topPositionFromThisHour =
                topPositionFromDayStart -
                (hour - startHour) * hourHeight +
                spacing / 2;

              return (
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
                    left: `${eventWidth * index}%`,
                    top: topPositionFromThisHour,
                    height: eventHeightPixels,
                    position: "absolute",
                  }}
                />
              );
            });
          })}
        </View>
      </View>
    </View>
  );
};

export const DayColumn = ({
  currentHour,
  schedules,
  onSchedulePress,
  hourHeight = 100,
  showTimeLabels = false,
}: DayColumnProps) => {
  const { isDark } = useTheme();
  const scheduleTheme = getScheduleThemeStyles(isDark);
  
  return (
    <View 
      className="flex-1 relative"
      style={{
        borderRightWidth: 1,
        borderRightColor: scheduleTheme.lineColor
      }}
    >
      {Array.from({ length: 24 }, (_, i) => (
        <TimeSlot
          key={i}
          hour={i}
          isCurrentHour={i === currentHour}
          schedules={schedules}
          hourHeight={hourHeight}
          onSchedulePress={onSchedulePress}
          showTime={showTimeLabels}
          allSchedules={schedules}
        />
      ))}
    </View>
  );
};

export default TimeSlot;