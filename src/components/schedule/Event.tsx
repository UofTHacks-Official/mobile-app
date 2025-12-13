import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";

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
    borderClass: "border-blue-600",
    textClass: "text-blue-800",
    backgroundColor: "bg-blue-100",
  },
  food: {
    borderClass: "border-orange-600",
    textClass: "text-orange-800",
    backgroundColor: "bg-orange-100",
  },
  activity: {
    borderClass: "border-pink-400",
    textClass: "text-pink-600",
    backgroundColor: "bg-pink-100",
  },
};

const Event = ({
  title,
  startTime,
  endTime,
  hourHeight: _hourHeight,
  style,
  type,
  id: _id,
  onPress,
}: EventProps) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;
  const colors = eventTypeColors[type];

  return (
    <Pressable
      onPress={handlePress}
      className={`absolute border-l-4 ${colors.borderClass} ${colors.backgroundColor}`}
      style={[
        {
          zIndex: 1,
          borderRadius: 4,
          paddingRight: 4,
          marginRight: 8,
          justifyContent: "flex-start",
          paddingTop: 10,
          paddingBottom: 4,
          paddingLeft: 5,
        },
        style,
      ]}
    >
      <View>
        <Text
          className={`font-pp text-xs font-semibold ${colors.textClass}`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          className={`font-pp text-[9px] ${colors.textClass} mt-0.5`}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ opacity: 0.8 }}
        >
          {timeRange}
        </Text>
      </View>
    </Pressable>
  );
};

export default Event;
