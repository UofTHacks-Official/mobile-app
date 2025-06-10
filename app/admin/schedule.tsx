import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toZonedTime } from "date-fns-tz";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import CurrentTimeIndicator from "../components/schedule/CurrentTimeIndicator";
import DayColumn from "../components/schedule/DayColumn";
import EventModal from "../components/schedule/EventModal";
import TimeSlot from "../components/schedule/TimeSlot";

type EventType = "networking" | "food" | "activity";

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  type: EventType;
}

const Schedule = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Jan 9, 10, 11 (tentative dates)
  const dates = [
    new Date(2026, 0, 9),
    new Date(2026, 0, 10),
    new Date(2026, 0, 11),
  ];

  useEffect(() => {
    const updateTime = () => {
      // Get the current time in America/Toronto timezone
      const now = new Date();
      const estTime = toZonedTime(now, "America/Toronto");
      setCurrentTime(estTime);
      console.log(estTime);
    };

    updateTime();

    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddEvent = (event: Omit<Event, "id">) => {
    const newEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  // Use device time to get the current hour and minute
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black">
        <View className="flex-row items-center mt-6 mb-6 px-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text className="text-2xl font-['PPObjectSans-Heavy']">Schedule</Text>
        </View>

        <View className="absolute bottom-5 right-5 z-10 bg-[#FF6F51] rounded-full p-2">
          <Pressable
            onPress={() => setIsModalVisible(true)}
            className="ml-auto"
          >
            <MaterialCommunityIcons name="plus" size={48} color="white" />
          </Pressable>
        </View>

        <View className="flex-row h-12 border-b border-gray-200 bg-gray-50">
          <View className="w-12 h-12 border-b border-gray-200 bg-gray-50" />
          {dates.map((date, index) => (
            <View
              key={index}
              className="flex-1 items-center justify-center px-6"
            >
              <Text className="font-semibold text-lg">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-1">
          <ScrollView className="flex-1">
            <View className="flex-row h-[1358px]">
              {/* Time column */}
              <View className="w-12 border-r border-gray-200">
                {Array.from({ length: 24 }, (_, i) => (
                  <TimeSlot
                    key={i}
                    hour={i}
                    isCurrentHour={i === currentHour}
                    events={[]}
                    hourHeight={48}
                    onDeleteEvent={() => {}}
                    showTime={true}
                  />
                ))}
              </View>

              {/* Day columns */}
              {dates.map((date, index) => (
                <DayColumn
                  key={index}
                  date={date}
                  currentHour={currentHour}
                  events={events.filter(
                    (event) => event.date.toDateString() === date.toDateString()
                  )}
                  onDeleteEvent={handleDeleteEvent}
                />
              ))}
              <CurrentTimeIndicator
                currentHour={currentHour}
                currentMinute={currentMinute}
              />
            </View>
          </ScrollView>
        </View>

        <EventModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onAddEvent={handleAddEvent}
          dates={dates}
        />
      </View>
    </SafeAreaView>
  );
};

export default Schedule;
