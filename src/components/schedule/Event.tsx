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
  id?: string,
  onPress?: () => void;
}

const eventTypeBgClass = {
  networking: 'bg-uoft_primary_blue',
  food: 'bg-uoft_secondary_orange',
  activity: 'bg-uoft_accent_purple',
};

const Event = ({ title, startTime, endTime, hourHeight, style, type, onDelete, id, onPress }: EventProps) => {
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

  const formatTimeTo12Hour = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
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
      className={`absolute rounded-lg p-2 ${eventTypeBgClass[type]}`}
      style={[
        { 
          height: height,
          top: topPosition,
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