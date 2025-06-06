import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import CurrentTimeIndicator from "../components/schedule/CurrentTimeIndicator";
import DayColumn from "../components/schedule/DayColumn";
import EventModal from "../components/schedule/EventModal";

interface Event {
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
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
      setCurrentTime(new Date());
    };

    updateTime();
    
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddEvent = (event: Event) => {
    setEvents([...events, event]);
  };

  // Use device time to get the current hour and minute
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 text-uoft_black">
        <View className="flex-row items-center mt-12 mb-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text className="text-2xl font-['PPObjectSans-Heavy']">Schedule</Text>
          <Pressable 
            onPress={() => setIsModalVisible(true)}
            className="ml-auto"
          >
            <MaterialCommunityIcons name="plus-circle" size={32} color="#FF6F51" />
          </Pressable>
        </View>

        <View className="flex-1">
          <ScrollView className="flex-1">
            <View className="flex-row h-[1920px]">
              {dates.map((date, index) => (
                <DayColumn
                  key={index}
                  date={date}
                  currentHour={currentHour}
                  events={events.filter(event => 
                    event.date.toDateString() === date.toDateString()
                  )}
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
