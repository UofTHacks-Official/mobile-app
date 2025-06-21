import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toZonedTime } from "date-fns-tz";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import CurrentTimeIndicator from "../components/schedule/CurrentTimeIndicator";
import DayColumn from "../components/schedule/DayColumn";
import EventModal from "../components/schedule/EventModal";
import TimeSlot from "../components/schedule/TimeSlot";
import { fetchAllSchedules } from "../requests/schedule";
import { Schedule as ScheduleInterface, ScheduleType } from "../types/schedule";

// Map API schedule object to local Schedule type
function mapApiToSchedule(apiEvent: any): ScheduleInterface {
  const typeMap: Record<number, ScheduleType> = {
    1: "networking",
    2: "food",
    3: "activity",
  };
  return {
    id: apiEvent.schedule_id.toString(),
    title: apiEvent.schedule_name,
    description: apiEvent.schedule_description,
    startTime: apiEvent.schedule_start_time,
    endTime: apiEvent.schedule_end_time,
    date: new Date(apiEvent.schedule_start_time),
    type: typeMap[apiEvent.event_type] || "activity",
    sponsorId: apiEvent.sponsor_id,
    isShift: apiEvent.is_shift,
    shiftType: apiEvent.shift_type,
  };
}

const Schedule = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleInterface[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // June 20, 21, 22 (to match API data)
  const dates = [
    new Date(2025, 5, 20),
    new Date(2025, 5, 21),
    new Date(2025, 5, 22),
  ];

  useEffect(() => {
    const updateTime = () => {
      // Get the current time in America/Toronto timezone
      const now = new Date();
      const estTime = toZonedTime(now, "America/Toronto");
      setCurrentTime(estTime);
    };

    updateTime();

    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedules from server on mount
  useEffect(() => {
    fetchAllSchedules()
      .then((data) => {
        const mapped = data.map(mapApiToSchedule);
        setSchedules(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch schedules:", err);
      });
  }, []);

  const handleAddSchedule = (event: { title: string; startTime: string; endTime: string; date: Date; type: ScheduleType; }) => {
    const newSchedule: ScheduleInterface = {
      ...event,
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: "", // default value
      sponsorId: null, // default value
      isShift: false,   // default value
      shiftType: null, // default value
    };
    setSchedules([...schedules, newSchedule]);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId));
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
                    schedules={[]}
                    hourHeight={48}
                    onDeleteSchedule={() => {}}
                    showTime={true}
                  />
                ))}
              </View>

              {/* Day columns */}
              {dates.map((date, index) => {
                const filtered = schedules.filter((schedule) => {
                  const scheduleDate = schedule.date;
                  return (
                    scheduleDate.getFullYear() === date.getFullYear() &&
                    scheduleDate.getMonth() === date.getMonth() &&
                    scheduleDate.getDate() === date.getDate()
                  );
                });
                return (
                  <DayColumn
                    key={index}
                    date={date}
                    currentHour={currentHour}
                    schedules={filtered}
                    onDeleteSchedule={handleDeleteSchedule}
                  />
                );
              })}
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
          onAddEvent={handleAddSchedule}
          dates={dates}
        />
      </View>
    </SafeAreaView>
  );
};

export default Schedule;
