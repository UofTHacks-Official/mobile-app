import { useTheme } from "@/context/themeContext";
import { Schedule } from "@/types/schedule";
import { cn, getScheduleThemeStyles } from "@/utils/theme";
import { LayoutChangeEvent, Text, View } from "react-native";
import EventComponent from "./Event";

interface TimeSlotProps {
  hour: number;
  isCurrentHour?: boolean;
  hourHeight: number;
  showTime?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
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
  startHour?: number;
  endHour?: number;
}

const TimeSlot = ({
  hour,
  isCurrentHour,
  hourHeight,
  showTime = true,
  onLayout,
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

  return (
    <View
      className={cn(
        scheduleTheme.timeBlockBackground,
        isCurrentHour && (isDark ? "bg-blue-900/10" : "bg-blue-50")
      )}
      style={{
        height: hourHeight,
        borderBottomWidth: 1,
        borderBottomColor: scheduleTheme.lineColor,
      }}
      onLayout={onLayout}
    >
      <View className="flex-row h-full">
        {showTime && (
          <View className="w-12">
            <Text
              className={cn(
                "text-xs ml-1 mt-1",
                isCurrentHour
                  ? "text-blue-600 font-bold"
                  : scheduleTheme.timeText
              )}
            >
              {formattedHour}
            </Text>
          </View>
        )}
        <View className="flex-1 relative h-full" />
      </View>
    </View>
  );
};

function getEventRange(schedule: Schedule) {
  const start = new Date(schedule.startTime);
  const end = new Date(schedule.endTime);
  let startMinutes = start.getHours() * 60 + start.getMinutes();
  let endMinutes = end.getHours() * 60 + end.getMinutes();
  // Handle events that cross midnight
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return { start: startMinutes, end: endMinutes };
}

export const DayColumn = ({
  currentHour,
  schedules,
  onSchedulePress,
  hourHeight = 100,
  showTimeLabels = false,
  startHour = 0,
  endHour = 24,
}: DayColumnProps) => {
  const { isDark } = useTheme();
  const scheduleTheme = getScheduleThemeStyles(isDark);

  // Calculate number of hours to display
  const hoursToDisplay = endHour - startHour;

  // Group events into clusters of overlaps (connected components)
  const clusters: Schedule[][] = [];
  const processed = new Set<string>();

  const sortedSchedules = [...schedules].sort((a, b) => {
    const aRange = getEventRange(a);
    const bRange = getEventRange(b);
    return aRange.start - bRange.start;
  });

  for (const schedule of sortedSchedules) {
    if (processed.has(schedule.id.toString())) continue;

    const cluster: Schedule[] = [];
    const stack = [schedule];
    processed.add(schedule.id.toString());

    while (stack.length > 0) {
      const current = stack.pop()!;
      cluster.push(current);
      const currentRange = getEventRange(current);

      for (const other of sortedSchedules) {
        if (processed.has(other.id.toString())) continue;
        const otherRange = getEventRange(other);

        // Check if overlaps
        if (
          currentRange.start < otherRange.end &&
          otherRange.start < currentRange.end
        ) {
          processed.add(other.id.toString());
          stack.push(other);
        }
      }
    }
    clusters.push(cluster);
  }

  return (
    <View
      className="flex-1 relative"
      style={{
        borderRightWidth: 1,
        borderRightColor: scheduleTheme.lineColor,
      }}
    >
      {/* Grid Lines */}
      {Array.from({ length: hoursToDisplay }, (_, i) => {
        const hour = startHour + i;
        return (
          <TimeSlot
            key={hour}
            hour={hour}
            isCurrentHour={hour === currentHour}
            hourHeight={hourHeight}
            showTime={showTimeLabels}
          />
        );
      })}

      {/* Events Layer */}
      <View
        className="absolute top-0 right-0 left-0 bottom-0"
        style={{ marginLeft: showTimeLabels ? 48 : 0 }}
      >
        {clusters.map((cluster, clusterIdx) => {
          // Sort cluster by start time
          cluster.sort(
            (a, b) => getEventRange(a).start - getEventRange(b).start
          );

          // Assign columns to events in the cluster
          const columns: Schedule[][] = [];
          const eventToColumn = new Map<string, number>();

          for (const ev of cluster) {
            const evRange = getEventRange(ev);
            let placed = false;

            for (let i = 0; i < columns.length; i++) {
              const lastInCol = columns[i][columns[i].length - 1];
              if (getEventRange(lastInCol).end <= evRange.start) {
                columns[i].push(ev);
                eventToColumn.set(ev.id.toString(), i);
                placed = true;
                break;
              }
            }

            if (!placed) {
              eventToColumn.set(ev.id.toString(), columns.length);
              columns.push([ev]);
            }
          }

          const numCols = columns.length;
          const eventWidth = 100 / numCols;

          return cluster.map((schedule) => {
            const { start, end } = getEventRange(schedule);
            const colIndex = eventToColumn.get(schedule.id.toString()) || 0;

            const spacing = 4;
            const eventDurationMinutes = end - start;
            const eventHeightPixels =
              (eventDurationMinutes / 60) * hourHeight - spacing;

            const topPosition =
              (start / 60 - startHour) * hourHeight + spacing / 2;

            return (
              <EventComponent
                key={schedule.id}
                id={schedule.id.toString()}
                title={schedule.title}
                startTime={schedule.startTime}
                endTime={schedule.endTime}
                hourHeight={hourHeight}
                type={schedule.type}
                onPress={() => onSchedulePress(schedule)}
                style={{
                  width: `${eventWidth - 1}%`, // Small gap
                  left: `${eventWidth * colIndex}%`,
                  top: topPosition,
                  height: eventHeightPixels,
                  position: "absolute",
                  zIndex: 2,
                }}
              />
            );
          });
        })}
      </View>
    </View>
  );
};

export default TimeSlot;
