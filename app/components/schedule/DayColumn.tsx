import { Text, View } from "react-native";
import TimeSlot from "./TimeSlot";

interface Event {
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
}

interface DayColumnProps {
  date: Date;
  currentHour: number;
  events: Event[];
}

const DayColumn = ({ date, currentHour, events }: DayColumnProps) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const hourHeight = 64;

  return (
    <View className="flex-1 border-r border-gray-200">
      <View className="h-12 border-b border-gray-200 bg-gray-50 items-center justify-center">
        <Text className="font-semibold">{formattedDate}</Text>
      </View>
      {Array.from({ length: 24 }, (_, i) => (
        <TimeSlot 
          key={i} 
          hour={i} 
          isCurrentHour={i === currentHour}
          events={events}
          hourHeight={hourHeight}
        />
      ))}
    </View>
  );
};

export default DayColumn; 