import { StyleProp, Text, View, ViewStyle } from "react-native";

interface EventProps {
  title: string;
  startTime: string;
  endTime: string;
  hourHeight: number;
  style?: StyleProp<ViewStyle>;
}

const Event = ({ title, startTime, endTime, hourHeight, style }: EventProps) => {
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
      className="absolute bg-uoft_secondary_orange/20 border border-uoft_secondary_orange rounded-lg p-1.5"
      style={[
        { 
          height: height,
          top: topPosition,
          zIndex: 1, // Ensure events are above the time grid
        },
        style
      ]}
    >
      <Text className="text-xs font-pp text-uoft_black" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-[10px] text-uoft_black/60">
        {startTime} - {endTime}
      </Text>
    </View>
  );
};

export default Event; 