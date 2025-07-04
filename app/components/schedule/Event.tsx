import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

type EventType = 'networking' | 'food' | 'activity';

interface EventProps {
  title: string;
  startTime: string;
  endTime: string;
  hourHeight: number;
  style?: StyleProp<ViewStyle>;
  type: EventType;
  id?: string;
  onPress?: () => void;
}

const eventTypeBgClass = {
  networking: 'bg-uoft_primary_blue',
  food: 'bg-uoft_secondary_orange',
  activity: 'bg-uoft_accent_purple',
};

const Event = ({ title, startTime, endTime, hourHeight, style, type, id, onPress }: EventProps) => {
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
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      className={`absolute rounded-lg px-2 py-1 ${eventTypeBgClass[type]}`}
      style={[
        {
          zIndex: 1,
        },
        style
      ]}
    >
      <Text
        className="text-white font-pp text-sm"
        numberOfLines={2}
        style={{ minHeight: 32, lineHeight: 16 }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default Event;