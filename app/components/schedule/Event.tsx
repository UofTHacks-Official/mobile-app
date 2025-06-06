import { StyleProp, Text, View, ViewStyle } from "react-native";

type EventType = 'networking' | 'food' | 'activity';

interface EventProps {
  title: string;
  startTime: string;
  endTime: string;
  hourHeight: number;
  style?: StyleProp<ViewStyle>;
  type: EventType;
}

const eventTypeColors = {
  networking: '#4A90E2', // Blue
  food: '#FF6F51',      // Orange
  activity: '#50E3C2',  // Teal
};

const Event = ({ title, startTime, endTime, hourHeight, style, type }: EventProps) => {
  // Convert times to minutes for calculation
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Calculate duration in minutes
  const durationMinutes = endMinutes - startMinutes;
  
  // Calculate height based on duration (hourHeight is in pixels)
  const height = (durationMinutes / 60) * hourHeight;
  
  // Calculate top position based on start time
  const topPosition = (startMinute / 60) * hourHeight;

  return (
    <View 
      className="absolute rounded-lg p-2"
      style={[
        { 
          height: height,
          top: topPosition,
          backgroundColor: eventTypeColors[type],
          zIndex: 1, // Ensure events are above the time grid
        },
        style
      ]}
    >
      <Text className="text-white font-pp text-sm" numberOfLines={2}>
        {title}
      </Text>
      <Text className="text-white/80 font-pp text-xs">
        {startTime} - {endTime}
      </Text>
    </View>
  );
};

export default Event; 