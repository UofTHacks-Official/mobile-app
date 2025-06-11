import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type EventType = "networking" | "food" | "activity";

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onAddEvent: (event: {
    title: string;
    startTime: string;
    endTime: string;
    date: Date;
    type: EventType;
  }) => void;
  dates: Date[];
}

const TimeSelector = ({
  value,
  onChange,
}: {
  value: { hour: number; minute: number; isPM: boolean };
  onChange: (time: { hour: number; minute: number; isPM: boolean }) => void;
}) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View className="flex-row items-center space-x-2">
      {/* Hour Selection */}
      <ScrollView
        className="h-32 w-16 border border-gray-300 rounded-lg"
        showsVerticalScrollIndicator={false}
      >
        {hours.map((hour) => (
          <Pressable
            key={hour}
            onPress={() => onChange({ ...value, hour })}
            className={`py-2 px-3 ${
              value.hour === hour ? "bg-uoft_secondary_orange" : ""
            }`}
          >
            <Text
              className={`text-center font-pp ${
                value.hour === hour ? "text-white" : "text-gray-600"
              }`}
            >
              {hour}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text className="font-pp text-lg">:</Text>

      {/* Minute Selection */}
      <ScrollView
        className="h-32 w-16 border border-gray-300 rounded-lg"
        showsVerticalScrollIndicator={false}
      >
        {minutes.map((minute) => (
          <Pressable
            key={minute}
            onPress={() => onChange({ ...value, minute })}
            className={`py-2 px-3 ${
              value.minute === minute ? "bg-uoft_secondary_orange" : ""
            }`}
          >
            <Text
              className={`text-center font-pp ${
                value.minute === minute ? "text-white" : "text-gray-600"
              }`}
            >
              {minute.toString().padStart(2, "0")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* AM PM Selection */}
      <View className="border border-gray-300 rounded-lg">
        <Pressable
          onPress={() => onChange({ ...value, isPM: false })}
          className={`px-3 py-2 ${
            !value.isPM ? "bg-uoft_secondary_orange" : ""
          }`}
        >
          <Text
            className={`font-pp ${
              !value.isPM ? "text-white" : "text-gray-600"
            }`}
          >
            AM
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChange({ ...value, isPM: true })}
          className={`px-3 py-2 ${
            value.isPM ? "bg-uoft_secondary_orange" : ""
          }`}
        >
          <Text
            className={`font-pp ${value.isPM ? "text-white" : "text-gray-600"}`}
          >
            PM
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const EventModal = ({
  visible,
  onClose,
  onAddEvent,
  dates,
}: EventModalProps) => {
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [startTime, setStartTime] = useState({
    hour: 9,
    minute: 0,
    isPM: false,
  });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0, isPM: false });
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType>("activity");

  const formatTimeForStorage = (time: {
    hour: number;
    minute: number;
    isPM: boolean;
  }) => {
    let hours = time.hour;
    if (time.isPM && hours !== 12) {
      hours += 12;
    } else if (!time.isPM && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${time.minute
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTimeForDisplay = (time: {
    hour: number;
    minute: number;
    isPM: boolean;
  }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${
      time.isPM ? "PM" : "AM"
    }`;
  };

  const handleAddEvent = () => {
    onAddEvent({
      title,
      startTime: formatTimeForStorage(startTime),
      endTime: formatTimeForStorage(endTime),
      date: selectedDate,
      type: selectedType,
    });
    setTitle("");
    setStartTime({ hour: 9, minute: 0, isPM: false });
    setEndTime({ hour: 10, minute: 0, isPM: false });
    onClose();
  };

  const eventTypeColors = {
    networking: "#4A90E2", // Blue
    food: "#FF6F51", // Orange
    activity: "#50E3C2", // Teal
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-[90%] rounded-xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-['PPObjectSans-Heavy']">
              Add Event
            </Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="black" />
            </Pressable>
          </View>

          {/* Event Type Selection */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2 font-pp">Event Type</Text>
            <View className="flex-row gap-2">
              {(["networking", "food", "activity"] as EventType[]).map(
                (type) => (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedType(type)}
                    className={`flex-1 py-3 rounded-lg border ${
                      selectedType === type
                        ? "border-transparent"
                        : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor:
                        selectedType === type
                          ? eventTypeColors[type]
                          : "transparent",
                    }}
                  >
                    <Text
                      className={`text-center font-pp capitalize ${
                        selectedType === type ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {type}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          {/* Date Selection */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2 font-pp">Select Date</Text>
            <View className="flex-row gap-2">
              {dates.map((date, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedDate(date)}
                  className={`flex-1 py-3 rounded-lg border ${
                    selectedDate.toDateString() === date.toDateString()
                      ? "bg-uoft_secondary_orange border-uoft_secondary_orange"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-pp ${
                      selectedDate.toDateString() === date.toDateString()
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Event Title */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2 font-pp">Event Title</Text>
            <View className="border border-gray-300 rounded-lg p-3">
              <TextInput
                className="font-pp text-lg"
                placeholder="Enter event title"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Time Selection */}
          <View className="mb-6">
            <Text className="text-black font-bold text-md mb-2">Time</Text>
            <View className="space-y-4">
              {/* Start Time */}
              <View>
                <Text className="text-gray-600 mb-2 font-pp">Start Time</Text>
                <Pressable
                  onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                  className="border border-gray-300 rounded-lg p-3"
                >
                  <Text className="font-pp text-lg">
                    {formatTimeForDisplay(startTime)}
                  </Text>
                </Pressable>
                {showStartTimePicker && (
                  <View className="mt-2">
                    <TimeSelector
                      value={startTime}
                      onChange={(newTime) => {
                        setStartTime(newTime);
                        // If end time is before start time, update it
                        if (
                          (newTime.isPM && !endTime.isPM) ||
                          (newTime.isPM === endTime.isPM &&
                            (newTime.hour > endTime.hour ||
                              (newTime.hour === endTime.hour &&
                                newTime.minute > endTime.minute)))
                        ) {
                          setEndTime(newTime);
                        }
                      }}
                    />
                  </View>
                )}
              </View>

              {/* End Time */}
              <View>
                <Text className="text-gray-600 mb-2 font-pp pt-3">
                  End Time
                </Text>
                <Pressable
                  onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                  className="border border-gray-300 rounded-lg p-3"
                >
                  <Text className="font-pp text-lg">
                    {formatTimeForDisplay(endTime)}
                  </Text>
                </Pressable>
                {showEndTimePicker && (
                  <View className="mt-2">
                    <TimeSelector
                      value={endTime}
                      onChange={(newTime) => {
                        // Don't allow end time before start time
                        if (
                          (newTime.isPM && !startTime.isPM) ||
                          (newTime.isPM === startTime.isPM &&
                            (newTime.hour > startTime.hour ||
                              (newTime.hour === startTime.hour &&
                                newTime.minute >= startTime.minute)))
                        ) {
                          setEndTime(newTime);
                        }
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Add Event Button */}
          <Pressable
            className={`py-4 rounded-lg mt-4 ${
              title.trim() ? "bg-uoft_black" : "bg-gray-300"
            }`}
            onPress={handleAddEvent}
            disabled={!title.trim()}
          >
            <Text className="text-white text-center font-pp text-lg font-bold">
              Add Event
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default EventModal;
