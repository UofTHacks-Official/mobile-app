import { Alert, Pressable, StyleProp, Text, ViewStyle } from "react-native";

type EventType = 'networking' | 'food' | 'activity';

interface EventProps {
  title: string;
  startTime: string;
  endTime: string;
  hourHeight: number;
  style?: StyleProp<ViewStyle>;
  type: EventType;
  onDelete?: () => void;
  id?: string; // Adding id for future API integration
}

const eventTypeColors = {
  networking: '#4A90E2', // Blue
  food: '#FF6F51',      // Orange
  activity: '#50E3C2',  // Teal
};

const Event = ({ title, startTime, endTime, hourHeight, style, type, onDelete, id }: EventProps) => {
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

  const formatTimeTo12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handlePress = () => {
    if (onDelete) {
      Alert.alert(
        "Delete Event",
        `Are you sure you want to delete "${title}"?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: onDelete,
            style: "destructive"
          }
        ]
      );
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
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
        {formatTimeTo12Hour(startTime)} - {formatTimeTo12Hour(endTime)}
      </Text>
    </Pressable>
  );
};

export default Event; 