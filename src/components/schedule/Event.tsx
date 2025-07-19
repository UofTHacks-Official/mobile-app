import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

type EventType = "networking" | "food" | "activity";

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

const eventTypeColors = {
  networking: {
    borderClass: "border-uoft_primary_blue",
    textClass: "text-uoft_primary_blue",
    backgroundColor: "bg-uoft_blue_light",
  },
  food: {
    borderClass: "border-uoft__orange",
    textClass: "text-uoft__orange",
    backgroundColor: "bg-uoft_orange_light",
  },
  activity: {
    borderClass: "border-uoft_accent_purple",
    textClass: "text-uoft_accent_purple",
    backgroundColor: "bg-uoft_purple_light",
  },
};

const Event = ({
  title,
  startTime,
  endTime,
  hourHeight,
  style,
  type,
  id,
  onPress,
}: EventProps) => {
  const formatTimeTo12Hour = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const colors = eventTypeColors[type];

  return (
    <Pressable
      onPress={handlePress}
      className={`absolute px-2 py-2 border-l-4 ${colors.borderClass} ${colors.backgroundColor}`}
      style={[
        {
          zIndex: 1,
          borderRadius: 4,
          paddingRight: 8,
          marginRight: 8,
        },
        style,
      ]}
    >
      <Text
        className={`font-pp text-xs font-semibold ${colors.textClass}`}
        numberOfLines={2}
        style={{
          minHeight: 32,
          lineHeight: 16,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default Event;
