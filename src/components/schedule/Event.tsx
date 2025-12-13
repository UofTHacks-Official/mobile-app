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
  startTime: _startTime,
  endTime: _endTime,
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

  const colors = eventTypeColors[type];

  return (
    <Pressable
      onPress={handlePress}
      className={`absolute px-1 py-1 border-l-4 ${colors.borderClass} ${colors.backgroundColor}`}
      style={[
        {
          zIndex: 1,
          borderRadius: 4,
          paddingRight: 4,
          marginRight: 8,
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        className={`font-pp text-xs font-semibold ${colors.textClass}`}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default Event;
