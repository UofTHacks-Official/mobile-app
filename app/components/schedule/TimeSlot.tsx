import { Text, View } from "react-native";
import Event from "./Event";

type EventType = "networking" | "food" | "activity";

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  type: EventType;
}

interface TimeSlotProps {
  hour: number;
  isCurrentHour: boolean;
  events: Event[];
  hourHeight: number;
  onDeleteEvent: (eventId: string) => void;
  showTime?: boolean;
}

const TimeSlot = ({
  hour,
  isCurrentHour,
  events,
  hourHeight,
  onDeleteEvent,
  showTime = true,
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

  // Only show events that start in this hour
  const hourEvents = events.filter((event) => {
    const [startHour] = event.startTime.split(":").map(Number);
    return startHour === hour;
  });

  // If there are multiple events starting in this hour, they should be displayed side by side
  const shouldShareSpace = hourEvents.length > 1;
  const eventWidth = shouldShareSpace ? 100 / hourEvents.length : 100;

  return (
    <View className="h-16 border-b border-gray-200">
      <View className="flex-row h-full">
        {showTime && (
          <View className="w-12">
            <Text className="text-xs text-gray-500 ml-1 mt-1">
              {formattedHour}
            </Text>
          </View>
        )}
        <View className="flex-1 relative">
          {hourEvents.map((event, index) => (
            <Event
              key={event.id}
              id={event.id}
              title={event.title}
              startTime={event.startTime}
              endTime={event.endTime}
              hourHeight={hourHeight}
              type={event.type}
              onDelete={() => onDeleteEvent(event.id)}
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
